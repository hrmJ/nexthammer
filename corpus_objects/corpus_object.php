<?php

/**
 *
 * Individual texts, words etc in a corpus or a smaller set of texts
 *
 *
 * $@param Array $data The data that this object might want to output
 *
 */
class CorpusObject{

    protected $data = Array();

    /**
     * @param Connection $con connection to psql database of the corpus in question
     */
    public function __construct($con){
        $this->con = $con;
        return $this;
    }


    /**
     * 
     * Outputs the data peoduced in json format
     * 
     */
    public function OutputJson(){
        echo json_encode($this->data);
    }

}
?>
