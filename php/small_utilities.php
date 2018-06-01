<?php

/**
 *
 * Provides a quick way to use an array in an in clause in prepared a psql
 * query using pg_query_param.
 *
 **/
class InPattern{

    protected $use_glue = false;

    /**
     *
     * @param Array $elements Array of the elements that will inside the brackets: IN (x, y, z)
     * @param integer $offset The number of the FIRST parameter in the pg_query_params array that will be associated with this list. 1 or greater.
     *
     **/
    public function __construct($elements, $offset){
        $this->list = $elements;
        $this->first_el_offset = $offset;
    }

    /**
     *
     * Glues the elements of the array with something
     *
     **/
    public function SetGlue(){
        $this->use_glue = TRUE;
    }


    /**
     *
     * Combines the items in the list of elements
     *
     **/
    function BuildPatternString(){
        $this->prepared = Array();
        foreach($this->list as $key=> $vals){
            $key =  $key + $this->first_el_offset;
            $this->prepared[] = "\${$key}";
        }
    }


    /**
     *
     * @param Array $elements Array of the elements that will inside the brackets: IN (x, y, z)
     * @param integer $offset The number of the FIRST parameter in the pg_query_params array that will be associated with this list. 1 or greater.
     *
     **/
    public function GetPattern(){
        $this->BuildPatternString();
        return implode(', ', $this->prepared);
    }

}

function PickNoun($lang){
    //Select the correct tag representing nouns
    switch($lang){
        case "fi":
            return Array("NOUN");
        case "sv":
            return Array("NN");
        case "fr":
            return Array("NC");
        case "ru":
            return Array("N");
        case "en":
            return Array("NNP","NN");
    }
}


/**
 *
 * Get the right tags denoting a specific POS in a specific language
 *
 * @param string $lang the language
 * @param string $pos the POS
 *
 **/
function PickPosTags($lang, $pos){
    switch($lang){
        case "fi":
            switch($pos){
                case "N":
                    return Array("NOUN");
                case "A":
                    return Array("ADJ");
                case "P":
                    return Array("ADPOS");
                case "V":
                    return Array("VERB","AUX");
                case "D":
                    return Array("");
                case "C":
                    return Array("CONJ","SCONJ");
            }
        case "sv":
            switch($pos){
                case "N":
                    return Array("NN");
                case "A":
                    return Array("JJ");
                case "P":
                    return Array("PP");
                case "D":
                    return Array("DT");
                case "C":
                    return Array("KN");
                case "V":
                    return Array("VB");
            }
        case "fr":
            switch($pos){
                case "N":
                    return Array("NC");
                case "A":
                    return Array("ADJ");
                case "P":
                    return Array("P","D");
                case "V":
                    return Array("V","VPR","VINF","VPP","VINF","VS","CLR");
                case "D":
                    return Array("DET");
                case "C":
                    return Array("CONJ","SCONJ");
            }
        case "ru":
            switch($pos){
                case "N":
                    return Array("N");
                case "A":
                    return Array("A");
                case "P":
                    return Array("S");
                case "V":
                    return Array("V");
                case "D":
                    return Array("");
                case "C":
                    return Array("C");
            }
        case "en":
            switch($pos){
                case "N":
                    return Array("NNP","NN","NNS");
                case "A":
                    return Array("JJ");
                case "P":
                    return Array("IN");
                case "V":
                    return Array("VBG","VBP","VBN","VB","VBZ");
                case "D":
                    return Array("DT");
                case "C":
                    return Array("CC");
            }
    }
}


function BuildNgramPatterns(){

        $ngram_patterns_json = '{

            "Noun-centered" : {
                "2":[
                        ["A", "N"],
                        ["N", "A"],
                        ["P", "N"],
                        ["N", "N"]
                    ],
                "3":[
                        ["P", "D", "N"],
                        ["A", "N", "N"],
                        ["N", "A", "N"],
                        ["N", "N", "N"],
                        ["A", "A", "N"],
                        ["P", "N", "P"],
                        ["N", "P", "N"]
                    ],
            },

            "Verb-centered" : {
                "2":[
                        ["V", "N"],
                        ["N", "V"],
                        ["V", "P"],
                        ["P", "V"]
                    ],
                "3":[
                        ["N", "V", "C"],
                        ["V", "P", "N"]
                    ],
            }        
        }';
    #var_dump(json_decode($ngram_patterns_json));
    var_dump($ngram_patterns_json);

}


//Combine lemma2 to lemma1
function CombineWords($lemma_array, $lemma1, $lemma2){
    //1. Find the freq of one of the lemmas
    $add_freq = 0;
    foreach($lemma_array as $idx => $thislemma){
        if($thislemma["lemma"] == $lemma2 ){
            $add_freq = $thislemma["count"];
            break;
        }
    }
    if($add_freq > 0){
        //Remove the second lemma from the word list
        unset($lemma_array[$idx]);
        $lemma_array = array_values($lemma_array);
        foreach($lemma_array as $idx => $thislemma){
            if($thislemma["lemma"] == $lemma1 ){
                $lemma_array[$idx]["count"] += $add_freq;
                break;
            }
        }
    }

    foreach ($lemma_array as $key => $row) {
        $count[$key]  = $row['count'];
    }

    // Sort the data with volume descending, edition ascending
    // Add $data as the last parameter, to sort by the common key
    array_multisort($count, SORT_DESC, $lemma_array);

    return $lemma_array;
}


function FilterSymbols($lemma){
    //Filter unwanted symbols from word
    return preg_replace("(\.|,|!|:|;|-|—|\?)", "", $lemma);
}

/**
 *
 * Filter out words that are too short etc.
 *
 **/
function FilterThisWord($thislemma){
    $lemma = FilterSymbols($thislemma);
    if(mb_strlen($lemma, 'UTF-8') < 3 and $lemma!= "år"){
        return false;
    }
    return true;
}



?>
