<?php


/**
 *
 * Individual texts, words etc in a corpus or a smaller set of texts
 *
 *
 * @param Array $data The data that this object might want to output
 * @param Connection $corpuscon to the database of the corpus
 * @param string $configpath path to config.ini
 *
 */
class CorpusObject{

    protected $data = Array();
    protected $corpuscon = null;
    protected $configpath = "";


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
     * Sets the path to the config file
     * 
     */
    public function SetConfigPath($path){
        $this->configpath = $path;
        return $this;
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
     * Adds a connection to the dbmain database
     * 
     */
    public function SetConnectionToMain(){
        $this->maincon = open_connection("dbmain", $this->configpath);
        return $this;
    }


}

?>
