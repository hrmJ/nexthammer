<?php 
use PHPUnit\Framework\TestCase;

/**
 *
 * @covers Corpus
 *
 **/
class CorpusManagementTest extends TestCase
{
    protected function setUp(){
        $dbname = "pest_inter";
        $this->corpus = new Corpus();
        $this->corpus
            ->SetConfigPath("config.ini")
            ->SetCorpusName($dbname)
            ->SetConnectionToCorpus()
            ->SetConnectionToMain(open_connection("dbmain", "config.ini"))
            ->SetStopWords();
    }

    public function testGetStopWordList() {
        $stopwrods = $this->corpus->GetStopwords();
        $this->assertGreaterThan(0, sizeof($stopwrods));
    }

    public function testAddStopWord() {
        $stopwrods = $this->corpus->GetStopwords();
        $this->corpus->AddNewStopWord(uniqid())
                     ->SetStopWords(); 
        $stopwrods2 = $this->corpus->GetStopwords(); 
        $this->assertGreaterThan(sizeof($stopwrods),sizeof($stopwrods2));
    }



}

?>
