<?php 
use PHPUnit\Framework\TestCase;

/**
 *
 * @covers Corpus
 *
 **/
class FreqlistTest extends TestCase
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

    public function testDocumentStats() {
        $lang = "en";
        $texts = $this->corpus->GetDocumentNamesAndCodes($lang);
        $codes = Array();
        foreach($texts as $text){
            $codes[] = $text["code"];
        };
        $picked_code = "un_seafarer_identity_documents_2003_en";
        DocumentStats($this->corpus, $codes, $picked_code, $lang);
        $this->assertGreaterThan(0, sizeof($this->corpus->GetDocument($picked_code)->GetData()));
get_frequency_list.php?codes[]=un_seafarer_identity_documents_2003_en&codes[]=un_cert_able_seamen_1946_en&lang=en&picked_code=un_cert_able_seamen_1946_en&action=examine_text
    }

    public function testSimpleWordFreqs() {
        $lang = "en";
        $texts = $this->corpus->GetDocumentNamesAndCodes($lang);
        $codes = Array();
        foreach($texts as $text){
            $codes[] = $text["code"];
        };
        $this->corpus->SetFilter();
        $this->corpus->filter->Tokens();
        $texts = $this->corpus->SetSubCorpus($codes, $lang);
        $picked_code = "un_seafarer_identity_documents_2003_en";
        $this->corpus->SetWordFrequencies();
        $this->assertGreaterThan(0, sizeof($this->corpus->GetWordFrequencies()));
get_frequency_list.php?codes[]=un_seafarer_identity_documents_2003_en&codes[]=un_cert_able_seamen_1946_en&lang=en&picked_code=un_cert_able_seamen_1946_en&action=examine_text
    }

    public function testNBForWholeDocument() {
        $lang = "en";
        $texts = $this->corpus->GetDocumentNamesAndCodes($lang);
        $codes = Array();
        foreach($texts as $text){
            $codes[] = $text["code"];
        };
        SubcorpusStats($this->corpus, $codes, $lang);
        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
get_frequency_list.php?codes[]=un_seafarer_identity_documents_2003_en&codes[]=un_cert_able_seamen_1946_en&lang=en&picked_code=un_cert_able_seamen_1946_en&action=examine_text
    }


}

?>
