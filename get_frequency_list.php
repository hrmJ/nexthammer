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
require_once 'statistical_functions_for_topics.php';

function PickNoun($lang){
    //Select the correct tag representing nouns
    switch($lang){
        case "fi":
            return Array("NOUN");
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

function FilterSymbols($lemma){
    //Filter unwanted symbols from word
    return preg_replace("(\.|,|!|:|;|-|—|\?)", "", $lemma);
}

function FilterThisWord($this_word){
    $lemma = FilterSymbols($this_word["lemma"]);
    if(mb_strlen($lemma, 'UTF-8') < 3 and $lemma!= "år"){
        return false;
    }
    return true;
}

function CreatePgInPattern($vals, $startno){
    $prepared = Array();
    foreach($vals as $key=> $vals){
        $key =  $key + $startno;
        $prepared[] = "\${$key}";
    }
    return $prepared;
}


//Get  list of stopwords
$dbname = "dbmain";
$con_corpus = open_connection($dbname, "../../config.ini");
$result = pg_query_params($con_corpus, "SELECT DISTINCT lemma FROM topicwords_stopwords",Array());
$stopwords = pg_fetch_all($result);
$stopwords_arr = Array();
foreach($stopwords as $lang){
     $stopwords_arr[] = "'{$lang["lemma"]}'";
}


$dbname = "pest_inter";
$codes = Array();
foreach($_GET["codes"] as $code){
    $codes[] = "'$code'";
}
$valuelist = implode(', ', $codes);
$query = "SELECT startaddr, finaddr FROM librarysrc WHERE code IN ($valuelist)";
$conn = open_connection($dbname, "../../config.ini");
$result = pg_query($query) or die(pg_last_error());
$addresses = pg_fetch_all($result);
pg_close($conn);

$con_corpus = open_connection($dbname, "../../config.ini"); 
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
$conn = open_connection($dbname, "../../config.ini");
$idstring = implode(', ', $all_ids);
$stopword_string = implode(', ', $stopwords_arr);
if(!$stopwords_arr){
    $stopword_string = "'laksjfdlasdo9auraoioijflakjflaskjf'";
}
$query = "SELECT lemma, count(*) FROM $lemma_table WHERE linktotext IN ($idstring) AND lemma NOT IN ($stopword_string) Group By lemma ORDER BY count DESC";
$result = pg_query($query) or die(pg_last_error());
$all_words = pg_fetch_all($result);
//Get total frequency of words 
$query = "select  sum(q.count) FROM (SELECT lemma, count(*) FROM $lemma_table WHERE linktotext IN ($idstring) Group By lemma ORDER BY count DESC) as q";
$result = pg_query($query) or die(pg_last_error());
$sum = pg_fetch_row($result)[0];
pg_close($conn);

$coef_of_succes = 0.95;
$fail_score = 0.05;

//Count naive bayes
$freq_table = Array();
foreach($all_words as $row_number=> $this_word){
    if (FilterThisWord($this_word)){ 
        $frequency_of_next_word = ($row_number + 1 <= sizeof($all_words) ? $all_words[$row_number + 1]["count"] : 0);
        $nb = NaiveBayes($sum, $this_word["count"],  $coef_of_succes, $fail_score);
        if($nb > 0){
            //filter out the ones with negative NB
            $freq_table[] = Array("lemma"=>$this_word["lemma"],
                                  "freq"=>$this_word["count"],
                                  "nb"=>$nb,
                                  "vsm"=> Vsm($this_word["count"], $frequency_of_next_word)
                              );
        }
    }
}

echo json_encode($freq_table);


?>

