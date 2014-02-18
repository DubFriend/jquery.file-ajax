(function ($) {
    'use strict';

    // $form gets set by $.fn.fileAjax
    var $form;

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

    var ajax2 = function (fig) {

        $form.submit(function (e) {
            e.preventDefault();

            console.log('ajax2');

            var formData = new FormData();

            foreach(flattenData(fig.getData()), function (value, key) {
                formData.append(key, value);
            });

            var addFiles = function (name, $file) {
                if($file.files && $file.files.length > 0) {
                    if($file.files.length === 0) {
                        formData.append(name, $file.files[0]);
                    }
                    else {
                        foreach($file.files, function (file, index) {
                            formData.append(name + '[' + index + ']', file);
                        });
                    }
                }
            };

            foreach(fig.$files, function ($file, name) {
                if($file.length === 1) {
                    addFiles(name, $file[0]);
                }
                else {
                    $file.each(function (i) {
                        addFiles(name + '[' + i + ']', this);
                    });
                }
            });

            $.ajax(excludedSet(union(fig, {
                processData : false,
                contentType: false,
                data: null,
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
                    // call user's beforeSend method if they gave one.
                    if(fig.beforeSend) {
                        fig.beforeSend.call(this, xhr, settings);
                    }
                }
            })), ['$files', 'getData']);
        });
    };

    var iframeAjax = function (fig) {

        $form.submit(function (e) {
            e.stopPropagation();

            console.log('iframeAjax');
            var generateID = function () {
                return 'file-ajax-id-' + (new Date()).getTime();
            };

            var iframeID = generateID();

            $('body').prepend('<iframe width="0" height="0" style="display:none;" ' +
                    'name="' + iframeID + '" id="' + iframeID + '"/>');

            var $iframe = $('#' + iframeID);

            $iframe.on('load', function(e) {
                var iframeContents = $iframe.contents().find('body').html();
                var response = fig.dataType && fig.dataType.toLowerCase() === 'json' ?
                    $.parseJSON(iframeContents) : iframeContents;

                fig.success(response);
                fig.complete();
            });

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
        fig.type = fig.method || fig.type;
        delete fig.method;
        if(fig.$files) {
            if(fig.type.toUpperCase() !== 'POST') {
                throw 'Forms containing $files must use the method "POST"';
            }

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
        }
        else {
            // no files in request, use standard jQuery ajax.
            console.log('standard $.ajax');
            $form.submit(function (e) {
                e.preventDefault();
                fig.data = fig.getData();
                $.ajax(excludedSet(fig), ['$files', 'getData']);
            });
        }
    };

}(jQuery));
