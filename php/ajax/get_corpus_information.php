<?php
/**
 *
 * Interacts with the database to retrieve simple information such as corpus names etc.
 *
 **/
require_once '../session_functions.php';
require_once '../corpus_objects/corpus_object.php';
require_once '../corpus_objects/corpus.php';

$corpus = new Corpus();
$corpus->SetConfigPath("../../../../config.ini");
$data = null;

if($_GET["action"] == "corpus_name"){
    //TODO: so far just a mock
    $corpus->SetCorpusName("pest_inter");
    $data = $corpus->GetName();
}
else{
    $corpus->SetCorpusName($_GET["corpus_name"])
           ->SetConnectionToCorpus();

    switch($_GET["action"]){
        case 'languages':
            $data =  json_encode($corpus->SetLanguages()->GetLanguages());
            break;
        case 'text_names':
            $data =  json_encode($corpus->GetDocumentNamesAndCodes($_GET["lang"]));
            break;
    }
}


echo $data;

?>
