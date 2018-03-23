<?php

/**
 *
 * A collection of multiple texts
 *
 * @param string $name  The name of the corpus
 * @param Array $documents individual documents in this collection of texts. THe keys of this array are the codes of the documents.
 * @param Array $languages the languages available in the corpus
 *
 */
class Corpus extends CorpusObject{

    protected $languages = Array();
    protected $documents = Array();
    public $corpusname = "";


        /**
        * 
        * Sets the name of the corpus 
        * @param string $name  The name of the corpus
        * 
        */
        public function SetCorpusName($name){
            $this->corpusname = $name;
            return $this;
        }

        /**
        * 
        * Builds a subcorpus based on document codes
        *
        * @param Array $codes  The identifier codes of the documents to be included
        * @param Array $lang  The language of the 
        * 
        */
        public function SetSubCorpus($codes, $lang){
            foreach($codes as $code){
                $doc = new Document();
                $doc->SetParentCorpus($this)
                    ->SetCode($code)
                    ->SetLang($lang)
                    ->SetAddr();
                $this->AddDocument($doc);
            }
            return $this;
        }

        /**
        * 
        * Sets the languages available in the corpus
        *
        * 
        */
        public function SetLanguages(){
            if(!$this->languages){
                $result = pg_query_params($this->corpuscon,
                    "SELECT DISTINCT lang FROM librarysrc",Array());
                $this->languages = pg_fetch_all_columns($result);
            }
            return $this;
        }

        /**
        * 
        * Gets the languages
        */
        public function GetLanguages(){
            return $this->languages;
        }

        /**
        * 
        * Gets the titles and codes of the documents in this corpus within a language
        *
        * @param string $lang which language
        *
        */
        public function GetDocumentNamesAndCodes($lang){
            $result = pg_query_params($this->corpuscon,
                "SELECT DISTINCT code, title FROM librarysrc WHERE lang = $1",Array($lang));
            return pg_fetch_all($result);
        }


        /**
        * 
        * Gets the name
        */
        public function GetName(){
            return $this->corpusname;
        }

        /**
         * 
         * Sets a connection to the corpus-specific database
         * 
         */
        public function SetConnectionToCorpus(){
            $this->corpuscon = open_connection($this->corpusname, $this->configpath);
            return $this;
        }

        /**
         * 
         * Gets the connection to the corpus-specific database
         * 
         */
        public function GetConnectionToCorpus(){
            return $this->corpuscon;
        }


        /**
        * 
        * Adds a new document to this corpus
        * 
        */
        public function AddDocument($doc){
            $this->documents[$doc->GetCode()] = $doc;
            return $this;
        }


