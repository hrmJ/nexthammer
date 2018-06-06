<?php
/**
 *
 * Index of the new interface, especially for topic words.
 *
 */

require("php/template.php");

$layout = new Template("templates/layout.tpl");
$layout->Set("maincontent","");
$layout->Set("js_id",uniqid());
$layout->Set("css_id",uniqid());
echo $layout->Output();

?>
