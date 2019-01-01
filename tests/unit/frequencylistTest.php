<?php 
use PHPUnit\Framework\TestCase;
use App\Corpusobjects\Corpus;

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
            ->SetCorpusName($dbname)
            ->SetConnectionToCorpus()
            ->SetConnectionToMain()
            ->SetStopWords();
    }

//    public function testDocumentStats() {
//        $lang = "en";
//        $texts = $this->corpus->GetDocumentNamesAndCodes($lang);
//        $codes = Array();
//        foreach($texts as $text){
//            $codes[] = $text["code"];
//        };
//        $picked_code = "un_seafarer_identity_documents_2003_en";
//        $this->corpus->SetSubCorpus($codes, $lang);
//        $this->corpus->SetNounFrequencyByLemma()
//            ->CountAllWords()
//            ->CreateFrequencyTableForTopicWords();
//        $this->assertGreaterThan(0, sizeof($this->corpus->GetDocument($picked_code)->GetData()));
//    }

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
    }
//
//    public function testNBForWholeDocument() {
//        $lang = "en";
//        $texts = $this->corpus->GetDocumentNamesAndCodes($lang);
//        $codes = Array();
//        foreach($texts as $text){
//            $codes[] = $text["code"];
//        };
//        SubcorpusStats($this->corpus, $codes, $lang);
//        $this->assertGreaterThan(0, sizeof($this->corpus->GetData()));
//    }
//
//    public function testCleanHashes() {
//        $texts = $this->corpus->GetDocumentNamesAndCodes("fi");
//        $codes = [$texts[0]["code"]];
//        SubcorpusStats($this->corpus, $codes, "fi");
//        $this->corpus->CleanDataFromString("#","lemma")->SimplifyDataByVariable("lemma");
//        $nohash = true;
//        foreach($this->corpus->GetData() as $lemma){
//            if(strpos($lemma,"#"))
//                $nohash = false;
//        }
//        $this->assertTrue($nohash);
//    }
//
//    public function testSplitByHashes() {
//        $texts = $this->corpus->GetDocumentNamesAndCodes("fi");
//        $codes = [$texts[0]["code"]];
//        SubcorpusStats($this->corpus, $codes, "fi");
//        $prev = $this->corpus->GetData();
//        $this->corpus->DelimitDataByString("#","lemma")->SimplifyDataByVariable("lemma");
//        $next = $this->corpus->GetData();
//        $this->assertTrue($prev != $next);
//    }

}

?>
