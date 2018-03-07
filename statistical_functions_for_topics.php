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
 * Count vector semantic model
 *
 * @param $frequency_A frequency of THIS word
 * @param $frequency_B frequency of the next word in the frequency list
 *
 */
function Tf_idf($frequency_A, $frequency_B){
    if($frequency_A and $frequency_B){
        return 2 * $frequency_B * log($frequency_B/$frequency_A);
    }
    else{
        return "failed";
    }
}




?>
