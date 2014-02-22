#jquery.file-ajax

##Cross Browser Ajax File Uploads.

target the form you want to make ajax and call the fileAjax method on it.
The configuration follows jQuery's ajax api as closely as possible.  The
plugin falls back to a hidden iframe for browsers that do not support XHR2.
Thus some features of jQuery.ajax are not available, such as the jqXHR object.

You can however include meta data in the response.  Just wrap your meta-data in
"#@#" delimeters in the response body.  The contents inside the delimeters must
be valid JSON (do not include extra whitespace within the delimeters).  In order
that the onerror callback is functional, you should include a "status" field
inside your meta-data with a value of 200, 404 etc.  Responses with values between
200 and 299 will be call "success", all others will trigger the onerror callback.

Keep in mind that older versions of Internet Explorer will not process a response
at all if the actual response code is an error code.

###Example Usage
```javascript
$('#file-ajax-form').fileAjax({
    // url is optional, defaults to form's action attribute
    url: 'respond.php',

    // getData is optional. It will default to the forms inputs that
    // have name attributes.
    // If getData is supplied, fileAjax will still obtain
    // file inputs from the form, but will ignore other inputs.
    getData: function () {
        return {
            array: ['a', 'b'],
            object: { a: 1, b: [9, 10] }
        };
    },

    // dataType is optional, defaults to plain text, json is currently the only
    // other supported data type.
    dataType: 'json',
    // onprogress will only be called in browsers that support XHR2
    onprogress: function (e) {
        if(e.lengthComputable) {
            $('.percent-complete').html(e.loaded / e.total);
        }
    },
    beforeSend: function () {
        console.log('beforeSend');
    },
    success: function (response, metaData) {
        console.log('success', response, metaData);
    },
    error: function (response, metaData) {
        console.log('error', response, metaData);
    },
    complete: function () {
        console.log('complete');
    }
});
```

Tested in Chrome, Firefox and IE8.  It should work in all browsers but please let
me know if you encounter any problems.
