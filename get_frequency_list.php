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
require_once 'actions/frequencylist_actions.php';


$dbname = "pest_inter";
$corpus = new Corpus();
$corpus->SetConnectionToCorpus(open_connection($dbname, "../../config.ini"))
       ->SetConnectionToMain(open_connection("dbmain", "../../config.ini"))
       ->SetStopWords();

switch($_GET["action"]){
    case "examine_text":
        DocumentStats($corpus, $_GET["codes"], $_GET["picked_code"], $_GET["lang"]);
        $corpus->GetDocument($_GET["picked_code"])->OutputJson();
        break;
}



#$corpus->CountAllWords()
#       ->SetNounFrequencyByLemma()
#       ->CreateFrequencyTableForTopicWords()
#       ->OutputJson();

?>

