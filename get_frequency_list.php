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
$codes = Array();
foreach($_GET["codes"] as $code){
    $codes[] = "'$code'";
}
$valuelist = implode(', ', $codes);
$query = "SELECT startaddr, finaddr FROM librarysrc WHERE code IN ($valuelist)";
$conn = open_connection($dbname);
$result = pg_query($query)
    or die(pg_last_error());
$addresses = pg_fetch_all($result);


$con_corpus = open_connection($dbname);

$stopwords = Array("and","this");
$stopw_string = implode(", ", $stopwords);
foreach($addresses as $address){
    $result = pg_query_params($con_corpus, "SELECT token FROM {$_GET["language_table"]} 
                                WHERE funct = $1 AND id between $2 AND $3
                                AND token not in ({$stopw_string})
                                ",
                               Array("word",$address["startaddr"],$address["finaddr"]));
    var_dump($result);
}

pg_close($conn);
#
#echo json_encode($texts);


?>

