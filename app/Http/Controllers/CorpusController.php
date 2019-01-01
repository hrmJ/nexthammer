<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Corpusobjects\Corpus;

class CorpusController extends Controller
{
    /**  
     *
     * Lists all available corpora
     *
     */
    public function index(){

        //Just a mock for now...

        return ['response' => 
            [
                'title' => 'pest_inter',
            ]
        ];
    }
}
