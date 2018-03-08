<?php

/**
 *
 * Individual texts, words etc in a corpus or a smaller set of texts
 *
 *
 */
class CorpusObject{

    /**
     * @param Connection $con connection to psql database of the corpus in question
     */
    public function __construct($con){
        $this->con = $con;
        return $this;
    }

}
?>
