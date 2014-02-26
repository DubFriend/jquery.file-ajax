<?php

function setJqueryFileAjaxResponseCode ($response, $httpResponseCode = 200) {
    // setting actual response code to an error response breaks ie8
    // dont -> http_response_code($httpResponseCode); if set to an error code
    return $response . '';
    // '#@#' . json_encode(array('status' => $httpResponseCode)) . '#@#';
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
        $resultsArray = array();
        foreach(unzipFiles($file) as $f) {
            $resultsArray[] = uploadFile($f);
        }
        return $resultsArray;
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
    array('POST' => $_POST),
    array('status' => 200)
)), 400);
?>
