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

?>
