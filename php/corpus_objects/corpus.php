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
     */
    public function CreateNgramTable(){
        $this->data = Array();
        foreach($this->ngram_frequencies as $ngram => $freq){
            if($freq > 2){
                //Note: only take ngrams with a minimun frequency of 2
                $words = explode(" ", $ngram);
                //Count the number of bigrams with nly the first word
                $without_second = array_sum(array_filter(
                    $this->ngram_frequencies,
                    function ($key) use ($words) {
                        //Using negative lookahead to check for cases without the second word
                        //TODO utf-8 word boundaries?? Is this still an issue in recdent php versions?
                        if(preg_match("/{$words[0]} (?!{$words[1]}\b)/iu", $key))
                            return true;
                        return false;
                    }, ARRAY_FILTER_USE_KEY));
                $this->data[] = Array(
                    "ngram" => $ngram,
                    "freq" => $freq,
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
     * Fetches all ngrams and orders them descending by frequency
     *
     * @param $n which grams (2,3,4...)
     * 
     */
    public function SetNgramFrequency($n){
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
