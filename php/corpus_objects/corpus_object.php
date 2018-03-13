<?php


/**
 *
 * Individual texts, words etc in a corpus or a smaller set of texts
 *
 *
 * @param integer $total_words total numner of words in a document / corpus
 * @param Array $data The data that this object might want to output
 * @param Connection $corpuscon to the database of the corpus
 * @param string $configpath path to config.ini
 * @param Array $noun_frequencies individual lemmas in this collection of texts / document + their frequencies
 * @param Array $ngram_frequencies ngrams in this collection of texts / document  + their frequencies
 *
 */
class CorpusObject{

    protected $data = Array();
    protected $corpuscon = null;
    protected $configpath = "";
    protected $total_words = 0;
    protected $noun_frequencies = Array();
    protected $ngram_frequencies = Array();


    /**
     * 
     * Outputs the data peoduced in json format
     * 
     */
    public function OutputJson(){
        echo json_encode($this->data);
    }

    /**
     * 
     * Sets the path to the config file
     * 
     */
    public function SetConfigPath($path){
        $this->configpath = $path;
        return $this;
    }

    /**
     * 
     * Gets the data of this object
     * 
     */
    public function GetData(){
        return $this->data;
    }

    /**
     *  Get the frequency list set by SetNounFrequencyByLemma
     */
    public function GetNounFrequencyByLemma(){
        return $this->noun_frequencies;
    }


    /**
     *  Get the frequency list set by SetNounFrequencyByLemma
     */
    public function GetNgramFrequency(){
        return $this->ngram_frequencies;
    }

    /**
     * 
     * Adds a connection to the dbmain database
     * 
     */
    public function SetConnectionToMain(){
        $this->maincon = open_connection("dbmain", $this->configpath);
        return $this;
    }


}

?>
