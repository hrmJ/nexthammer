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
 * @param integer $freq_of_word the frequency of this particular word in the whole corpus
 * @param integer $words_in_text total number
 * @param integer $texts_with_this_word number of texts where this word occures
 *
 */
function Tf_idf($freq_of_word, $words_in_text, $number_of_texts, $texts_with_this_word){

    #$freq_of_word / $words_in_text * log($number_of_texts / $texts_with_this_word)

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



?>
