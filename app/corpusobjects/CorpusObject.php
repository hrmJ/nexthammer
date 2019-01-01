<?php

namespace App\Corpusobjects;
use Utilities;

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
 * @param Array $word_frequencies individual words in this collection of texts / document + their frequencies
 * @param Array $ngram_frequencies ngrams in this collection of texts / document  + their frequencies
 * @param Filter $filter An object for conbtrolling what will be filtered out from e.g. frequenc lists
 *
 */
class CorpusObject{

    protected $data = Array();
    public $corpuscon = null;
    protected $configpath = "";
    protected $total_words = 0;
    protected $noun_frequencies = Array();
    protected $word_frequencies = Array();
    protected $ngram_frequencies = Array();
    public $filter = null;


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
     * Simplifies the data by using one parametr of a multidimensional
     * array.
     *
     * @param $key the parameter
     * 
     */
    public function SimplifyDataByVariable($key){
        $temp = [];
        foreach($this->data as $row){
            $temp[] = $row[$key];
        }
        $this->data = $temp;
        return $this;
    }

    /**
     * 
     * Cleans up unwanted symbols etc from data
     *
     * @param $to_be_cleaned the string that we want to get rid of
     * @param $key if set, the data will be cleaned from a specific parameter only
     * 
     */
    public function CleanDataFromString($to_be_cleaned, $key=null){
        foreach($this->data as $r_idx => $row){
            if($key){
                $this->data[$r_idx][$key] = str_replace($to_be_cleaned, "", $this->data[$r_idx][$key]);
            }
            else{
                $this->data[$r_idx] = str_replace($to_be_cleaned, "", $this->data[$r_idx]);
            }
        }
        return $this;
    }


    /**
     * 
     * Splits data rows based on a pattern 
     *
     * @param $pat the pattern to be used for splitting
     * 
     */
    public function DelimitDataByString($pat, $key){
        foreach($this->data as $r_idx => $row){
            if($key){
                $new_entries = explode($pat, $row[$key]);
                foreach($new_entries as $entry){
                    $temp = $row;
                    $temp[$key] = $entry;
                    $this->data[] = $temp;
                }
            }
        }
        return $this;
    }

    /**
     * 
     * Sets the language;
     * 
     */
    public function SetLang($lang){
        $this->lang = $lang;
        return $this;
    }


    /**
     * Get the corpuscon; just for testing.
     *
     **/
    public function GetCorpusCon(){
        return $this->corpuscon;
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
     *  Get the frequency list set by SetWordFrequencies
     */
    public function GetWordFrequencies(){
        return $this->word_frequencies;
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
        $this->maincon = Utilities::open_connection("dbmain");
        return $this;
    }

    /**
     * 
     * Sets up a filter to limit the results to e.g. lemmas or nouns
     * 
     */
    public function SetFilter(){
        $this->filter = new Filter();
        return $this;
    }


}

?>
