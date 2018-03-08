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
    #$codes = Array("un_chemicals_convention_1990_en","un_compensation_farming_1921_en");
    #$lang = "en";
    $codes = Array("mini_age_sea_1936_fr", "un_association_agriculture_1921_fr", "un_cert_able_seamen_1946_fr", "un_cert_employment_service_1948_fr", "un_cert_ship_cooks_1946_fr", "un_chemicals_convention_1990_fr", "un_compensation_farming_1921_fr", "un_equality_treatment_workers_1925_fr", "un_food_catering_ship_1946_fr", "un_forced_labour_1930_fr", "un_forty_hour_week_1935_fr", "un_freedom_association_1948_fr", "un_home_work_convention_1996_fr", "un_hours_work_commerce_offices_1930_fr", "un_ind_eight_hours_week_1919_fr", "un_indigenous_and_tribal_1989_fr", "un_industrial_accidents_1993_fr", "un_labour_inspection_1996_fr", "un_labour_inspectorates_1947_fr", "un_marking_of_weight_1929_fr", "un_maternity_protection_1919_fr", "un_maternity_protection_2000_fr", "un_medical_young_sea_1921_fr", "un_medic_exam_sea_1946_fr", "un_medic_exam_young_ind_1946_fr", "un_medic_exam_young_non_ind_1946_fr", "un_mini_wage_fix_1928_fr", "un_night_work_convention_1990_fr", "un_night_work_women_1934_fr", "un_night_work_women_1948_fr", "un_officer_competency_1936_fr", "un_priv_employment_agen_1997_fr", "un_protect_worker_claims_1992_fr");
    $lang = "fr";
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

