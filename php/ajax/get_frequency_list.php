<?php

require '../../vendor/autoload.php';
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
       ->SetConfigPath("../../../config.ini")
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
        if(isset($_GET["bylang"])){
            $corpus->CleanDataFromString("#","lemma")->SimplifyDataByVariable("lemma");
            echo json_encode([$_GET["lang"] => $corpus->GetData()]);
        }
        else{
            $corpus->OutputJson();
        }
        break;
    case "corpus_ngram_list":
        if(Ngrams($corpus,
            $_GET["codes"], 
            $_GET["lang"],
            $_GET["n"],
            $_GET["lemmas"],
            (isset($_GET["must_include"]) ? $_GET["must_include"] : ""),
            (isset($_GET["ldr_paradigm"]) ? BuildNgramPatterns($_GET["n"], $_GET["ldr_paradigm"]) : []),
            (isset($_GET["included_word_lemma"]) ? $_GET["included_word_lemma"] : FALSE)
        )){
            if(isset($_GET["bylang"])){
                echo json_encode([$_GET["lang"] => $corpus->GetData()]);
            }
            else{
                $corpus->OutputJson();
            }
        }
        else{
            //if dealing with an ngram that has to be skipped for some reason
            echo json_encode([]);
        }
        break;
    case "lrd_ngram_list":
        if(Ngrams($corpus,
            $_GET["codes"], 
            $_GET["lang"],
            $_GET["n"],
            $_GET["lemmas"],
            (isset($_GET["must_include"]) ? $_GET["must_include"] : ""),
            (isset($_GET["ldr_paradigm"]) ? BuildNgramPatterns($_GET["n"], $_GET["ldr_paradigm"]) : []),
            (isset($_GET["included_word_lemma"]) ? $_GET["included_word_lemma"] : FALSE))){
            echo json_encode( [
                    $_GET["lang"] => [
                        $_GET["lrd_rank"] => [
                            $_GET["n"] => $corpus->GetData()
                        ]
                    ]
                ]);
        }else{
            echo json_encode( [
                    $_GET["lang"] => [
                        $_GET["lrd_rank"] => [
                            $_GET["n"] => [""]
                        ]
                    ]
                ]);
        }
        break;
    case "GetTranslations":
        $translations = FindPossibleTranslations([$_GET["source_word"]], $_GET["langs"]);
        echo json_encode($translations);
        break;
}



?>

