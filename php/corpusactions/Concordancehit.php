<?php

namespace Texthammer\corpusactions;

/**
 * 
 * Represents one concordance hit / match as a 
 *
 *
 */
class Concordancehit{

    protected $con;
    protected $orig_id;
    public $context;

    public function __construct($con){
        $this->con = $con;
    }

    /**
     *
     * Sets the original id
     *
     */
    public function SetOrigId($orig_id){
        $this->orig_id = $orig_id;
        return $this;
    }


    /**
     *
     * Sets the context as a string
     *
     * @param Integer $orig_id id of a match
     * @param lang language
     *
     */
    public function SetContext($orig_id, $lang){
        $this->orig_id = $orig_id;
        $query = 
           "SELECT token, funct, lemma, pos, morph, tokenid, head, deprel  
            FROM 
            txt_$lang tokens join 
            (
                SELECT upperid, lowerid
                    FROM (
                        SELECT max(id) as upperid FROM txt_$lang
                        WHERE token = 'seg' AND funct = 'tag' AND
                        id < 7
                    ) AS q1,
                    (
                        SELECT min(id) as lowerid FROM txt_$lang
                        WHERE token = 'seg' AND funct = 'tag' AND
                        id > 7
                    ) AS q2
                ) ids ON tokens.id BETWEEN ids.upperid AND ids.lowerid 
                LEFT JOIN
                lemma_$lang lemmas ON lemmas.linktotext = tokens.id
                LEFT JOIN
                pos_$lang postab ON postab.linktotext = tokens.id
                LEFT JOIN
                morph_$lang morph ON morph.linktotext = tokens.id
                LEFT JOIN
                syntax_$lang synt ON synt.linktotext = tokens.id
                WHERE funct != 'tag'"
        $res = pg_query_param($this->con, 
        $query,
        []);


}

?>
