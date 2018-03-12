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
    $corpus->SetSubCorpus($codes, $lang);
    $corpus->GetDocument($picked_code)
        ->SetTotalWords()
        ->SetNounFrequencyByLemma()
        ->CreateFrequencyTableForTopicWords();
}

/**
 *
 *  Output information about a whole subcorpus
 *
 * @param Corpus $corpus the (empty) collection of texts that will be processed
 * @param string $codes codes of the documents that will build the $corpus 
 * @param string $lang the language of the subcorpus
 *
 */
function SubcorpusStats($corpus, $codes, $lang){
    $corpus->SetSubCorpus($codes, $lang);
    $corpus->SetNounFrequencyByLemma()
        ->CountAllWords()
        ->CreateFrequencyTableForTopicWords();
}


?>

