<?php
/**
 *
 * Interacts with the database to retrieve simple information such as corpus names etc.
 *
 **/
require_once '../../../session_functions.php';
require_once '../corpus_objects/corpus_object.php';
require_once '../corpus_objects/corpus.php';

$corpusname = "pest_inter";
$corpus = new Corpus();
$corpus->SetCorpusName($corpusname)
       ->SetConfigPath("../../../../config.ini")
       ->SetConnectionToCorpus();

$data = null;

switch($_GET["action"]){
    case 'corpus_name':
        $data =  $corpus->GetName();
        break;
    case 'languages':
        $data =  json_encode($corpus->SetLanguages()->GetLanguages());
        break;
    case 'text_names':
        $data =  json_encode($corpus->GetDocumentNamesAndCodes($_GET["lang"]));
        break;
}

echo $data;

?>
