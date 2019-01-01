<?php 

class FrequencyListsCest
{
    public function _before(ApiTester $I)
    {
    }

    // tests
    public function tryToGetFrList(ApiTester $I)
    {
        $I->wantTo("Get a frequency list");
        $I->sendGet("http://nexthammer.test/api/v1/corpora/pest_inter/fi/frequencylist?codes[]=mini_age_sea_1936_fi&codes[]=un_association_agriculture_1921_fi");
        $I->seeResponseIsJson();
    }


}
