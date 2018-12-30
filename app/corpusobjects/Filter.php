<?php

namespace App\Corpusobjects;


/**
 *
 * Controls e.g. what words are used when building frequency
 * tables. The filters can mean things that limit the results to only nouns,
 * only lemmas etc.
 *
 * @param string $target_col_filter the txt_LANG tables needs usually to be filtered to exclude tags etc
 *
 **/
class Filter{


    public $target_col_filter = "";
    public $id_col = "linktotext";

    /**
     *
     * Search for tokens
     *
     **/
    public function Tokens(){
        $this->target_col = "token";
        $this->target_col_filter = "\nfunct = 'word' AND\n";
        $this->target_table_prefix = "txt";
        $this->id_col = "id";
    }


    /**
     *
     * Search for lemmas
     *
     **/
    public function Lemmas(){
        $this->target_col = "lemma";
        $this->target_table_prefix = "lemma";
    }

    /**
     *
     *
     * @param string $pos by what part of speech the corpus will be filtered ("noun", "")
     * @param string $lang the language to be filtered
     *
     **/
    public function ByPos($pos, $lang){
        switch($pos){
            case "noun":
                $pos_pattern = new InPattern(PickNoun($lang), 3);
                break;
        }
            $stopword_pattern = new InPattern($this->corpus->GetStopwords(), 
                3 + sizeof($pos_pattern->list));
            $query = "\nlinktotext IN 
                          (SELECT linktotext FROM pos_$lang
                          WHERE pos IN ({$pos_pattern->GetPattern()})\n";
                              
    }


}

?>
