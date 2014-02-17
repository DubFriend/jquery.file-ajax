(function ($) {
    'use strict';

    // save reference to the original $.ajax method (gets overwritten)
    var $ajax = $.ajax;

    var ajax2 = function (fig) {
        console.log('ajax2');

        var formData = new FormData();
        foreach(fig.data, function (value, key) {
            formData.append(key, value);
        });

        foreach(fig.$files, function ($file, name) {
            if($file[0].files.length > 0) {
                console.log($file[0].files[0]);
                formData.append(name, $file[0].files[0]);
            }
        });

        $ajax(excludedSet(
            union(fig, {
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
                    if(fig.beforeSend) {
                        fig.beforeSend.call(this, xhr, settings);
                    }
                }
            }),
            ['$files']
        ));
    };

    var iframeAjax = function (fig) {
        console.log('iframeAjax');
    };

    $.ajax = function (fig) {
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
            $ajax(fig);
        }
    };

}(jQuery));
