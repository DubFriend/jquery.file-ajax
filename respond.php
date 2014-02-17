<?php
$response = null;
if ($_FILES["file"]["error"] > 0) {
    $response = array('error' => $_FILES['file']['error']);
}
else {
    move_uploaded_file(
        $_FILES["file"]["tmp_name"],
        "uploads/" . $_FILES["file"]["name"]
    );

    $response = array(
        'name' => $_FILES['file']['name'],
        'type' => $_FILES['file']['type'],
        'size' => $_FILES['file']['size'],
        'tmp_name' => $_FILES['file']['tmp_name']
    );
}

echo json_encode(array_merge(
    array('FILES' => $response),
    array('POST' => $_POST)
));
?>
