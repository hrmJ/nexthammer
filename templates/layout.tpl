<!DOCTYPE html>
<html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<link href="css/main.css?id=43053432" rel="stylesheet" type="text/css">
<link href="../js_libraries/jquery-ui-1.12.1.custom/jquery-ui.min.css" rel="stylesheet" type="text/css">
<script src="../js_libraries/jquery-3.2.1.min.js"></script>
<script src="../js_libraries/jquery-ui-1.12.1.custom/jquery-ui.min.js"></script>
<script src="js/build/main.js?id=43053432"></script>
</head>
<body>

<div class='container'>

    <nav>
        <ul>
            <li class="menu-launcher" id='show_desktop_objects_link'>Show desktop objects</li>
            <li class="corpus_select"></li>
            <li class="lang_select"></li>
            <li class="current_subcorpus menu-launcher">Current subcorpus: <span class='texts_picked'>0</span> texts</li>
            <li class="menucontainer select_action"><button>Select action</button></li>
            <li class="menucontainer select_other_function"><button>Other functions</button></li>
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


        <div class='menubelow' id="corpusaction">
            <h2>Actions available for this (sub)corpus:</h2>
            <ul>
                <li> <a class='ExamineTopics DisplayOptions closed' href='javascript:void(0);'>Examine topics in individual texts of the selected subcorpus</a>
                    <ul id='topic_params_menu' class='hidden some-margin'>
                        <li class='datalist'>
                        Baseline for TF_IDF: 
                            <input name='tf_idf_baseline' type='text' placeholder='Set minimum value'> </input>
                        </li>
                        <li class='some-margin'>
                          <button class='ExamineTopics DisplayTexts'>Launch</button>  
                        </li>
                    </ul>
                </li>
                <li><a class='SubCorpusCharacteristics PrintFrequencyList closed' href='javascript:void(0);'>Examine word frequencies in the whole subcorpus</a></li>
                <li> <a class='SubCorpusCharacteristics DisplayNgramOptions closed' href='javascript:void(0);'>Ngrams</a>
                    <ul id='ngrams_params_menu' class='hidden some-margin'>
                        <li class='datalist'>
                        Which grams: (2, 3, 4, ..)
                            <input name='ngram_n_number' type='text' placeholder='2 or higher'> </input>
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
