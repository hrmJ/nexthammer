/**
 * 
 * Gives the user multilingual tables of ngrams. The ngrams are sorted
 * by either Log Likelihood (LL) or Mutual information  (MI/PMI) values.
 * Only ngrams including thematically relevant words are taken into account.
 * These words are filtered with the help of tf_idf values.
 *
 *
 * @param words_in_doc all the words that appear in the document (object with languages as keys).
 * @param filtered_by_dict_keywords the words filtered after consulting a dictionary
 * @param number_of_topicwords how many words for each document
 * @param ngram_range from which ngrams to which [start, end]
 * @param ngram_number how many ngrams for each individual key word
 * @param lrd_method LL or PMI
 * @param sl_keywords_ranked ordered list of keywords in the source language
 * @param lrd_paradigm how to filter the ngrams: Noun-centered or Verb-centerd
 *
 **/
var LRDtab = function(){

    var words_in_doc = {},
        sl_keywords_ranked = [],
        filtered_by_dict_keywords = [],
        ngrams = [],
        number_of_topicwords = 5,
        ngram_range = [2,3],
        ngram_number = 5,
        lrd_method = "LL",
        lrd_paradigm = "Noun-centered",
        source_lang = "en";


    /**
     *
     * Gets the source language
     *
     **/
    var GetSourceLang = function(){
        return source_lang;
    }

    /**
     *
     * Gets the number of topic words
     *
     **/
    var GetNumberOfTopicWords = function(){
        return number_of_topicwords
    }

    /**
     *
     * Gets the range of ngram levels
     *
     **/
    var GetNgramRange = function(){
        return ngram_range;
    }

    /**
     *
     * Defines, what method will be used for picking
     * the top ngrams
     *
     *
     **/
    var SetLRDmethod = function(){
        lrd_method = $(this).val();
    }

    /**
     *
     * Defines, what paradigm will be used for constructing the ngrams
     *
     *
     **/
    var SetLRDparadigm = function(){
        lrd_paradigm = $(this).val();
    }



    /**
     *
     * Defines, how many of the top words from the tf_idf list will be
     * taken into account
     *
     * @param e event
     * @param ui jquery ui object
     *
     **/
    var SetNumberOfTopicWords = function(e, ui){
        $(e.target).parent().find(".slider_result").text(ui.value);
        number_of_topicwords = ui.value;
    }

    /**
     *
     * Defines, how many of the top words from the tf_idf list will be
     * taken into account
     *
     * @param e event
     * @param ui jquery ui object
     *
     *
     **/
    var SetNgramRange = function(e, ui){
        $(e.target).parent().find(".slider_result").text(ui.values.join(" - "));
        ngram_range = ui.values;
    }

    /**
     *
     * Defines, how many ngrams (max) will be printed for each ngram level
     *
     * @param e event
     * @param ui jquery ui object
     *
     **/
    var SetNgramNumber = function(e, ui){
        $(e.target).parent().find(".slider_result").text(ui.value);
        ngram_number = ui.value;
    }

    /**
     *
     * Gets the whole data table for ngrams
     *
     **/
    var GetNgrams = function(num){
        return ngrams;
    }

    /**
     *
     * Shows a small box that contains information about the ngram
     *
     * @param e the event that was fired
     *
     **/
    var ViewNgramDetails = function(e){
        var id = "box_" + $(this).text();
        if($(e.target).is("a")){
            return 0;
        }
        if($("#" + id).length){
            return 0;
        }
        var msg = new Utilities.Message("",$(this));
        msg.Add($(this).text())
           .Add("LL: " + $(this).find(".ngram_ll").val())
           .Add("PMI: " + $(this).find(".ngram_pmi").val())
           .AddId(id)
           .AddCloseButton();
        msg.Show(99999);
    };


    /**
     *
     * Gets a list for the most frequent words in all the languages
     * in order to reduce the number of ngrams to be queried in the 
     * next stage
     *
     * @param picked_code code of the document under examination
     *
     **/
    function GetWordLists(picked_code){
        var langs = Loaders.GetLanguagesInCorpus(),
            picked_lang = Loaders.GetPickedLang(),
            responses = [],
            codes = Loaders.GetPickedCodesInAllLanguages(),
            msg = new Utilities.Message("Querying word lists..."),
            bar = new Utilities.ProgressBar(msg.$box);
        msg.Show(9999);
        bar.Initialize(langs.length);
        $.each(langs,function(lidx, lang){
            if(lang != source_lang){
                var pat = new RegExp("(_?)" + picked_lang + "$","g");
                responses.push($.getJSON("php/ajax/get_frequency_list.php",
                    {
                    action: "corpus_frequency_list",
                    codes:codes[lang],
                    codes: [picked_code.replace(pat,"$1" + lang)],
                    lang: lang,
                    bylang: "yes"
                    }, 
                    function(){
                        bar.Progress();
                    }
                ));
            }
        });
        return $.when.apply($, responses).done(function(){
            $.each(arguments,function(idx,arg){
                msg.Destroy();
                lang = Object.keys(arg[0])[0],
                words_in_doc[lang] = arg[0][lang];
            });
        });
    }

    /**
     *
     * Picks one language as a source and filters the other languages' keyword to
     * produce a list of possible multilingual keywords
     *
     * @param sl_keywords array of the keywords in the source language
     *
     **/
    function FilterByDictionary(sl_keywords){
        var all_langs = Loaders.GetLanguagesInCorpus(),
            target_langs = [],
            msg = new Utilities.Message("Looking up wiktionary to filter the key word lists...", $(".container")),
            bar = new Utilities.ProgressBar(msg.$box);
        filtered_by_dict_keywords = [];
        bar.Initialize(number_of_topicwords);
        msg.Show(999999);
        $.each(all_langs,function(idx, lang){
            if(lang != source_lang){
                target_langs.push(lang);
            }
        });
        var filtered = [];
        $.each(sl_keywords,function(idx,word){
            //Search for translation for each of the key word in the language
            //chosen as source (default: english)
            console.log(word);
            params = {
                "action": "GetTranslations" ,
                "source_word": word.lemma,
                "langs": target_langs
            };
            filtered.push($.getJSON("php/ajax/get_frequency_list.php",params,function(data){
                bar.Progress()
            }));
        });
        return $.when.apply($, filtered).done(function(){
            ajax_args = arguments;
            msg.Destroy();
            for(var i = 0; i<ajax_args.length; i++){
                //Iterating through EACH keyword in the source language
                var word = ajax_args[i][0],
                    source_word = Object.keys(word)[0],
                    has_at_least_one_translation = false,
                    this_keyword = {};
                this_keyword[source_lang] = [source_word];
                $.each(target_langs,function(lidx,lang){
                    //Pick the translations for each target lang
                    //and make sure at least one language has some.
                    this_keyword[lang] = [];
                    if(word[source_word][lang].length){
                        has_at_least_one_translation = true;
                        this_keyword[lang] = word[source_word][lang];
                    }
                });
                if(has_at_least_one_translation){
                   filtered_by_dict_keywords.push(this_keyword);
                }
                else{
                    //If no translation found, remove this word from the ranked keywords
                    sl_keywords_ranked.splice(i,1);
                }
            }
            console.log(filtered_by_dict_keywords);
        }); 
    } 

    /**
     *
     * Gets ngrams for each of the key words  for each of the languages
     *
     *
     **/
    function SetNgrams(){
        //CorpusActions.SubCorpusCharacteristics.PrintNgramList
        var keyword_source = filtered_by_dict_keywords,
            langs = Loaders.GetLanguagesInCorpus(),
            all_ngrams = [],
            codes = Loaders.GetPickedCodesInAllLanguages(),
            msg = new Utilities.Message("Building the ngrams. This will take some time...", $(".container")),
            bar = new Utilities.ProgressBar(msg.$box),
            total_words = 0;
        //COUNT all the ngrams that have to be searched for
        //and use that information for the progress bar
        $.each(keyword_source, function(keyword_idx, this_keyword){
            $.each(langs,function(lang_idx,lang){
                $.each(this_keyword[lang], function(lemma_idx, lrd_lemma){
                    if( lang == source_lang || words_in_doc[lang].indexOf(lrd_lemma)>-1){
                        total_words += ngram_range[1] - ngram_range[0] + 1;
                    }
                });
            });
        });
        msg.Show(999999);
        bar.Initialize(total_words);
        //Start fetching the ngrams from the backend
        $.each(keyword_source,function(keyword_idx,this_keyword){
            $.each(langs,function(lang_idx,lang){
                if(this_keyword[lang].length){
                    $.each(this_keyword[lang], function(lemma_idx, lrd_lemma){
                        if( lang == source_lang || words_in_doc[lang].indexOf(lrd_lemma)>-1){
                            //Only search for ngrams for words 
                            //that actually appear in the document
                            for(var n = ngram_range[0]; n <= ngram_range[1]; n++){
                                var params = {
                                    n:n,
                                    lemmas:"no",
                                    must_include: lrd_lemma,
                                    included_word_lemma: true,
                                    ldr_paradigm: lrd_paradigm,
                                    codes: codes[lang],
                                    action: "lrd_ngram_list",
                                    lang: lang,
                                    lrd_rank: sl_keywords_ranked.indexOf(this_keyword[source_lang][0])+1,
                                    remove_hashes: "yes",
                                };
                                all_ngrams.push($.getJSON("php/ajax/get_frequency_list.php", params,
                                    function(data){
                                        bar.Progress();
                                        console.log(data);
                                    }
                                ));
                            }
                        }
                    });
                }
            });
        });
        return $.when.apply($, all_ngrams).done(function(){
            bar.Destroy();
            tabdata = {};
            for(var i = 0; i < arguments.length; i++ ){
                var lang = Object.keys(arguments[i][0])[0],
                    word_rank = Object.keys(arguments[i][0][lang])[0]*1,
                    n = Object.keys(arguments[i][0][lang][word_rank])[0];
                if(!tabdata[lang]){
                    tabdata[lang] = {};
                }
                if(!tabdata[lang][word_rank]){
                    tabdata[lang][word_rank] = {};
                }
                if(!tabdata[lang][word_rank][n]){
                    tabdata[lang][word_rank][n] = [];
                }
                var these_ngrams = arguments[i][0][lang][word_rank][n];
                //FInally, sort by LL or PMI
                these_ngrams.sortOn(lrd_method,"desc");
                //By default, don't take every ngram 
                //THIS filters out bad translations!
                tabdata[lang][word_rank][n] = these_ngrams.slice(0,ngram_number);
            }
            //Add missing languages as empty entries
            $.each(langs,function(l_idx, lang){
                if(lang != source_lang){
                   if(!tabdata[lang]){
                       tabdata[lang] = {};
                   }
                   for(i=1; i <= sl_keywords_ranked.length; i++){
                       if(!tabdata[lang][i]){
                           tabdata[lang][i] = {};
                       }
                        for(var n = ngram_range[0]; n <= ngram_range[1]; n++){
                           if(!tabdata[lang][i][n]){
                               tabdata[lang][i][n] = "";
                           }
                        }
                   }
                }
            });
            console.log(tabdata);
            ngrams = tabdata;
            msg.Destroy();
        });
    }


    /**
     *
     * Run the lrdTAB functionality
     *
     * @param sl_wordlist_response the ajax response from the keyword list for the source language
     * @param ExamineTopicsObject the object that called this function
     * @param picked_code the code of the document under examination
     *
     **/
    function Run(sl_wordlist_response, ExamineTopicsObject, picked_code){
        $.when(sl_wordlist_response).done(function(){
            sl_keywords_ranked = [];
            ExamineTopicsObject.msg.Destroy();
            var sl_keywords = arguments[0];
            sl_keywords.sortOn("tf_idf","desc");
            sl_keywords  = sl_keywords.slice(0,number_of_topicwords);
            $.each(sl_keywords, function(kw_idx, keyword){
                sl_keywords_ranked.push(keyword.lemma);
            });
            $.when(GetWordLists(picked_code)).done(function(){
                $.when(FilterByDictionary(sl_keywords)).done(function(){
                    $.when(SetNgrams()).done(function(){
                        console.log("GINISHED");
                        ExamineTopicsObject.BuildLRDTable(ngrams);
                    });
                });
            });
        });
    }

    /**
     *
     * Initializes the parameters the user can use to adjust
     *
     *
     **/
    function InitializeControls(){
    
        $("#LRDtab_method").selectmenu();
        $("#LRDtab_method").on("selectmenuchange", SetLRDmethod);
        $("#LRDtab_paradigm").selectmenu();
        $("#LRDtab_paradigm").on("selectmenuchange", SetLRDparadigm);
        $("#LRDtab_ngramnumber").slider(
            {
            min:1,
            max:20,
            value: ngram_number,
            change: SetNgramNumber,
            })
            .parent().find(".slider_result").text(ngram_number);
        $("#LRDtab_nwords").slider(
            {
            min:2,
            max:20,
            value: number_of_topicwords,
            change: SetNumberOfTopicWords
            })
            .parent().find(".slider_result").text(number_of_topicwords);
        $("#LRDtab_ngramrange").slider(
            {
            range:true,
            values:ngram_range,
            min:2,
            max:10,
            change: SetNgramRange
            })
            .parent().find(".slider_result").text(ngram_range.join(" - ")); ;
    }

    return {
    
        Run,
        InitializeControls,
        ViewNgramDetails,
        GetNumberOfTopicWords,
        GetNgramRange,
        GetSourceLang,
    
    }

}();
