<?php
/** 
 * Controller for lists 
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
use Utilities;

/**
 * Gets frequency lists, ngrams etc
 *
 * @category Controllers
 * @package  Nexthammer
 * @author   Juho Härme <juho.harme@gmail.com>
 * @license  https://opensource.org/licenses/MIT MIT
 * @link     ?
 */
class ListController extends Controller
{

    /**
     * Sets the controller
     */
    public function __construct()
    {
        $corpusname = "pest_inter";
        $corpus = new Corpus();
        $corpus->SetCorpusName($corpusname)
            ->SetConnectionToCorpus()
            ->SetConnectionToMain()
            ->SetStopWords();
    }


    /**
     * Gets a frequency list for a certain subcorpus
     *
     * @return response as a json array
     */
    public function frequencyList()
    {
        return ['response' => 
            [
                'testing...'
            ]
        ];
    }
}

?>
