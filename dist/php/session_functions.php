<?php

/**
 *
 *TODO:  MOVE This away from here
 *
 **/
function open_connection($db_name, $path="../config.ini") {
  $config = parse_ini_file($path);
  $user = $config["un"];
  $password = $config["pw"];
  $dbconn = pg_connect("dbname=$db_name user=$user password=$password host=localhost")
    or die('Could not connect: ' . pg_last_error());
  return $dbconn;
}


?>
