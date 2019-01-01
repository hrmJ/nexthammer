<?php

class Utilities { 
    
    public static function hello() {
        return "";
    }

    public static function open_connection($db_name) {
      $user = env("DB_USERNAME", true);
      $password = env("DB_PASSWORD", true);
      $dbconn = pg_connect("dbname=$db_name user=$user password=$password host=localhost")
        or die('Could not connect: ' . pg_last_error());
      return $dbconn;
    }

}

?>
