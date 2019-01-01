<?php
/** 
 * Controller for corpora
 *
 * PHP version 7.2
 *
 * @category Nexthammer
 * @package  Nexthammer
 * @author   Juho Härme <juho.harme@gmail.com>
 * @license  https://opensource.org/licenses/MIT MIT
 * @link     ?
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Corpusobjects\Corpus;

/**
 * Controller for (sub)corpora
 *
 * @category Controllers
 * @package  Nexthammer
 * @author   Juho Härme <juho.harme@gmail.com>
 * @license  https://opensource.org/licenses/MIT MIT
 * @link     ?
 */
class CorpusController extends Controller
{


    /**
     * Sets a single corpus to be used for some action.
     */
    private function setCorpus(String $corpusname, String $lang, Array $codes)
    {
        $this->corpus = new Corpus();
        $this->corpus
            ->SetCorpusName($corpusname)
            ->SetConnectionToCorpus()
            ->SetConnectionToMain()
            ->SetStopWords();
        if($codes){
            $this->corpus->SetSubCorpus($codes, $lang);
        }
    }



    /**  
     * Lists all available corpora
     *
     * @return response as a json array
     */
    public function index()
    {

        //Just a mock for now...

        return ['response' => 
            [
                'title' => 'pest_inter',
            ]
        ];
    }

    /**  
     * Lists all languages in a specific corpus
     *
     * @return response as a json array
     */
    public function listLanguages(String $name)
    {

        return ['response' => 
            [
                'corpusname' => $name,
            ]
        ];
    }

    /**
     * Gets a frequency list for a certain subcorpus
     *
     * @return response as a json array
     */
    public function frequencyList(String $name, String $lang,  Request $request)
    {
        $codes = $request->query("codes");
        $this->setCorpus($name, $lang, $codes);
        $this->corpus->SetNounFrequencyByLemma()
            ->CountAllWords()
            ->CreateFrequencyTableForTopicWords();
        //if(isset($_GET["bylang"])){
        //    #$corpus->CleanDataFromString("#","lemma")->SimplifyDataByVariable("lemma");
        //    $corpus->DelimitDataByString("#","lemma")->SimplifyDataByVariable("lemma");
        //    echo json_encode([$_GET["lang"] => $corpus->GetData()]);
        //}
        return ['response' => $this->corpus->GetData()];
        //return ["x" => $this->corpus->documents];
        return ["x" => "lkjlk"];
    }


}
