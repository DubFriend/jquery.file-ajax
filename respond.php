<?php

function setJqueryFileAjaxResponseCode ($response, $httpResponseCode = 200) {
    http_response_code($httpResponseCode);
    $id = 'file-ajax-response-code-id-' . uniqid();
    return $response . '' .
    '<script id="' . $id . '">' .
        'window.parent.jQuery.FileAjaxResponseCode(' . $httpResponseCode . ');' .
        //'var thisScript = document.getElementById("' . $id . '");' .
        //'thisScript.parentNode.removeChild(thisScript);' .
    '</script>';
}

function unzipFiles($file) {
    $files = array();

    foreach($file as $key => $value) {
        foreach($value as $index => $val) {

            if(!isset($files[$index])) {
                $files[$index] = array();
            }
            $files[$index][$key] = $val;
        }
    }

    return $files;
}

function uploadFile ($file) {
    if(is_array($file['name'])) {
        foreach(unzipFiles($file) as $f) {
            uploadFile($f);
        }
    }
    else {
        if ($file["error"] > 0) {
            return array('error' => $file['error']);
        }
        else {
            move_uploaded_file(
                $file["tmp_name"],
                "uploads/" . $file["name"]
            );

            return array(
                'name' => $file['name'],
                'type' => $file['type'],
                'size' => $file['size'],
                'tmp_name' => $file['tmp_name']
            );
        }
    }
}

$response = uploadFile($_FILES['file']);

echo setJqueryFileAjaxResponseCode(json_encode(array_merge(
    array('FILES' => $response),
    array('POST' => $_POST)
)), 200);
?>
