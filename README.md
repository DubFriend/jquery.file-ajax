#jquery.file-ajax

##Cross Browser Ajax File Uploads.

To use include `jquery.file-ajax.js` after your jQuery file.  Target an html
form containing the file inputs that you want to make uploadable.

file-ajax aims to follow the existing jQuery.ajax api as closely as possible.
```javascript
$('#file-ajax-form').fileAjax({
    // optional: url defaults to the form's action attribute
    url: 'respond.php',

    // optional: if validate is present and returns false then the submission
    // will be cancelled.
    validate: function () {
        return isValid() ? true : false;
    }

    // optional: getData populates the request with the returned data, along
    // with the targeted forms file inputs.  Defaults to the targeted form's
    // named input values (sends the forms data in the same format it would be
    // if not making an ajax request).
    getData: function () {
        return {
            array: ['a', 'b'],
            object: { a: 1, b: [9, 10] }
        };
    },

    // optional: dataType defaults to plain text. JSON is currently the only
    // other supported data type.
    dataType: 'json',

    // optional: onprogress will only be called in browsers that support XHR2
    onprogress: function (e) {
        if(e.lengthComputable) {
            $('.percent-complete').html(e.loaded / e.total);
        }
    },

    // optional: called just before the request.
    beforeSend: function () {
        console.log('beforeSend');
    },

    // optional: called if the supplied metaData.status value is absent, or if
    // the status is between 200 and 299.  All other status codes will trigger
    // the error callback instead. (Note that for some browsers that use the
    // iframe fallback, a response with an actual http response code that is of
    // type error will not be processed at all)
    // You may optionally provide the status in the reponse instead of metaData
    // if using dataType "json".
    success: function (response, metaData) {
        console.log('success', response, metaData);
    },

    // optional: called if status not absent, and status is
    // between 200 and 299.
    error: function (response, metaData) {
        console.log('error', response, metaData);
    },

    // optional: called after either success or error.
    complete: function () {
        console.log('complete');
    }
});
```

##Return Meta Data.

file-ajax uses XHR2 in browsers that support it, and falls back to an invisible
iframe for older browsers.  Iframes do not allow access to response headers
through javascript.  So as to maintain a consistent api across browsers, this
type of information can be spoofed on the server.

enclose any metadata (json) in the response body with the delimeter "#@#".

```php
echo $restOfResponse . '#@#' . json_encode(array('status' => 404)) . '#@#';
```

in order to trigger jquery.file-ajax's error response, a status value not
between 200, and 299 should be supplied in the meta data.  The actual http
response status will not be used (to maintain consistent behavior with
older browsers)

jquery.file-ajax supports file inputs with the "multiple" attribute, but
currently does not supply a fallback for browsers that do not support the
"multiple" attribute.


Tested in Chrome, Firefox and IE8.
