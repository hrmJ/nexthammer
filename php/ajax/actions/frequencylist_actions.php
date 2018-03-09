<?php

/**
 *
 *  Output information about one document
 *
 * @param Corpus $corpus the (empty) collection of texts that will be processed
 * @param string $codes codes of the documents that will build the $corpus 
 * @param string $code the code of the document the user wants to examine
 * @param string $lang the language of the document the user wants to examine
 *
 */
function DocumentStats($corpus, $codes, $picked_code, $lang){
    foreach($codes as $code){
        $doc = new Document();
        $doc->SetParentCorpus($corpus)
            ->SetCode($code)
            ->SetLang($lang)
            ->SetAddr();
        $corpus->AddDocument($doc);
    }

    $corpus->GetDocument($picked_code)
        ->SetTotalWords()
        ->SetNounFrequencyByLemma()
        ->CreateFrequencyTableForTopicWords();

}


?>

