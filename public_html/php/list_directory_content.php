<?php

$path = '../js/engine/ShaderChunk/';
$dir = opendir($path);

$files = array();

while($file = readdir($dir)) {
    $files[] = $file;
}

echo json_encode($files);
?>
