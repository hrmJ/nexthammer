<?php

/**
 *
 * A collection of multiple texts
 *
 * @param string $name  The name of the corpus
 * @param Array $documents individual documents in this collection of texts. THe keys of this array are the codes of the documents.
 * @param Array $languages the languages available in the corpus
 * @param Array $ngramdata An array for storing ngrams for furhter use in calculating LL etc. Format: [2=>[["this+bigram"]=>["freq"=>x],["another+bigram"]=>["freq"=>x]]]
 * @param string $ngram_separator what sign to use for separating different words in an ngram
 *
 */
class Corpus extends CorpusObject{

    protected $languages = Array();
    protected $documents = Array();
    public $corpusname = "";
    public $ngram_separator = "+";
    public $ngramdata = Array();


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
        $query = "SELECT lower({$this->filter->target_col}) AS {$this->filter->target_col}, 
                  count(*) 
                  FROM {$this->filter->target_table_prefix}_{$this->lang} 
                  WHERE 
                  ({$this->document_addresses["str"]})
                  GROUP BY lower({$this->filter->target_col}) 
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
     * Count LL for ngrams with n > 2
     * 
     */
    public function CountGt2gramLL(){
        $this->data = Array();
        foreach($this->ngramdata[$this->ngram_number] as $ngram => $ngramdata){
            $words = explode($this->ngram_separator, $ngram);
            $log_likelihoods_of_bigrams = [];
            for($i=0;$i<$this->ngram_number-1;$i++){
                $thiskey = "{$words[$i]}{$this->ngram_separator}{$words[$i+1]}";
                if(!array_key_exists($thiskey, $this->ngramdata[2])){
                    $all_keys_found = false;
                }
                else{
                    $log_likelihoods_of_bigrams[] = $this->ngramdata[2][$thiskey]["LL"];
                }
            }
            if(sizeof($log_likelihoods_of_bigrams) == $this->ngram_number -1 ){
                $this->data[] = Array(
                    "ngram" => $ngram,
                    "freq" => $ngramdata["freq"],
                    "LL" =>  array_sum($log_likelihoods_of_bigrams),
                    "PMI" => "?"
                );
            }
        }
        return $this;
    }




    /**
     * 
     * Creates an ngram list for outputting. Includes Log-likelihood (LL) and Mutual
     * information values for
     * each row.
     *
     * 
     */
    public function CreateNgramTable(){
        $this->data = Array();
        $this->ngramdata[$this->ngram_number] = Array();
        foreach($this->ngram_frequencies as $ngram => $freq){
            $words = explode($this->ngram_separator, $ngram);
            $ll = "(not available yet for n > 2)";
            if($this->ngram_number == 2){
                $without_second = $this->GetWithoutSecond($words);
                $ll = LogLikeLihood($freq,
                                      $without_second,
                                      $this->word_frequencies[$words[0]], 
                                      $this->word_frequencies[$words[1]],
                                      $this->total_words);
            }
            $this->ngramdata[$this->ngram_number][$ngram] = Array(
                "freq" => $freq,
                "LL" =>  $ll
            );
            $this->data[] = Array(
                "ngram" => $ngram,
                "freq" => $freq,
                "LL" =>  $ll,
                "PMI" => PMI($freq,
                             $this->word_frequencies[$words[0]], 
                             $this->word_frequencies[$words[1]],
                             $this->total_words)
            );
        }

        return $this;
    }


