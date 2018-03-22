<?php

#__DIR__?
require_once "../../../vendor/autoload.php";
#require_once __DIR__ . '/vendor/autoload.php';

use Kachkaev\PHPR\RCore;
use Kachkaev\PHPR\Engine\CommandLineREngine;
#
#
$r = new RCore(new CommandLineREngine('/usr/bin/R'));
#
$result = $r->run(<<<EOF
20+30
EOF
    );

echo $result;
?>
