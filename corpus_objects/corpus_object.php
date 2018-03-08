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
     * 
     * Outputs the data peoduced in json format
     * 
     */
    public function OutputJson(){
        echo json_encode($this->data);
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
     * 
     * Sets a connection to the corpus-specific database
     * 
     */
    public function SetConnectionToCorpus($con){
        $this->con = $con;
        return $this;
    }

    /**
     * 
     * Adds a connection to the dbmain database
     * 
     */
    public function SetConnectionToMain($con){
        $this->maincon = $con;
        return $this;
    }

}

?>
