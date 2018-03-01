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
$result = pg_query($query) or die(pg_last_error());
$addresses = pg_fetch_all($result);
pg_close($conn);


$con_corpus = open_connection($dbname);

#$words = Array();

$pos_table = "pos_{$_GET["lang"]}";
$lemma_table = "lemma_{$_GET["lang"]}";
$all_ids = Array();
foreach($addresses as $address){
    $result = pg_query_params($con_corpus, "SELECT linktotext FROM $pos_table WHERE pos = $1 AND id between $2 AND $3",
                               Array("NN",$address["startaddr"],$address["finaddr"]));
    $all_ids = array_merge($all_ids, pg_fetch_all_columns($result));
}


$conn = open_connection($dbname);
$idstring = implode(', ', $all_ids);
$query = "SELECT lemma, count(*) FROM $lemma_table WHERE linktotext IN ($idstring) Group By lemma ORDER BY count DESC";
$result = pg_query($query) or die(pg_last_error());
$freqs = pg_fetch_all($result);
pg_close($conn);

echo json_encode($freqs);


?>

