/**
 * 
 * @param ngram_range from which ngrams to which [start, end]
 *
 **/
var LRDtab = function(){

    keywords = [];
    ngrams = [];
    processed_items = [];
    number_of_topicwords = 2;
    ngram_range = [2,3];

    /**
     *
     * Defines, how many of the top words from the tf_idf list will be
     * taken into account
     *
     **/
    SetNumberOfTopicWords = function(){
        number_of_topicwords = $("[name='LRDtab_nwords']").val() || number_of_topicwords;
    }

    /**
     *
     * Defines, how many of the top words from the tf_idf list will be
     * taken into account
     *
     **/
    SetNgramRange = function(){
        ngram_range = $("[name='LRDtab_ngramrange']").val().split(",") || ngram_range;
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
     * Process a response from an ajax request
     *
     * @param ajax_args the actual ajax response
     * @param how_many_returns how many items to take
     * @param sortkey by what key to sort
     * @param limit_keys take only these values to the final result
     *
     **/
    function ProcessResponse(ajax_args, how_many_returns, sortkey, limit_keys){
        return_array = [];
        for(var i = 0; i < ajax_args.length; i++){
            var result = [];
            var this_response = ajax_args[i][0];
            this_response.sort(
                    function(a,b) {
                        return a[sortkey] - b[sortkey];
                    }
            )
            for(var a=1;a<=how_many_returns;a++){
                if(this_response.length-a>=0){
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
     * Gets ngrams for each of the key words  for each of the languages
     *
     *
     **/
    function SetNgrams(){
        //CorpusActions.SubCorpusCharacteristics.PrintNgramList
        var langs = Loaders.GetLanguagesInCorpus();
        var paradigm = "Noun-centered";
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
                        ldr_paradigm: paradigm,
                        codes: codes[lang],
                        action: "corpus_ngram_list",
                        lang: lang
                    };
                    all_ngrams.push($.getJSON("php/ajax/get_frequency_list.php", params,
                        function(data){
                            bar.Progress();
                            console.log(lrd_lemma);
                        }
                    ));
                }
            });
        });
        return  $.when.apply($, all_ngrams).done(function(){
            bar.Destroy();
            ngrams = ProcessResponse(arguments, 3, "LL","ngram");
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
     * Gets the list of keywords for each lang
     *
     * @param langs an array includin the correct order of languages
     *
     **/
    function GetKeyWordsByLang(langs){
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
            return $.when(SetNgrams()).done(function(){
                ExamineTopicsObject.BuildLRDTable(ngrams);
            });
        }
        );
    }

    return {
    
        Run,
        SetNumberOfTopicWords,
        SetNgramRange,
    
    }

}();
