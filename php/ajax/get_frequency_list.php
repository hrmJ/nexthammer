<?php

//General imports:
require_once '../session_functions.php';

//Specially for topics:
require_once '../statistical_functions_for_topics.php'; require_once '../small_utilities.php';
require_once '../corpus_objects/corpus_object.php';
require_once '../corpus_objects/document.php';
require_once '../corpus_objects/corpus.php';
require_once '../corpus_objects/Filter.php';
require_once 'actions/frequencylist_actions.php';


$corpusname = "pest_inter";
$corpus = new Corpus();
$corpus->SetCorpusName($corpusname)
       ->SetConfigPath("../../../../config.ini")
       ->SetConnectionToCorpus()
       ->SetConnectionToMain()
       ->SetStopWords();

switch($_GET["action"]){
    case "examine_text":
        DocumentStats($corpus, $_GET["codes"], $_GET["picked_code"], $_GET["lang"]);
        $corpus->GetDocument($_GET["picked_code"])->OutputJson();
        break;
    case "corpus_frequency_list":
        SubcorpusStats($corpus, $_GET["codes"], $_GET["lang"]);
        $corpus->OutputJson();
        break;
    case "corpus_ngram_list":
        Ngrams($corpus,
            $_GET["codes"], 
            $_GET["lang"],
            $_GET["n"],
            $_GET["lemmas"],
            (isset($_GET["must_include"]) ? $_GET["must_include"] : ""),
            (isset($_GET["ldr_paradigm"]) ? BuildNgramPatterns($_GET["n"], $_GET["ldr_paradigm"]) : []),
            (isset($_GET["included_word_lemma"]) ? $_GET["included_word_lemma"] : FALSE)
        );
        $corpus->OutputJson();
        break;
    case "LRDtab":
        echo json_encode(["MORO",$_GET["picked_code"]]);
        break;
}



?>

