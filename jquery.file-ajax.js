(function ($) {
    'use strict';

    // $form gets set by $.fn.fileAjax
    var $form;

    var doesEndWithBrackets = function (string) {
        return (/\[\]$/).test(string);
    };

    var insertIndexIntoBrackets = function (string, index) {
        return string.substring(0, string.length - 1) + index + ']';
    };

    // unnamed inputs are ignored.
    var groupInputsByNameAttribute = function ($elems) {
        var grouped = {};
        $elems.each(function () {
            var name = $(this).attr('name');
            if(name) {
                if(!grouped[name]) {
                    grouped[name] = [];
                }
                grouped[name].push($(this));
            }
        });
        return grouped;
    };

    var getNonFileInputs = function () {
        return $form.find(
            'input[type="checkbox"], ' +
            'input[type="radio"], ' +
            'input[type="text"], ' +
            'input[type="hidden"], ' +
            'textarea, ' +
            'select'
        );
    };

    var getData = function (figGetData) {
        var flattenData = function (data) {
            var formatted = {};
            foreach(data, function (value, name) {
                (function recurse (name, value) {
                    if(isObject(value) || isArray(value)) {
                        foreach(value, function (val, key) {
                            recurse(name + '[' + key + ']', val);
                        });
                    }
                    else {
                        formatted[name] = value;
                    }
                }(name, value));
            });
            return formatted;
        };

        var getFormsData = function () {
            var grouped = groupInputsByNameAttribute(getNonFileInputs());

            var data = {};

            var addData = function ($input, name) {
                var isCheckBoxOrRadio = function () {
                    return $input.is('input[type="checkbox"]') ||
                           $input.is('input[type="radio"]');
                };

                var getInputsValue = function () {
                    if($input.is('textarea')) {
                        return $input.html();
                    }
                    else if(isCheckBoxOrRadio()) {
                        if($input.is(':checked')) {
                            return $input.val();
                        }
                    }
                    else {
                        return $input.val();
                    }
                };

                var value = getInputsValue();
                if(isCheckBoxOrRadio() && value || !isCheckBoxOrRadio()) {
                    data[name] = value;
                }
            };

            foreach(grouped, function (inputGroup, name) {
                if(doesEndWithBrackets(name)) {
                    foreach(inputGroup, function ($input, index) {
                        addData($input, insertIndexIntoBrackets(name, index));
                    });
                }
                else if(inputGroup.length > 1) {
                    foreach(inputGroup, function ($input) {
                        addData($input, name);
                    });
                }
                else {
                    addData(inputGroup[0], name);
                }
            });

            return data;
        };

        return figGetData ? flattenData(figGetData()) : getFormsData();
    };

    var extractMetaDataFromResonse = function (text) {
        var data = text.match(/#@#.*#@#/igm);
        if(data && data[0]) {
            data = data[0].substring(3, data[0].length - 3);
            data = $.parseJSON(data);
            return data;
        }
        else {
            return null;
        }
    };

    var extractBodyFromResponse = function (text) {
        return text.replace(/#@#.*#@#/igm, '');
    };

    var ajax2 = function (fig) {
        // get object of $fileElements where the keys are
        // names formatted for a FormData object.
        var getFileElements = function () {
            // inserts indexed numbers into braketed items.
            // ex: "file[]", "file[]" -> "file[0]", "file[1]"
            var formatName = function (rawName, index) {
                // test if ends in brackets
                return doesEndWithBrackets(rawName) ?
                    insertIndexIntoBrackets(rawName, index) : rawName;
            };

            var grouped = groupInputsByNameAttribute(
                $form.find('input[type="file"]')
            );

            var elements = {};
            foreach(grouped, function (elems, name) {
                foreach(elems, function ($el, index) {
                    elements[formatName(name, index)] = $el;
                });
            });
            return elements;
        };


        $form.submit(function (e) {
            console.log('ajax2');
            e.preventDefault();

            var formData = new FormData();

            foreach(getData(), function (value, key) {
                formData.append(key, value);
            });

            foreach(getFileElements(), function ($file, name) {
                var file = $file[0];
                if(file.files.length > 0) {
                    if(file.files.length === 0) {
                        formData.append(name, file.files[0]);
                    }
                    else {
                        foreach(file.files, function (file, index) {
                            formData.append(name + '[' + index + ']', file);
                        });
                    }
                }
            });

            $.ajax(excludedSet(union(fig, {
                processData : false,
                contentType: false,
                data: null,
                dataType: 'text',
                beforeSend : function(xhr, settings) {
                    settings.xhr = function () {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.onprogress = bind(this, fig.onprogress);
                        xhr.upload.onload = bind(this, fig.onload);
                        xhr.upload.onerror = bind(this, fig.onerror);
                        xhr.upload.onabort = bind(this, fig.onabort);
                        return xhr;
                    };
                    settings.data = formData;
                    if(fig.beforeSend) {
                        fig.beforeSend();
                    }
                },
                success: function (response, textStatus, jqXHR) {
                    var metaData = extractMetaDataFromResonse(response);
                    response = extractBodyFromResponse(response);
                    if(fig.dataType.toLowerCase() === 'json') {
                        response = $.parseJSON(response);
                    }
                    if(fig.success) {
                        fig.success(response, metaData);
                    }
                },
                error: function (jqXHR) {
                    var metaData = extractMetaDataFromResonse(jqXHR.responseText);
                    var response = extractBodyFromResponse(jqXHR.responseText);
                    if(fig.dataType.toLowerCase() === 'json') {
                        response = $.parseJSON(response);
                    }

                    if(fig.error) {
                        fig.error(response, metaData);
                    }
                },
                complete: function () {
                    if(fig.complete) {
                        fig.complete();
                    }
                }
            })), ['$files', 'getData']);
        });
    };

    var iframeAjax = function (fig) {
        $form.submit(function (e) {
            console.log('iframeAjax');
            e.stopPropagation();

            var iframeID = 'file-ajax-id-' + (new Date()).getTime();

            $('body').prepend('<iframe width="0" height="0" style="display:none;" ' +
                    'name="' + iframeID + '" id="' + iframeID + '"/>');

            var nonFileElements = {};
            getNonFileInputs().each(function () {
                var name = $(this).attr('name');
                if(name) {
                    nonFileElements[name] = $(this);
                }
            });

            var removeNonFileInputsNames = function () {
                foreach(nonFileElements, function ($el) {
                    $el.removeAttr('name');
                });
            };

            var restoreNonFileInputsNames = function () {
                foreach(nonFileElements, function ($el, name) {
                    $el.attr('name', name);
                });
            };

            var $iframe = $('#' + iframeID);

            $iframe.on('load', function(e) {
                var responseText = $iframe.contents().find('body').html();
                var metaData = extractMetaDataFromResonse(responseText);
                var response = extractBodyFromResponse(responseText);

                response = fig.dataType && fig.dataType.toLowerCase() === 'json' ?
                        $.parseJSON(response) : response;

                if(metaData && metaData.status >= 200 && metaData.status < 300) {
                    fig.success(response, metaData);
                }
                else {
                    fig.error(response, metaData);
                }

                restoreNonFileInputsNames();
                removeHiddenInputs();
                $iframe.remove();
                fig.complete();
            });

            // need getData before removeNonFileInputsNames
            var data = getData();
            // remove names of existing inputs so they are not sent to the server
            // send the data given by getData instead.
            removeNonFileInputsNames();
            var hiddenInputs = [];
            foreach(data, function (value, name) {
                var $hidden = $(
                    '<input type="hidden" ' +
                           'name="' + name + '" ' +
                           'value="' + value + '"/>'
                );
                $form.append($hidden);
                hiddenInputs.push($hidden);
            });

            var removeHiddenInputs = function () {
                foreach(hiddenInputs, function ($el) {
                    $el.remove();
                });
            };

            $form.attr({
                target: iframeID,
                action: fig.url,
                method: 'POST',
                enctype: 'multipart/form-data'
            });
        });
    };

    $.fn.fileAjax = function (fig) {
        $form = $(this);

        if(!$form.is('form')) {
            throw 'selected element must be a form element';
        }

        fig.type = 'POST';
        fig.url = fig.url || $form.attr('action');

        getData = partial(getData, fig.getData);

        if(
            $.support.ajax &&
            typeof FormData !== "undefined" &&
            fig.forceIFrame !== true
        ) {
            ajax2(fig);
        }
        else {
            iframeAjax(fig);
        }
    };

}(jQuery));
