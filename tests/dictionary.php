<?php 


use PHPUnit\Framework\TestCase;


/**
 *
 *
 *
 * The task: use wiktionary data to 
 *
 * for a starting point, see 
 *
 * https://stackoverflow.com/questions/7166233/retrieving-the-translation-section-in-the-wiktionary-api/30340343#30340343
 *
 * https://en.wiktionary.org/w/api.php?action=query&prop=iwlinks&titles=test&iwprefix=de&format=json&continue=
 * 
 * So far, the problem is that with this strategy you have to work with English as the starting point
 *
 * Test RDF reading for wiktionary parsing
 *
 **/
class DictionaryTest extends TestCase
{
    protected function setUp(){
        $this->dict = new Texthammer\Dictionary();
        $this->dict->SetStartWord("treaty");
    }

#    /**
#     *
#     * Can fetch a list of all  the texts in a particular language
#     *
#     **/
#    public function testTranslateFromEnglishToFinnish() {
#        $this->dict->SetStartWord("treaty")->SetTargetLangs(["fi"])->Translate();
#        $trans = $this->dict->GetTranslationsForLanguage("fi");
#        $this->assertTrue(sizeOf($trans)>0);
#        var_dump($trans);
#    }
#
#    /**
#     *
#     * Can fetch a list of all  the texts in a particular language
#     *
#     **/
#    public function testTranslateFromEnglishToFinnishAndSwedish() {
#        $this->dict->SetStartWord("treaty")->SetTargetLangs(["fi","sv"])->Translate();
#        $trans = $this->dict->GetTranslationsForLanguage("sv");
#        $this->assertTrue(sizeOf($trans)>0);
#        var_dump($trans);
#        $trans = $this->dict->GetAllTranslations();
#        var_dump($trans);
#    }
#

    /**
     *
     * Can fetch a list of all  the texts in a particular language
     *
     **/
    public function testAjaxFunction() {
        $langs = ["fi","sv","fr","ru"];
        $words = ["treaty","woman","work","child"];
        var_dump(FindPossibleTranslations($words, $langs));
    }
}

?>
