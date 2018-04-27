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


/**
 *
 * List ngrams in a subcorpus / corpus
 *
 * @param Corpus $corpus the (empty) collection of texts that will be processed
 * @param string $codes codes of the documents that will build the $corpus 
 * @param string $lang the language of the subcorpus
 * @param integer $n which grams (2,3,4...)
 * @param string $lemmas should we search for lemmas and not tokens (yes/no)
 *
 */
function Ngrams($corpus, $codes, $lang, $n, $lemmas){
    $corpus->SetSubCorpus($codes, $lang)
           ->SetLang($lang)
           ->SetFilter();
    if($lemmas=="yes"){
        $corpus->filter->Lemmas();
    }
    else{
        $corpus->filter->Tokens();
    }

    $corpus->SetWordFrequenciesPerWholeCorpus()
           ->CountAllWords();

    if($n == 2){
        $corpus ->SetNgramFrequency($n)
                ->CreateNgramTable();
    }
    else if($n == 3){
        $corpus ->SetNgramFrequency(3, 0)
                ->CreateNgramTable()
                ->SetNgramFrequency(2, 0)
                ->CreateNgramTable()
                ->Count3gramLL();
    }

}


?>

