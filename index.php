<?php
/**
 *
 * Index of the new interface, especially for topic words.
 *
 */

require("php/template.php");

$layout = new Template("templates/layout.tpl");
$layout->Set("maincontent","");
echo $layout->Output();

?>
