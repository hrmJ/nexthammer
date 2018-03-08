<?php

//General imports:
require_once '../database_functions.php';
require_once '../corpus_functions.php';
require_once '../session_functions.php';
require_once '../interface_functions.php';

//Specially for topics:
require_once 'statistical_functions_for_topics.php';
require_once 'small_utilities.php';
require_once 'corpus_objects/corpus_object.php';
require_once 'corpus_objects/document.php';
require_once 'corpus_objects/corpus.php';


if(! isset($_GET["codes"])) {
    //This is just for testing
    $codes = Array("un_chemicals_convention_1990_en","un_compensation_farming_1921_en");
    $lang = "en";
}
else{
    $codes = $_GET["codes"];
    $lang = $_GET["lang"];
}

$dbname = "pest_inter";
$corpuscon = open_connection($dbname, "../../config.ini");
$maincon = open_connection("dbmain", "../../config.ini");


$documents = Array();

$corpus = new Corpus($corpuscon);
$corpus->SetConnectionToMain($maincon)
       ->SetStopWords();


foreach($codes as $code){
    $doc = new Document($corpuscon);
    $doc->SetCode($code)
        ->SetLang($lang)
        ->SetAddr();
    $corpus->AddDocument($doc);
}

$corpus->CountAllWords()
       ->SetNounFrequencyByLemma()
       ->CreateFrequencyTableForTopicWords()
       ->OutputJson();

?>

