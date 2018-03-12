<?php

//NOTE: ../corpus_functions.php 307

/**
 *
 */
function NaiveBayes($total_word_freq, $freq, $coef_of_succes, $fail_score){

    return log($coef_of_succes * $freq) / (log($coef_of_succes * $freq )+ log($fail_score * ($total_word_freq  - $freq)));

}


/**
 *
 * отдельно для каждого текста
 *
 * @param integer $freq_of_word_in_this_text the frequency of this particular word in this particular document
 * @param integer $words_in_text total number of words in this text
 * @param integer $number_of_texts_in_corpus total number of documents in the whole corpus
 * @param integer $texts_with_this_word number of texts where this word occures
 *
 */
function Tf_idf($freq_of_word_in_this_text, $words_in_text, $number_of_texts_in_corpus, $texts_with_this_word){

    return $freq_of_word_in_this_text / $words_in_text * log($number_of_texts_in_corpus / $texts_with_this_word);

}


/**
 *
 * Ко всему корпусу:
 *
 *
 * НО:
 *
 * 1. remove in all langs 2 most freq words
 * 2. remove all NB < 0
 *
 * @param number of documents
 * @param number of documents where this word occurs
 *
 */


// RESULT
// 1. Отсекасеми минусовые по NB (?)
// 2. если tf_idf = 0
// 3. порог
//
//

?>
