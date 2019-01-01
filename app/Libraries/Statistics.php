<?php


class Statistics {


    /**
     *
     */
    public static function NaiveBayes($total_word_freq, $freq, $coef_of_succes, $fail_score){

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
    public static function Tf_idf($freq_of_word_in_this_text, $words_in_text, $number_of_texts_in_corpus, $texts_with_this_word){

        return $freq_of_word_in_this_text / $words_in_text * log($number_of_texts_in_corpus / $texts_with_this_word);

    }



    /**
     *
     * Calculate log-likelihood for bigrams
     *
     * @param integer $freq_of_bigram the frequency of the bigram
     * @param integer $freq_bigrams_with_first the frequency of those bigrams that have the first word but not the second
     * @param integer $freq_1 frequency of the first word
     * @param integer $freq_2 frequency of the second word
     * @param integer $corpus_size how many words in the corpus
     *
     **/
    public static function LogLikeLihood($freq_of_bigram, $freq_bigrams_with_first, $freq_1, $freq_2, $corpus_size){

        if($freq_of_bigram === 0){
            $freq_of_bigram =  ($freq_of_bigram + 1) * $freq_bigrams_with_first / ($corpus_size + $freq_bigrams_with_first);
        }


        $numerator = $freq_of_bigram  * ($freq_1 + $freq_2);
        $denominator = ($freq_of_bigram + $freq_bigrams_with_first);
        $expected_value = $numerator / $denominator;


        $log_likelihood = (-2 * $freq_of_bigram  * log($freq_of_bigram / $expected_value));

        return $log_likelihood;

    }



    /**
     *
     * Calculate Mutual information for nrams
     *
     * @param integer $freq_of_bigram the frequency of the bigram
     * @param integer $freq_1 frequency of the first word
     * @param integer $freq_2 frequency of the second word
     * @param integer $corpus_size how many words in the corpus
     *
     **/
    public static function PMI($freq_of_bigram,  $freq_1, $freq_2, $corpus_size){

        try{
            $numerator = $freq_of_bigram  * ($freq_of_bigram / $corpus_size);
            $denominator = ($freq_1 / $corpus_size) * ($freq_2 / $corpus_size);
            $result = log($numerator / $denominator);
        }
        catch(Exception  $e){
            $result = "bigram as freq of 0!";
        }

        return  $result;

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
    // 1. Отсекаем минусовые по NB (?)
    // 2. если tf_idf = 0
    // 3. порог
    //
    //
    //

}

?>
