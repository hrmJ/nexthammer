<!DOCTYPE html>
<html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<link href="css/main.css?id=[@css_id]" rel="stylesheet" type="text/css">
<link href="js/build/vendor/jquery-ui-1.12.1.custom/jquery-ui.min.css" rel="stylesheet" type="text/css">
<script src="js/build/vendor/jquery-3.2.1.min.js"></script>
<script src="js/build/vendor/jquery-ui-1.12.1.custom/jquery-ui.min.js"></script>
<script src="js/build/main.js?id=[@js_id]"></script>
</head>
<body>

<div class='container'>

    <nav>
        <ul>
            <li class="menu-launcher" id='show_desktop_objects_link'>Show desktop objects</li>
            <li class="corpus_select"></li>
            <li class="lang_select"></li>
            <li class="current_subcorpus menu-launcher">Current subcorpus: <span class='texts_picked'>0</span> texts</li>
            <li class="menucontainer start_rnd"><button>LRD</button></li>
            <li class="menucontainer select_action"><button>Other actions</button></li>
            <li class="menucontainer select_other_function"><button>Manage</button></li>
        </ul>
    </nav>

    <div class='over-container'>
        <div class='my-lightbox text_examiner data_picker'>
             <a class="boxclose"></a>
            <div id="texts_to_examine"></div>
        </div>

        <div class='my-lightbox textpicker data_picker'>
             <a class="boxclose"></a>
            <h2>Pick the current subcorpus (currently selected: <span class='texts_picked'>0</span> texts)</h2>
            <div id="text_picker_for_sobcorpus"></div>
        </div>

        <div class='my-lightbox lrd_menu data_picker'>
             <a class="boxclose"></a>
            <h2>Choose which n-gram to examine:</h2>
            <ul>
                <li class="actionlist" id="ldr-n_2">Bigrams</li>
                <li class="actionlist" id="ldr-n_3">Trigrams</li>
                <li class="actionlist" id="ldr-n_4">Tetragrams</li>
                <li class="actionlist" id="ldr-n_5">Pentagrams</li>
                <li class="actionlist" id="ldr-n_6">Sextagrams</li>
                <li class="actionlist" id="ldr-n_7">Septagrams</li>
                <li class="actionlist" id="ldr-n_8">Octagrams</li>
            </ul>
        </div>

        <div class='menubelow' id="corpusaction">
            <h2>Actions available for this (sub)corpus:</h2>
            <ul>                                                                                                                                                                                                       
                <li><a class='SubCorpusCharacteristics PrintFrequencyList closed' href='javascript:void(0);'>Examine word frequencies in the whole subcorpus</a></li>
                <li> <a class='SubCorpusCharacteristics DisplayNgramOptions closed' href='javascript:void(0);'>Ngrams</a>
                    <ul id='ngrams_params_menu' class='hidden some-margin'>
                        <li class='datalist'>
                        Which grams: (2, 3, 4, ..)
                            <input name='ngram_n_number' type='text' placeholder='2 or higher'> </input>
                        </li>
                        <li class='datalist'>
                            <input name='ngram_lemma' type='checkbox'> Search for lemmas </input>
                        </li>
                        <li class='some-margin'>
                          <button class='SubCorpusCharacteristics PrintNgramList'>Launch</button>  
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class='menubelow' id="other_functions_menu">
            <h2>Corpus management</h2>
            <ul>
                <li><a class='ManageStopWords PrintCurrentStopWords' href='javascript:void(0);'>Manage stopwords</a></li>
            </ul>
        </div>

        <div class='menubelow' id="rnd_action">
            <h2>LRD</h2>
            <ul id='topic_params_menu' class=''>
                <li class='datalist dl_parent'>
                    <div> Baseline for TF_IDF:</div>
                    <div><input name='tf_idf_baseline' type='text' placeholder='Set minimum value'> </input></div>
                </li>
                <li class='launcher_parent'>
                  <button class='ExamineTopics DisplayTexts'>Launch LRD</button>  
                </li>
            </ul>
            <h2>LRD tab</h2>
            <ul>
                <li class='datalist dl_parent'>
                    <div>How many topic words in the LRDtab?</div>
                    <div class='slider' id='LRDtab_nwords'></div>
                    <div class='slider_result'></div>
                </li>
                <li class='datalist dl_parent'>
                    <div>Which ngrams to inspect in the LRDtab?</div>
                    <div class='slider' id='LRDtab_ngramrange'></div>
                    <div class='slider_result'></div>
                </li>
                <li class='datalist dl_parent'>
                    <div> How many ngrams for each ngram level? </div>
                    <div class='slider' id='LRDtab_ngramnumber'></div>
                    <div class='slider_result'></div>
                </li>
                <li class='datalist dl_parent'>
                    <div>Method for picking up the top ngrams</div>
                    <div class=''>
                        <select  id='LRDtab_method'>
                            <option>LL</option>
                            <option>PMI</option>
                        </select>
                    </div>
                </li>
                <li class='datalist dl_parent'>
                    <div>Paradigm for ngrams</div>
                    <div class=''>
                        <select  id='LRDtab_paradigm'>
                            <option>Noun-centered</option>
                            <option>Verb-centered</option>
                        </select>
                    </div>
                </li>
                <li class='launcher_parent'>
                  <button class='ExamineTopics DisplayTextsForTab'>Launch LRDtab</button>  
                </li>
            </ul>
        </div>

        
        <aside>

            <p><a href='javascript:void(0)' id='clead_dt_link'>Clear desktop</a></p>

            <h4>Elements available in the corpus desktop</h4>

            <ul id="desktop_element_list">
            
            </ul>
        
        </aside>
        <div class='basic-flex innercontent'>

            <main class='drop-target'>

                    [@maincontent]
            </main>
        </div>
    </div>

</div>


</body>

</html>
