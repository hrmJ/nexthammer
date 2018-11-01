<?php 

require 'vendor/autoload.php';

use PHPUnit\Framework\TestCase;
use Texthammer\corpusactions\Concordancer;


/**
 *
 * @covers Concordancer
 *
 **/
class ConcordancerTest extends TestCase
{
    protected function setUp(){
        $dbname = "pest_inter";
        $this->corpus = new Corpus();
        $this->corpus
            ->SetConfigPath("config.ini")
            ->SetCorpusName($dbname)
            ->SetLang("en")
            ->SetConnectionToCorpus()
            ->SetConnectionToMain(open_connection("dbmain", "config.ini"))
            ->SetStopWords();
    }

    /**
     *
     * Test creating an instance of the class
     * 
     */
    public function testCreateObject()
    {
        $conc = new Concordancer();
        $this->assertInstanceOf(Concordancer::class, $conc);
    }


}

?>
