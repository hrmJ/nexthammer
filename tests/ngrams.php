<?php 
use PHPUnit\Framework\TestCase;

/**
 *
 * @covers Corpus
 *
 **/
class NgramTest extends TestCase
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
        $lang = "en";
        $texts = $this->corpus->GetDocumentNamesAndCodes($lang);
        $this->codes = Array();
        $limit = sizeof($texts);
        $limit = 9;
        for($i=0;$i<$limit;$i++){
            $this->codes[] = $texts[$i]["code"];
        };
        //$this->codes = Array("un_cert_able_seamen_1946_ru");
        $this->corpus->SetSubCorpus($this->codes, $lang);
        $this->corpus->SetFilter();
        $this->corpus->filter->Tokens();
    }


    public function testTokenNgramListWithLemmaSpecified(){
        Ngrams($this->corpus, $this->codes, "ru", 3, "no", "организация", [], TRUE);
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
    }

    public function testNgramListFor2gramsLemmatized(){
        Ngrams($this->corpus, $this->codes, "ru", 3, "no", "свидетельства");
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        #$addr = Array(1855, 3222);
    }

    public function testNgramForWholeCorpus(){
        $this->corpus->SetNgramFrequency(2);
        $this->assertGreaterThan(0, sizeof($this->corpus->GetNgramFrequency()));
    }


    public function testNgramListFor2grams(){
        Ngrams($this->corpus, $this->codes, "ru", 2, "no");
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        #$addr = Array(1855, 3222);
    }


    public function testNgramListFor3grams(){
        Ngrams($this->corpus, $this->codes, "ru", 3, "no");
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        #$addr = Array(1855, 3222);
    }

    public function testNgramListFor4grams(){
        Ngrams($this->corpus, $this->codes, "ru", 4, "no", "");
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        #$addr = Array(1855, 3222);
    }


    public function testNgramListWithWordSpecified(){
        Ngrams($this->corpus, $this->codes, "ru", 3, "no", "бюро");
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        #var_dump($this->corpus->GetData());
        #$addr = Array(1855, 3222);
    }



    public function testFilterBigramsByPos(){
        Ngrams($this->corpus, $this->codes, "ru", 3, "no", "",
            [
                ["A", "A", "N"]
            ]
        );
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
    }

    public function testTokenNgramListWithLemmaSpecifiedAndFiltered(){
        Ngrams($this->corpus, $this->codes, "ru", 4, "no", "организация",
            [
                ["P", "A", "N", "N"]
            ],
            TRUE);
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        //var_dump($this->corpus->GetData());
    }

    public function testNgramPatterns() {
        Ngrams($this->corpus, $this->codes, "ru", 5, "no", "организация",
            BuildNgramPatterns(5,"Noun-centered"),
            TRUE);
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
        #BuildNgramPatterns(5,"Noun-centered");
    }


}

?>
