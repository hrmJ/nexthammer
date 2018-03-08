<?php

/**
 *
 * A collection of multiple texts
 *
 * @param integer $total_words
 * @param Array $documents individual documents in this collection of texts
 * @param Array $noun_frequencies individual lemmas in this collection of texts and their frequencies in the whole corpus
 *
 */
class Corpus extends CorpusObject{

    protected $total_words = 0;
    protected $documents = Array();
    protected $noun_frequencies = Array();
    protected $data = null;

    /**
     * 
     * Adds a new document to this corpus
     * 
     */
        public function AddDocument($doc){
            $this->documents[] = $doc;
            return $this;
        }

        /**
         * 
         * Adds a connection to the dbmain database
         * 
         */
        public function SetConnectionToMain($con){
            $this->maincon = $con;
            return $this;
        }


        /**
         * 
         * Counts the total number of words in this collection
         * 
         */
        public function CountAllWords(){
            $total = 0;
            foreach($this->documents as $doc){
                $doc->SetTotalWords();
                $total += $doc->GetTotalWords();
            }
            $this->total_words = $total;
            return $this;
    }

    /**
     * 
     * Fetches all the lemmas of every noun in corpus and saves them into an array,
     * where the lemmas of the words are the keys and frequencies are values;
     * 
     */
    public function SetNounFrequencyByLemma(){
        foreach($this->documents as $doc){
            $doc->SetNounFrequencyByLemma($this->stopwords)
                ->FixWrongLemmasManually();
            foreach($doc->GetNounFrequencyByLemma() as $lemma => $freq){
                if (array_key_exists($lemma, $this->noun_frequencies)){
                    $this->noun_frequencies[$lemma] += $freq;
                }
                else{
                    $this->noun_frequencies[$lemma] = $freq;
                }
            }
        }
        //sort descending by freqyencies
        arsort($this->noun_frequencies);
        return $this;
    }

    /**
     * 
     * Gets the frequency table
     * 
     */
    public function GetNounFrequencyByLemma(){
        return $this->noun_frequencies;
    }

    /**
     * 
     * Creates a frequency list for outputting. Adds Naive Bayes and 
     * other classification measures as columns.
     * 
     */
    public function CreateFrequencyTableForTopicWords(){
        $this->data = Array();
        $coef_of_succes = 0.95;
        $fail_score = 0.05;
        foreach($this->noun_frequencies as $lemma => $freq){
            $nb = NaiveBayes($this->total_words, $freq,  $coef_of_succes, $fail_score);
            $this->data[] = Array(
                "lemma" => $lemma,
                "freq" => $freq,
                "nb" => $nb
            );
        }
        return $this;
    }


    /**
     * 
     * Fetches all the lemmas that the user wants to exclude from frequency lists
     * 
     */
    public function SetStopWords(){
        $result = pg_query_params($this->maincon, "SELECT DISTINCT lemma FROM topicwords_stopwords",Array());
        $this->stopwords = pg_fetch_all_columns($result); 
        if(!$this->stopwords){
            //If no stopwords set, use one nonsesical
            $this->stopwords = Array("lklksajldkasldkjsaldkjalkds");
        }
    }


    /**
     * 
     * Outputs the data peoduced in json format
     * 
     */
    public function OutputJson(){
        echo json_encode($this->data);
    }

}



?>
