<?php

require_once '../database_functions.php';
require_once '../string_functions.php';
require_once '../corpus_functions.php';
require_once '../session_functions.php';
require_once '../interface_functions.php';
require_once '../database_functions.php';
require_once '../string_functions.php';
require_once '../corpus_functions.php';
require_once '../session_functions.php';
require_once '../interface_functions.php';

$dbname = "pest_inter";
$con_corpus = open_connection($dbname, "../../config.ini");
$result = pg_query_params($con_corpus, "SELECT DISTINCT lang FROM librarysrc",Array());
$langs = pg_fetch_all($result);
$langs_arr = Array();
foreach($langs as $lang){
 $langs_arr[] = $lang["lang"];
}
echo json_encode($langs_arr);


?>