        /**
        * 
        * gets a document from the list of documents by code
        *
        * @param string $code the code of the document to be retrieved
        * 
        */
        public function getdocument($code){
            return $this->documents[$code];
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
     * Gets the number of texts in the corpus. If $word specified, gets
     * only the texts where the specified word occurs.
     *
     * @param string $word Count only the number of texts with this word
     * 
     */
    public function GetNumberOfTexts($word=""){
        if($word){
            $no = 0;
            foreach($this->documents as $code => $doc){
                $doc->SetNounFrequencyByLemma();
                if(array_key_exists($word, $doc->GetNounFrequencyByLemma())){
                    $no++;
                }
            }
            return $no;
        }
        else{
            return sizeof($this->documents);
        }
    }


    /**
     * 
     * Counts the frequencies of individual words in the
     * corpus. Doesn't check for each document separately.
     * 
     */
    public function SetWordFrequenciesPerWholeCorpus(){
        $this->SetAddressesOfAllDocuments();
        $query = "SELECT {$this->filter->target_col}, count(*) 
                  FROM {$this->filter->target_table_prefix}_{$this->lang} 
                  WHERE 
                  ({$this->document_addresses["str"]})
                  GROUP BY {$this->filter->target_col} 
                   ORDER BY count DESC";
        $result = pg_query_params($this->corpuscon, $query, 
            $this->document_addresses["arr"]);

        $freqs = pg_fetch_all($result);
        $this->word_frequencies = Array();
           
        foreach($freqs as $row){
            if($row[$this->filter->target_col]){
                $this->word_frequencies[$row[$this->filter->target_col]] = $row["count"]*1;
            }
        }
        return $this;
    }

    /**
     * 
     * Counts the frequencies of individual words in the corpus
     * 
     */
    public function SetWordFrequencies(){
        foreach($this->documents as $doc){
            $doc->SetWordFrequencies();
            foreach($doc->GetWordFrequencies() as $lemma => $freq){
                if (array_key_exists($lemma, $this->word_frequencies)){
                    $this->word_frequencies[$lemma] += $freq;
                }
                else{
                    $this->word_frequencies[$lemma] = $freq;
                }
            }
        }
        //sort descending by freqyencies
        arsort($this->word_frequencies);
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
                "nb" => $nb,
            );
        }
        return $this;
    }


    /**
     * 
     * Creates an ngram list for outputting. Includes Log-likelihood values for
     * each row.
     *
     * @param $how many ngrams will  be printed
     * 
     */
    public function CreateNgramTable($length_of_table=500){
        $this->data = Array();
        $i = 0;
        foreach($this->ngram_frequencies as $ngram => $freq){
            if($i>$length_of_table)
                break;
            $i++;
            if($freq > 2){
                //Note: only take ngrams with a minimun frequency of 2
                $words = explode(" ", $ngram);
                //Count the number of bigrams with nly the first word
                $without_second = array_sum(array_filter(
                    $this->ngram_frequencies,
                    function ($key) use ($words) {
                        //Using negative lookahead to check for cases without the second word
                        //TODO utf-8 word boundaries?? Is this still an issue in recdent php versions?
                        try{
                            if(preg_match("/{$words[0]} (?!{$words[1]}\b)/iu", $key))
                                return true;
                        }
                        catch(Exception $e){
                            //E.g. cases where there is a bracket as a "word" in the ngram
                            return false;
                        }
                        return false;
                    }, ARRAY_FILTER_USE_KEY));
                $this->data[] = Array(
                    "ngram" => $ngram,
                    "freq" => $freq,
                    "PMI" => PMI($freq,
                                 $this->word_frequencies[$words[0]], 
                                 $this->word_frequencies[$words[1]],
                                 $this->total_words),
                    "LL" => LogLikeLihood($freq,
                                          $without_second,
                                          $this->word_frequencies[$words[0]], 
                                          $this->word_frequencies[$words[1]],
                                          $this->total_words)
                );
            }
        }

        return $this;
    }


    /**
     *
     * Finds out the database addresses of each document and combines them into
     * an array
     *
     **/
    public function SetAddressesOfAllDocuments(){
        $this->document_addresses = Array("str" => "","arr" => Array());
        $i = 1;
        foreach($this->documents as $doc){
            $this->document_addresses["arr"] = array_merge($this->document_addresses["arr"], $doc->GetAddr());
            if ($this->document_addresses["str"]){
                $this->document_addresses["str"] .=  " OR ";
            }
            $next = $i + 1;
            $this->document_addresses["str"] .=  "({$this->filter->id_col} BETWEEN \$$i AND \$$next)";
            $i += 2;
        }
    }

    
    /**
     * 
     * Fetches all ngrams and orders them descending by frequency.
     * This is not done separately for each document but rather
     * for the whole (sub)corpus.
     *
     * @param $n which grams (2,3,4...)
     * 
     */
    public function SetNgramFrequency($n){
        $this->SetAddressesOfAllDocuments();

        $wordcols = Array();
        $leadwordcols = "{$this->filter->target_col}, ";
        for($i=1;$i<=$n;$i++){
            $wordcols[] = "n$i";
            $leadwordcols .= " LEAD({$this->filter->target_col}, $i) OVER() AS n$i, ";
        };
        $leadwordcols = trim($leadwordcols," ,");
        $wordcolstring = implode(" || ' ' || ", $wordcols);

        $query = "SELECT ngram, count(*) FROM
             (SELECT $wordcolstring as ngram FROM
             (SELECT $leadwordcols FROM {$this->filter->target_table_prefix}_{$this->lang}
                WHERE
                {$this->filter->target_col_filter}
                ({$this->document_addresses["str"]})
             ) AS q) 
             AS ngramq GROUP BY ngram  HAVING ngramq.count > 0
             ORDER BY count DESC";
        $result = pg_query_params($this->corpuscon, $query, 
            $this->document_addresses["arr"]);

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
     * Fetches all ngrams and orders them descending by frequency
     * Does this separately for each document
     *
     * @param $n which grams (2,3,4...)
     * 
     */
    public function SetNgramFrequencyForEachDocument($n){
        foreach($this->documents as $doc){
            $doc->SetNgramFrequency($n);
            foreach($doc->GetNgramFrequency($n) as $ngram => $freq){
                if (array_key_exists($ngram, $this->ngram_frequencies)){
                    $this->ngram_frequencies[$ngram] += $freq;
                }
                else{
                    $this->ngram_frequencies[$ngram] = $freq;
                }
            }
        }

        arsort($this->ngram_frequencies);


        //For the most frequent ngrams: get the small frequency ngrams as well
        //with the first word specified
        $i = 0;
        foreach($this->ngram_frequencies as $ngram => $freq){
            $i++;
            if($i > 2000){
                break;
            }
            $words = explode(" ", $ngram);
            $doc->SetNgramFrequencyWithFirstWordSpecified($n, $words[0]);
        }
        foreach($doc->GetNgramFrequency($n) as $ngram => $freq){
            if (!array_key_exists($ngram, $this->ngram_frequencies)){
                $this->ngram_frequencies[$ngram] = $freq;
            }
        }

        arsort($this->ngram_frequencies);
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
     * Adds a lemma that the user wants to exclude from frequency lists
     * 
     * @param string $word the word to be added
     *
     */
    public function AddNewStopWord($word){
        $result = pg_query_params($this->maincon, "INSERT INTO topicwords_stopwords (lemma) VALUES ($1)",
            Array($word));
        return $this;
    }

    /**
     * 
     * Get the list of stopwords
     * 
     */
    public function GetStopWords(){
        return $this->stopwords;
    }

}



?>
