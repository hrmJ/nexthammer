<?php

namespace App\Corpusobjects;

use InPattern;
use Utilities;


/**
 *
 * One text in the corpus
 *
 * @param string $code the code of the text in the database
 * @param Array $noun_frequencies individual lemmas in this document and their frequencies
 * @param Corpus $corpus Reference to the parent corpus of the text
 *
 */
class Document extends CorpusObject{

    protected $code = "";
    protected $lang = "";
    protected $addr = Array();
    protected $corpus = null;


    /**
     * 
     * Sets the code of the texts
     * 
     */
    public function SetCode($code){
        $this->code = $code;
        return $this;
    }

    /**
     * 
     * Gets the code of the texts
     * 
     */
    public function GetCode(){
        return $this->code;
    }

    /**
     * 
     * Sets the corpus of the text
     * 
     * @param Corpus $corpus the parent corpus object
     */
    public function SetParentCorpus($corpus){
        $this->corpus = $corpus;
        return $this;
    }


    /**
     *
     * gets the address of the text in the database
     * 
     */
    public function GetAddr(){
        return $this->address;
    }


    /**
     *
     * sets the address of the text in the database
     * 
     */
    public function setaddr(){
        $result = pg_query_params($this->corpus->corpuscon,
            "select startaddr, finaddr from librarysrc where code = $1",array($this->code));
        $this->address = pg_fetch_row($result);
        return $this;
    }

    /**
     * 
     *  Fetches the total number of words in this document
     */
    public function SetTotalWords(){
        if($this->total_words === 0){
            $result = pg_query_params($this->corpus->corpuscon,
                "select count(*) FROM txt_{$this->lang} 
                WHERE id BETWEEN $1 AND $2
                AND funct = $3",
                array($this->address[0],$this->address[1], "word"));
            $this->total_words = pg_fetch_row($result)[0]*1;
        }

        return $this;
    }

    /**
     *  Gets the number of words
     */
    public function GetTotalWords(){
        return $this->total_words;
    }


    /**
     * 
     * Fetches all the ngrams from the document and counts
     * their frequency
     *
     * @param integer $n which grams (2,3,4,5...)
     * @param boolean $filtershort Whether or not to filter out short words
     * 
     */
    public function SetNgramFrequency($n, $filtershort=true){
        $wordcols = Array();
        $leadwordcols = "{$this->corpus->filter->target_col}, ";
        for($i=1;$i<=$n;$i++){
            $wordcols[] = "n$i";
            $leadwordcols .= " LEAD({$this->corpus->filter->target_col}, $i) OVER() AS n$i, ";
        };
        $leadwordcols = trim($leadwordcols," ,");
        $wordcolstring = implode(" || ' ' || ", $wordcols);
        $query = "SELECT ngram, count(*) FROM
             (SELECT $wordcolstring as ngram FROM
             (SELECT $leadwordcols FROM {$this->corpus->filter->target_table_prefix}_{$this->lang} 
                WHERE
                {$this->corpus->filter->target_col_filter}
                {$this->corpus->filter->id_col} between $1 AND $2
             ) AS q) 
             AS ngramq GROUP BY ngram  HAVING ngramq.count > 3
             ORDER BY count DESC LIMIT 1000";
        $result = pg_query_params($this->corpus->corpuscon, $query, 
            $this->address);

        $freqs = pg_fetch_all($result);
        $this->ngram_frequencies = Array();
           
        foreach($freqs as $row){
            if($row["ngram"]){
                $this->ngram_frequencies[$row["ngram"]] = $row["count"]*1;
            }
        }

        return $this;
    }

    /**
     * 
     * Fetches ngrams where a specific word is present
     * This is in order to find even the rarer ngrams for the words in the most
     * frequent ngrams
     *
     * @param integer $n which grams (2,3,4,5...)
     * @param string word the first word in the ngram
     * 
     */
    public function SetNgramFrequencyWithFirstWordSpecified($n, $word){
        $wordcols = Array();
        $leadwordcols = "{$this->corpus->filter->target_col}, ";
        for($i=1;$i<=$n;$i++){
            $wordcols[] = "n$i";
            $leadwordcols .= " LEAD({$this->corpus->filter->target_col}, $i) OVER() AS n$i, ";
        };
        $leadwordcols = trim($leadwordcols," ,");
        $wordcolstring = implode(" || ' ' || ", $wordcols);
        $query = "SELECT ngram, count(*) FROM
             (SELECT $wordcolstring as ngram FROM
             (SELECT $leadwordcols FROM {$this->corpus->filter->target_table_prefix}_{$this->lang} 
                WHERE
                {$this->corpus->filter->target_col_filter}
                {$this->corpus->filter->id_col} between $1 AND $2
             ) AS q 
                WHERE lower(n1) = $3) AS ngramq 
             GROUP BY ngram  
             HAVING ngramq.count > 0 
             ORDER BY count DESC";
        $result = pg_query_params($this->corpus->corpuscon, $query, 
            array_merge($this->address, Array($word)));

        $freqs = pg_fetch_all($result);
           
        if($freqs){
            foreach($freqs as $row){
                if($row["ngram"]){
                    $this->ngram_frequencies[$row["ngram"]] = $row["count"]*1;
                }
            }
        }

        return $this;
    }