    /**
     *
     * Check how many times a word occurs in an ngram without a specific second word
     *
     * @param Array $words the words in this ngram
     *
     **/
    private function GetWithoutSecond($words){
        return $this->ngram_frequencies_by_first_word[$words[0]] - 
            $this->ngram_frequencies["$words[0]{$this->ngram_separator}$words[1]"];
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
     * Edits the regular ngramquery to limit the results to those that include 
     * A certain word in one of the slots
     *
     * @param $word string the word / lemma that must be included
     * @param $last_index index of the last pg_params parameter so far
     * @param $n which grams
     *
     **/
    public function SetNgramMustIncludeWord($word, $last_index, $n){
        $w_index = $last_index + 1;
        $cond = "(";
        for($i=1;$i<=$n;$i++){
            if($cond){
                if($cond !== "("){
                    $cond .= " OR ";
                }
                $cond .= "n$i =  \$$w_index";
            }
        }
        $cond .= ")";
        return $cond;
    }

    /**
     *
     * Filters the ngram to restrict the selection to only ngrams
     * with a specific structure, e.g. N+N+A
     *
     * @param Array $filter_array [0 => "noun", 1 => "adjective", 2 => "noun", 3 => ...]
     *
     *
     **/
    public function SetNgramFilterByPos($filter_array){

        $s = "\nAND\n(\n";

        foreach($filter_array as $pattern){

            if($s !== "\nAND\n(\n")
                $s .= "OR ";

            $s .= "\n(\n";
            $pattern_string = "";
            foreach($pattern as $token_no => $pos){

                $tags = PickPosTags($this->lang, $pos);
                $pos_string = "(";
                foreach($tags as $tag){
                    $pos_string .= "'$tag', ";
                }
                $pos_string = trim($pos_string," ,") . ")";

                if($pattern_string)
                    $pattern_string .= " AND ";

                $token_no++;
                $pattern_string .=  "pos_$token_no IN $pos_string ";
            }
            $s .= "$pattern_string\n)\n";
        
        }

        $s .= "\n)\n";

        return $s;

    }


    /**
     * 
     * Fetches all ngrams and orders them descending by frequency.
     * This is not done separately for each document but rather
     * for the whole (sub)corpus.
     *
     * @param $n which grams (2,3,4...)
     * @param $min_count take only ngrams with minimun frequency of this
     * @param string $filter_by_pos a word / lemma an ngram must include in order to qualify
     * @param Array $pos_array array of parts of speech that must be included
     * 
     */
    public function SetNgramFrequency($n, $min_count=0, $include_word="", $pos_array=Array()){
        $this->SetAddressesOfAllDocuments();
        $this->ngram_number = $n;

        //Construct the LEAD queries for the ngrams
        $wordcols = Array();
        $leadwordcols = "lower({$this->filter->target_col}) as n1,";
        $leadposcols = "postab.pos as pos_1,";
        for($i=1;$i<=$n;$i++){
            $n_idx = $i + 1;
            $wordcols[] = "n$i";
            if($i<$n){
                $leadwordcols .= " lower(LEAD({$this->filter->target_col}, $i) OVER()) AS n$n_idx,";
                $leadposcols .= " LEAD(postab.pos, $i) OVER() AS pos_$n_idx,";
            }
        };
        $leadwordcols = trim($leadwordcols," ,");
        $leadposcols = trim($leadposcols," ,");
        var_dump($leadwordcols);
        var_dump($leadposcols);

        $wordcolstring = implode(" || '{$this->ngram_separator}' || ", $wordcols);
        var_dump($wordcolstring);
        $last_index = sizeof($this->document_addresses["arr"]) + 1;

        $filter_by_pos = "";
        $filter_by_word = "";
        if($include_word){
             $filter_by_word = $this->SetNgramMustIncludeWord($include_word, $last_index, $n) . " AND";
        }
        if($pos_array){
             $filter_by_pos = $this->SetNgramFilterByPos($pos_array);
        }

        $nounmarks = PickNoun($this->lang);
        $nounstr = "(";
        foreach($nounmarks as $nounmark){
            $nounstr .= "'$nounmark', ";
        }
        $nounstr = trim($nounstr," ,") . ")";

        $addr_condition = str_replace("id", "tokentab.id", $this->document_addresses["str"]);

        //Prepare the query
        $query = "SELECT lower(ngram) AS ngram, count(*) FROM
             (SELECT $wordcolstring as ngram FROM
             (SELECT $leadwordcols, \n $leadposcols
                FROM {$this->filter->target_table_prefix}_{$this->lang} tokentab
                LEFT JOIN pos_{$this->lang} postab ON 
                tokentab.id = postab.linktotext  
                WHERE {$this->filter->target_col_filter} ($addr_condition)
             ) AS q
                WHERE n1 ~ \$$last_index AND -- NOTE: exlcuding if a number present
                $filter_by_word
                LOWER(n1) ~ '[a-öа-я]'  -- NOTE excluding if no letters
                $filter_by_pos
             )  
             AS ngramq GROUP BY lower(ngram)  HAVING ngramq.count > $min_count
             ORDER BY count DESC";

        if($pos_array){
            #var_dump($query);
        }

        //Run the query
        $result = pg_query_params($this->corpuscon, $query, 
            array_merge($this->document_addresses["arr"],
            Array("^[^\d\(\)']+$"),
            ($include_word ? Array($include_word) : Array()))
        );

        $test = "
             SELECT $leadwordcols, \n $leadposcols
                FROM {$this->filter->target_table_prefix}_{$this->lang} tokentab
                LEFT JOIN pos_{$this->lang} postab ON 
                tokentab.id = postab.linktotext  
                WHERE {$this->filter->target_col_filter} ($addr_condition)
            ";

        #if($pos_array){
        #    //Run the query
        #    $result2 = pg_query_params($this->corpuscon, $test, 
        #        $this->document_addresses["arr"]);
        #    $testres = pg_fetch_all($result2);
        #    var_dump($testres);
        #}

        //Process the results
        $freqs = pg_fetch_all($result);
        $this->ngram_frequencies = Array();
        $this->ngram_frequencies_by_first_word = Array();

           
        foreach($freqs as $row){
            if($row["ngram"]){
                $this->ngram_frequencies[$row["ngram"]] = $row["count"]*1;
                $words = explode($this->ngram_separator, $row["ngram"]);
                if (array_key_exists($words[0], $this->ngram_frequencies_by_first_word)){
                    $this->ngram_frequencies_by_first_word[$words[0]] += $row["count"]*1;
                }
                else{
                    $this->ngram_frequencies_by_first_word[$words[0]] = $row["count"]*1;
                }
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
            $words = explode($this->ngram_separator, $ngram);
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
