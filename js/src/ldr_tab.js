/**
 * 
 * Gives the user multilingual tables of ngrams. The ngrams are sorted
 * by either Log Likelihood (LL) or Mutual information  (MI/PMI) values.
 * Only ngrams including thematically relevant words are taken into account.
 * These words are filtered with the help of tf_idf values.
 *
 *
 * @param keywords the words filtered after tf_idf
 * @param filtered_by_dict_keywords the words filtered after consulting a dictionary
 * @param number_of_topicwords how many words for each document
 * @param ngram_range from which ngrams to which [start, end]
 * @param ngram_number how many ngrams for each individual key word
 * @param lrd_method LL or PMI
 * @param lrd_paradigm how to filter the ngrams: Noun-centered or Verb-centerd
 *
 **/
var LRDtab = function(){

    keywords = {};
    filtered_by_dict_keywords = {};
    ngrams = [];
    number_of_topicwords = 10;
    ngram_range = [2,3];
    ngram_number = 3;
    lrd_method = "LL";
    lrd_paradigm = "Noun-centered";
    source_lang = "en",


    /**
     *
     * Defines, what method will be used for picking
     * the top ngrams
     *
     *
     **/
    SetLRDmethod = function(){
        lrd_method = $(this).val();
    }

    /**
     *
     * Defines, what paradigm will be used for constructing the ngrams
     *
     *
     **/
    SetLRDparadigm = function(){
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
    SetNumberOfTopicWords = function(e, ui){
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
    SetNgramRange = function(e, ui){
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
    SetNgramNumber = function(e, ui){
        $(e.target).parent().find(".slider_result").text(ui.value);
        ngram_number = ui.value;
    }

    /**
     *
     * Gets the whole data table for ngrams
     *
     **/
    GetNgrams = function(num){
        return ngrams;
    }

    /**
     *
     * Shows a small box that contains information about the ngram
     *
     * @param e the event that was fired
     *
     **/
    ViewNgramDetails = function(e){
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
     * Process a response from an ajax request. Possibly, sort the response.
     *
     * @param ajax_args the actual ajax response
     * @param how_many_returns how many items to take
     * @param sortkey by what key to sort
     * @param limit_keys take only these values to the final result
     *
     **/
    function ProcessResponse(ajax_args, how_many_returns, sortkey, limit_keys){
        return_array = [];
        how_many_returns = how_many_returns || ajax_args.length;
        for(var i = 0; i < ajax_args.length; i++){
            var result = [];
            var this_response = ajax_args[i][0];
            //console.log(this_response);
            if(sortkey){
                this_response.sort(
                        function(a,b) {
                            return a[sortkey] - b[sortkey];
                        }
                );
            }
            if(!this_response.length){
                result.push(this_response);
            }
            else{
                for(var a=1;a<=how_many_returns;a++){
                     if(limit_keys){
                        result.push(this_response[this_response.length-a][limit_keys]);
                    }
                    else{
                        result.push(this_response[this_response.length-a]);
                    }
                }
            }
            return_array.push(result);
        }
        return return_array;
    }

    /**
     *
     * Gets a list of keywords for the document in all languages
     *
     * @param words array of ajax responses
     *
     **/
    function SetTfIdf(words){
        return $.when.apply($, words).done(function(){
            return_array = ProcessResponse(arguments, number_of_topicwords, "tf_idf","lemma");
            var lang_object = {};
            var langs = Loaders.GetLanguagesInCorpus();
            $.each(langs,function(idx,lang){
                lang_object[lang] = return_array[idx];
            });
            keywords = lang_object;
        });
    }

    /**
     *
     * Picks one language as a source and filters the other languages' keyword to
     * produce a list of possible multilingual keywords
     *
     **/
    function FilterByDictionary(){
        var langs = Loaders.GetLanguagesInCorpus();
        var target_langs = [];
        $.each(langs,function(idx, lang){
            if(lang != source_lang){
                target_langs.push(lang);
            }
            //Create a table for the filtered words
            filtered_by_dict_keywords[lang] = [];
        });
        var filtered = [];
        $.each(keywords[source_lang],function(idx,word){
            params = {
                "action": "GetTranslations" ,
                "source_word": word,
                "langs": target_langs
            };
            filtered.push($.getJSON("php/ajax/get_frequency_list.php",params,function(data){
                console.log(data);
            }));
        });
        $.when.apply($, filtered).done(function(){
            for(var i = 0; i<arguments.length; i++){
                //Iterating through EACH keyword in the source language
                var word = arguments[i][0];
                var source_word = Object.keys(word)[0];
                filtered_by_dict_keywords[source_lang].push(source_word);
                //Search for each target language and try to find words
                //that were among the keywords and are possible translations
                //of the source language keyword
               $.each(target_langs,function(lidx,lang){
                   var has_translations = false;
                   $.each(word[source_word][lang],function(tidx, translation){
                       var match_idx = keywords[lang].indexOf(translation);
                       if(match_idx > -1){
                           //If any word in the target language's keyword list matches,
                           //stop searching and use that
                           filtered_by_dict_keywords[lang].push(keywords[lang][match_idx]);
                           has_translations = true;
                           return false;
                       }
                   });
                   //If nothing found for this target language, add an empty
                   //string to mark this
                   if(!has_translations){
                       filtered_by_dict_keywords[lang].push("");
                   }
               });
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
        var langs = Loaders.GetLanguagesInCorpus();
        var all_ngrams = [];
        var codes = Loaders.GetPickedCodesInAllLanguages();
        var msg = new Utilities.Message("Building the ngrams. This will take some time...", $(".container"));
        var bar = new Utilities.ProgressBar(msg.$box);
        var total_words = 0;
        $.each(langs, function(lidx,lang){
            total_words += keywords[lang].length * (ngram_range[1] - ngram_range[0] + 1);
        });
        msg.Show(999999);
        bar.Initialize(total_words);
        $.each(langs,function(lang_idx,lang){
            lrdlemmas = keywords[lang];
            $.each(lrdlemmas, function(lemma_idx, lrd_lemma){
                for(var n = ngram_range[0]; n <= ngram_range[1]; n++){
                    var params = {
                        n:n,
                        lemmas:"no",
                        must_include: lrd_lemma,
                        included_word_lemma: true,
                        ldr_paradigm: lrd_paradigm,
                        codes: codes[lang],
                        action: "corpus_ngram_list",
                        lang: lang
                    };
                    all_ngrams.push($.getJSON("php/ajax/get_frequency_list.php", params,
                        function(data){
                            bar.Progress();
                            //console.log(lrd_lemma);
                        }
                    ));
                }
            });
        });
        return  $.when.apply($, all_ngrams).done(function(){
            bar.Destroy();
            ngrams = ProcessResponse(arguments, ngram_number, lrd_method);
            var groups_per_lang = ngram_range[1] - ngram_range[0];
            tabdata = {};
            $.each(langs,function(idx,lang){
                tabdata[lang] = [];
                per_lang = (ngram_range[1] - ngram_range[0] + 1);
                rows_processed = idx*number_of_topicwords*per_lang;
                for(var t = 1; t <= number_of_topicwords; t++){
                    //For every topic word
                    tabdata[lang].push({});
                    for(var n = ngram_range[0]; n <= ngram_range[1]; n++){
                        //For every ngram containing this topic word
                        tabdata[lang][tabdata[lang].length-1][n] = ngrams[rows_processed];
                        rows_processed++;
                    }
                }
            });
            ngrams = tabdata;
            msg.Destroy();
        });
    }


    /**
     *
     * Run the lrdTAB functionality
     *
     * @param words a list of ajax responses
     * @param ExamineTopicsObject the object that called this function
     *
     **/
    function Run(words, ExamineTopicsObject){
        $.when(SetTfIdf(words)).done(function(){
            ExamineTopicsObject.msg.Destroy();
            FilterByDictionary()
            //$words_translated  =  $.when(FilterByDictionary()).done(function(){
            //    console.log("DONE!");
            //});

            //$ngrams_done  =  $.when(SetNgrams()).done(function(){
            //    ExamineTopicsObject.BuildLRDTable(ngrams);
            //});

        }
        );
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
            value:3,
            change: SetNgramNumber,
            })
            .parent().find(".slider_result").text(ngram_number);
        $("#LRDtab_nwords").slider(
            {
            min:10,
            max:20,
            value:3,
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
    
    }

}();
