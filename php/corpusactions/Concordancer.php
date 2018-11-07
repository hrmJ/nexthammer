<?php

namespace Texthammer\corpusactions;

/**
 * 
 * A concordancer: fetches a words or an expressions concordance.
 *
 * @param  Corpus $corpus a corpus object: the (sub)corpus we are using to get the concordances from
 * @param  Boolean $uselemmas whether or not to interpret the search terms as lemmas
 * @param  Integer $hitlimit maximum number of hits per page
 * @param  Array $hit_ids ids of the matches in the original table
 *
 */
class Concordancer{

    protected $corpus;
    protected $uselemmas = false;
    protected $hitlimit = 100;
    public $hit_ids = [];

    public function __construct($corp){
    
        $this->corpus = $corp;
    }


    /**
     *
     * Sets using lemmas on
     *
     */
    public function SetUseLemmas(){
        $this->uselemmas = true;
    }


    /**
     *
     * TODO cql parser etc
     *
     * Gets the ids 
     *
     * @param String $exp an expression to search for: will be split by spaces if more than one word
     *
     */
    public function GetHitIds($exp){
    
        #0. Split the expression

        $query = "SELECT id 
            FROM {$this->corpus->filter->target_table_prefix}_{$this->corpus->lang}
            WHERE 
            {$this->corpus->filter->target_col} = $1
            ";

        try{
            $result = pg_query_params($this->corpus->corpuscon, $query, [$exp]);
        }
        catch(Exception $err){
            echo "\n$err\n";
            var_dump($query);
        }

        $this->hit_ids = pg_fetch_all_columns($result);

    }


    /**
     *
     *
     *
     */
    public function GetConcForHits($range=[0,10]){
        for($i = $range[0]; $i < $range[1]; $i++){
            $hit = new Concordancehit($this->corpus->corpuscon);
            $hit->SetOrigId($this->hit_ids[$i]);
            if($i>=sizeof($this->hit_ids)){
                break;
            }
        }
    }


}

?>
