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

function PickNoun($lang){
    //Select the correct tag representing nouns
    switch($lang){
        case "fi":
            return Array("Noun");
        case "sv":
            return Array("NN");
        case "fr":
            return Array("NC");
        case "ru":
            return Array("N");
        case "en":
            return Array("NNP","NN");
    }
}


function CreatePgInPattern($vals, $startno){
    $prepared = Array();
    foreach($vals as $key=> $vals){
        $key =  $key + $startno;
        $prepared[] = "\${$key}";
    }
    return $prepared;
}

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

//GET the nouns from the texts
$pos_table = "pos_{$_GET["lang"]}";
$lemma_table = "lemma_{$_GET["lang"]}";
$all_ids = Array();
foreach($addresses as $address){
    $unprepared = PickNoun($_GET["lang"]);
    $prepared = implode(', ', CreatePgInPattern($unprepared, 3));
    $query = "SELECT linktotext FROM $pos_table 
              WHERE pos IN ($prepared) AND id between $1 AND $2";
    $result = pg_query_params($con_corpus,$query,
                              array_merge(Array($address["startaddr"],$address["finaddr"]), $unprepared));
    $all_ids = array_merge($all_ids, pg_fetch_all_columns($result));
}


//Make the frequency table
$conn = open_connection($dbname);
$idstring = implode(', ', $all_ids);
$query = "SELECT lemma, count(*) FROM $lemma_table WHERE linktotext IN ($idstring) Group By lemma ORDER BY count DESC";
$result = pg_query($query) or die(pg_last_error());
$freqs = pg_fetch_all($result);
pg_close($conn);

echo json_encode($freqs);


?>

