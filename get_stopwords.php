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

$dbname = "dbmain";
$con_corpus = open_connection($dbname, "../../config.ini");
if($_GET["do"] == "read"){
    $result = pg_query_params($con_corpus, "SELECT DISTINCT lemma FROM topicwords_stopwords",Array());
    $langs = pg_fetch_all($result);
    $langs_arr = Array();
    foreach($langs as $lang){
     $langs_arr[] = $lang["lemma"];
    }
    echo json_encode($langs_arr);
}
else{
    $result = pg_query_params($con_corpus, "INSERT INTO topicwords_stopwords (lemma) VALUES ($1)",Array($_GET["newlemma"]));
}


?>

