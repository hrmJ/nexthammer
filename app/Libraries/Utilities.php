<?php

class Utilities { 
    
    public static function open_connection($db_name) {
      $user = env("DB_USERNAME", true);
      $password = env("DB_PASSWORD", true);
      $dbconn = pg_connect("dbname=$db_name user=$user password=$password host=localhost")
        or die('Could not connect: ' . pg_last_error());
      return $dbconn;
    }


    public static function PickNoun($lang){
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



    public static function FilterSymbols($lemma){
        //Filter unwanted symbols from word
        return preg_replace("(\.|,|!|:|;|-|—|\?)", "", $lemma);
    }

    /**
     *
     * Filter out words that are too short etc.
     *
     **/
    public static function FilterThisWord($thislemma){
        $lemma = Utilities::FilterSymbols($thislemma);
        if(mb_strlen($lemma, 'UTF-8') < 3 and $lemma!= "år"){
            return false;
        }
        return true;
    }

}

?>
