<?php
/**
 *
 * Interacts with the database to retrieve or add general (meta)data concerning
 * the corpora. In addition, gives the user possibilities to manage e.g. stopwords
 *
 **/
require_once '../session_functions.php';
require_once '../corpus_objects/corpus_object.php';
require_once '../corpus_objects/corpus.php';

$corpusname = "pest_inter";
$corpus = new Corpus();
$corpus->SetConfigPath("../../../config.ini")
    ->SetConnectionToMain()
    ->SetStopWords();

$data = "";

switch($_GET["action"]){
    case 'list_stopwords':
        $data =  json_encode($corpus->GetStopWords());
        break;
    case 'insert_stopword':
        $corpus->AddNewStopWord($_GET["new_word"]);
}

echo $data;

?>
