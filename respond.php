<?php

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

// echo print_r(unzipFiles($_FILES['file']));

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

    // if ($file["error"] > 0) {
    //     return array('error' => $file['error']);
    // }
    // else {
    //     move_uploaded_file(
    //         $file["tmp_name"],
    //         "uploads/" . $file["name"]
    //     );

    //     return array(
    //         'name' => $file['name'],
    //         'type' => $file['type'],
    //         'size' => $file['size'],
    //         'tmp_name' => $file['tmp_name']
    //     );
    // }
}

$response = uploadFile($_FILES['file']);

// $response = array();

// foreach($_FILES['file'] as $file) {
//     $response[] = uploadFile($file);
// }



// foreach(is_array($_FILES['file']) ? $_FILES['file'] : array($_FILES['file']) as $file) {
//     uploadFile($file);
// }

// if ($_FILES["file"]["error"] > 0) {
//     $response = array('error' => $_FILES['file']['error']);
// }
// else {
//     move_uploaded_file(
//         $_FILES["file"]["tmp_name"],
//         "uploads/" . $_FILES["file"]["name"]
//     );

//     $response = array(
//         'name' => $_FILES['file']['name'],
//         'type' => $_FILES['file']['type'],
//         'size' => $_FILES['file']['size'],
//         'tmp_name' => $_FILES['file']['tmp_name']
//     );
// }

echo json_encode(array_merge(
    array('FILES' => $response),
    array('POST' => $_POST)
));
?>
