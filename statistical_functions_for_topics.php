<?php

function NaiveBayes($total_word_freq, $freq, $coef_of_succes, $fail_score){

    return log($coef_of_succes * $freq) / (log($coef_of_succes * $freq )+ log($fail_score * ($total_word_freq  - $freq)));

}


function Vsm($frequency_A, $frequency_B){
    echo "freq A: " .  $frequency_A . "\n";
    echo "freq B: " .  $frequency_B . "\n";
    echo "SQRT A: " . sqrt(pow($frequency_A,2)) .  "\n";
    echo "SQRT B: " . sqrt(pow($frequency_B,2)) .  "\n";
    return $frequency_A * $frequency_B   / (sqrt(pow($frequency_A,2)) * sqrt(pow($frequency_B,2)));

}


?>
