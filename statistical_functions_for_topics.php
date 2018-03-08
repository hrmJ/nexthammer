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
 * @param freq1 frequency of the word in the text
 * @param total_freq1 number of words in the text
 *
 */
function Tf_idf($frequency_A, $frequency_B){
    if($frequency_A and $frequency_B){
        return 2 * $frequency_B * log($frequency_B/$frequency_A);
    }
    else{
        return "failed";
    }

    #$freq_of_word / $words_in_text * log($number_of_texts / $tets_with_this_word)


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
