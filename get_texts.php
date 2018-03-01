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
$con_corpus = open_connection($dbname);
$result = pg_query_params($con_corpus, "SELECT DISTINCT title, code FROM librarysrc WHERE lang = $1",Array($_GET["lang"]));
$texts = pg_fetch_all($result);
echo json_encode($texts);


?>

