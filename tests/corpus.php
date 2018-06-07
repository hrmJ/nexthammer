<?php 
use PHPUnit\Framework\TestCase;

/**
 *
 * @covers Corpus
 *
 **/
class CorpusTest extends TestCase
{
    protected function setUp(){
        $this->corpus = new Corpus();
        $name = "pest_inter";
        $this->corpus->SetCorpusName($name)
                     ->SetConfigPath("config.ini")
                     ->SetConnectionToCorpus();
    }

    /**
     * Can set name 
     **/
    public function testSetName() {
        $name = "pest_inter";
        $this->corpus->SetCorpusName($name);
        $this->assertEquals($this->corpus->GetName(),$name);
    }

    /**
     * Can set connection
     *
     **/
    public function testSetConnection() {
        $name = "pest_inter";
        $this->corpus->SetCorpusName($name)
                     ->SetConfigPath("config.ini")
                     ->SetConnectionToCorpus();
        $this->assertTrue(!is_null($this->corpus->GetConnectionToCorpus()));
    }

    /**
     * Can fetch languges
     *
     **/
    public function testFetchLanguages() {
        $this->corpus->SetLanguages();
        $this->assertTrue(in_array("en", $this->corpus->GetLanguages()));
    }

    /**
     *
     * Can fetch a list of all  the texts in a particular language
     *
     **/
    public function testFetchTexts() {
        $lang = "en";
        $this->assertGreaterThan(0, 
            sizeof($this->corpus->GetDocumentNamesAndCodes($lang)));
    }

}

?>
