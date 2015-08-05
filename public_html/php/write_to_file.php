<?php
$file = fopen('../export/export.txt', 'w') or die('Unable to open file!');
$text = $_POST['code'];
fwrite($file, $text);
fclose($file);

echo $text;
?>