    /**
     * 
     * Fetches the count of each word in the document
     *
     */
    public function SetWordFrequencies(){
        if(!$this->word_frequencies){
            $query = "SELECT {$this->corpus->filter->target_col}, count(*) 
                      FROM {$this->corpus->filter->target_table_prefix}_{$this->lang} 
                      WHERE {$this->corpus->filter->id_col} between $1 AND $2
                      GROUP BY {$this->corpus->filter->target_col} ORDER BY count DESC";
            $result = pg_query_params($this->corpus->corpuscon, $query, $this->address);
            $freqs = pg_fetch_all($result);

            $this->word_frequencies = Array();
               
            foreach($freqs as $row){
                $this->word_frequencies[$row[$this->corpus->filter->target_col]] = $row["count"]*1;
            }
        }
        return $this;
    }


    /**
     * 
     * Fetches all the lemmas of every noun in the document
     * an counts their frequencies
     *
     * @param boolean $filtershort Whether or not to filter out short words
     * 
     */
    public function SetNounFrequencyByLemma($filtershort=true){
        if(!$this->noun_frequencies){
            $noun_pattern = new InPattern(Utilities::PickNoun($this->lang), 3);
            $stopword_pattern = new InPattern($this->corpus->GetStopwords(), 
                3 + sizeof($noun_pattern->list));
            $query = "SELECT lemma, count(*) FROM lemma_{$this->lang} 
                      WHERE linktotext IN 
                          (SELECT linktotext FROM pos_{$this->lang}
                              WHERE pos IN ({$noun_pattern->GetPattern()}) 
                              AND linktotext between $1 AND $2)
                      AND lemma NOT IN ({$stopword_pattern->GetPattern()}) 
                      GROUP BY lemma ORDER BY count DESC";
            $result = pg_query_params($this->corpus->corpuscon, $query, 
                array_merge($this->address, $noun_pattern->list, $stopword_pattern->list));
            $freqs = pg_fetch_all($result);

            $this->noun_frequencies = Array();
               
            foreach($freqs as $row){
                if (Utilities::FilterThisWord($row["lemma"]) or !$filtershort){ 
                    //Filtering out short words and other unwanted words
                    $this->noun_frequencies[$row["lemma"]] = $row["count"]*1;
                }
            }
        }
        return $this;
    }


    /**
     *  Make some manual fixes in how the parser has analyzed the cases.
     *  TODO: a way to let the user define these.
     */
    public function FixWrongLemmasManually(){
        $fixes = Array(
            "fr"=>
            Array(
                Array("wrong"=>"membres",
                "right"=>"membre")),
            );
        if(array_key_exists($this->lang,$fixes)){
            //If there is a fix for this language
            foreach($fixes[$this->lang] as $fix){
                if (array_key_exists($fix["wrong"], $this->noun_frequencies)
                    and array_key_exists($fix["right"], $this->noun_frequencies)){
                    //Increase the frequency of the "right" lemma
                    $this->noun_frequencies[$fix["right"]] += $this->noun_frequencies[$fix["wrong"]];
                    //Remove the other lemma 
                    unset($this->noun_frequencies[$fix["wrong"]]);
                    //Rearrange the array
                    arsort($this->noun_frequencies);
                }
            }
        }
        return $this;
    }


    /**
     * 
     * Creates a frequency list for outputting.
     * 
     */
    public function CreateFrequencyTableForTopicWords(){
        foreach($this->noun_frequencies as $lemma => $freq){
            $tf_idf = Tf_idf($freq, 
                $this->total_words,
                $this->corpus->GetNumberOfTexts(),
                $this->corpus->GetNumberOfTexts($lemma)
            );
            if($tf_idf > 0){
                $this->data[] = Array(
                    "lemma" => $lemma,
                    "freq" => $freq,
                    "tf_idf" => $tf_idf,
                    "nb" => NaiveBayes($this->total_words,$freq, 0.95, 0.05)
                );
            }
        }
        return $this;
    }

}



?>
