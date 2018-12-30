<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CorpusController extends Controller
{
    /**  
     *
     * Lists all available corpora
     *
     */
    public function index(){
    
        return ['response' => 
            [
                'title' => 'just a test'
            ]
        ];
    }
}
