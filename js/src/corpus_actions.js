/**
 *
 * The actual functionality of the interface: what we can do with the corpora
 *
 **/

var CorpusActions = function(){

    /**
     *
     * Basic characteristics about a collection of texts. E.g. frequency lists etc.
     *
     **/
    var SubCorpusCharacteristics = {

        /**
         * Show options related to ngrams
         *
         */
        DisplayNgramOptions: function(){
            $("#ngrams_params_menu").slideToggle();
            $(".DisplayNgramOptions").toggleClass("opened").toggleClass("closed");
        },
    
        /**
         *
         * Print an ngram list
         *
         * @param must_include Ngrams have to include this word or lemma
         * @param predifined_n if which grams is determined programmatically, then a number (2-5)
         * @param predifined_lemmas lemmas or not, if defined programmatically
         *
         */
        PrintNgramList: function(params, desktop_name){
            var self = this;
            $("#corpusaction").hide();
            $(".my-lightbox:not(.lrd_menu)").hide();
            params = params || {
                //Default ajax parameters for ngrams
                n:   $("[name='ngram_n_number']").val()*1 || 2,
                lemmas:  ($("[name='ngram_lemma']").get(0).checked ? "yes" : "no"),
            }
            params.action = "corpus_ngram_list";
            params.codes = Loaders.GetPickedCodes();
            params.lang = Loaders.GetPickedLang();
            var msg = new Utilities.Message("Loading...", $(".container"));
            var secs = 0;
            var loadtime = setInterval(function(){
                secs++;
                msg.Update("Loading... (" + secs + " seconds )");
            },1000);
            msg.Show(99999);
            console.log(params);
            $.getJSON("php/ajax/get_frequency_list.php", params,
                function(data){
                    clearInterval(loadtime);
                    console.log(data);
                    msg.Update("Loading took " + secs + " seconds.");
                    setTimeout(function(){msg.Destroy()},2000);
                    var freqlist = new Corpusdesktop.Table();
                    freqlist
                        .SetName(desktop_name || "Ngrams (the whole subcorpus)")
                        .SetHeader(["Ngram","Freq", "LL","MI"])
                        .SetRows(data.slice(0,1000)).BuildOutput();
                    freqlist.$container.appendTo($("#texts_to_examine").html(""));
                    $(".text_examiner").fadeIn();
                }
            );
        },

        /**
         *
         * Print a frequency list
         *
         */
        PrintFrequencyList: function(){
            $("#corpusaction").hide();
            var self = this;
            $(".my-lightbox").hide();
            params = {
                action:"corpus_frequency_list",
                codes: Loaders.GetPickedCodes(),
                lang: Loaders.GetPickedLang()
            };
            var msg = new Utilities.Message("Loading...", $(".container"));
            msg.Show(9999999);
            $.getJSON("php/ajax/get_frequency_list.php", params,
                function(data){
                    msg.Destroy();
                    var freqlist = new Corpusdesktop.Table();
                    freqlist
                        .SetName("Frequencylist (the whole subcorpus)")
                        .SetHeader(["Lemma","Freq","NB"])
                        .SetRows(data).BuildOutput();
                    freqlist.$container.appendTo($("#texts_to_examine").html(""));
                    $(".text_examiner").fadeIn();
                }
            );
        }

        
    }
    

    /**
     *
     * Determining what words are typical for  a certain document
     *
     **/
    var ExamineTopics = {


        tf_idf_baseline: 0,
        lrd_lemma: "",
        current_n:2,

        /**
         *
         * Give the user a chance to determine parameters for the topic-counting function.
         *
         **/
        DisplayOptions: function(){
            $("#topic_params_menu").slideToggle();
            $(".DisplayOptions").toggleClass("opened").toggleClass("closed");
        },

        /**
         *
         * Display the list of the texts of the current subcorpus as links
         *
         * @param text_action What to do when the text name is clicked
         *
         **/
        DisplayTexts: function(text_action){
            $("#rnd_action").hide();
            $(".start_rnd button").text("LRD");
            var self = this;
            text_action  = text_action || this.DisplayWordsInText.bind(this);
            $(".my-lightbox").hide();
            var $ul = $("<ul>");
            $.each(Loaders.GetPickedTexts(),function(idx,el){
                var $li = $(`<li class='actionlist'>${el.title}</li>`).click(text_action);
                var $input = $(`<input type='hidden' name='code' value=${el.code}></input>`);
                var $li_below = $("<li class='text_details'></li>");
                $ul.append($li.append($input)).append($li_below);
            });
            $ul.appendTo($("#texts_to_examine").html(""));
            $(".text_examiner").fadeIn();
        },

        /**
         *
         * Opens a table of the key words in the selected text
         *
         * @param e the click event
         *
         **/
        DisplayWordsInText: function(e){
            if( !$(e.target).next().find("table").length ){
                //If data not already loaded
                this.ExamineThisText($(e.target)); 
            }
            else{
                $(e.target).toggleClass("opened").next().slideToggle();
            }
        },

        /**
         *
         * Launches the LRDtab functionality
         *
         * @param e the click event
         *
         **/
        DisplayLRDTab: function(e){
            if( !$(e.target).next().find("table").length ){
                //If data not already loaded
                this.LaunchLRDTab($(e.target)); 
            }
            else{
                $(e.target).toggleClass("opened").next().slideToggle();
            }
        },

        /**
         *
         * Display the list of the texts of the current subcorpus as links. 
         * Clicking each text starts the process for building a mutlilingual
         * LRD table for the text
         *
         **/
        DisplayTextsForTab: function(){
            ExamineTopics.DisplayTexts(this.DisplayLRDTab.bind(this));
        },

        /**
         *
         * Examine the text in question
         *
         * @param $parent_li the li element above the link that fired the event
         * @param params If the parameters have been preset by another function
         * @param custom_callback call anothre callback insted of the default BuildTfIdfTable
         * @param no_msg do not show a loading message, if this is true
         *
         **/
        ExamineThisText: function($parent_li, params, custom_callback, no_msg){
            var self = this;
            var callback = custom_callback || this.BuildTfIdfTable.bind(this);
            picked_code = $parent_li.find("input[name='code']").val();
            params = params || {
                action:"examine_text",
                picked_code: picked_code,
                codes: Loaders.GetPickedCodes(),
                lang: Loaders.GetPickedLang()
            };
            if(!no_msg){
                this.msg = new Utilities.Message("Loading...", $parent_li);
                this.msg.Show();
            }
            this.$parent_li = $parent_li;
            return $.getJSON("php/ajax/get_frequency_list.php", params, callback);
        },

        /**
         *
         * Builds a table for representing tf_idf data
         *
         **/
        BuildTfIdfTable: function(data){
                    var $details_li = this.$parent_li.next();
                    this.msg.Destroy();
                    this.$parent_li.addClass("opened");
                    var freqlist = new Corpusdesktop.Table();
                    var normalize = true;
                    if(normalize){
                        var newdata = [];
                        var tf_idf_baseline =  $("[name='tf_idf_baseline']").val()*1  || 0;
                        $.each(data,function(idx,row){
                            if(row.nb*1 > 0 
                             && row.tf_idf >= tf_idf_baseline){
                                newdata.push(row);
                            }
                        });
                    }
                    freqlist.SetName(picked_code).SetHeader(["Lemma","Freq","TF_IDF","NB"]).SetRows(newdata).BuildOutput();
                    freqlist.$container.appendTo($details_li.hide());
                    freqlist.AddRowAction(this.ExamineThisRow.bind(this), 2);
                    $details_li.slideDown();
        },


        /**
         *
         * Builds a table for representing tf_idf data in a special table for
         * analysis
         *
         **/
        BuildLRDTable: function(data){
                    var $details_li = this.$parent_li.next();
                    this.msg.Destroy();
                    this.$parent_li.addClass("opened");
                    var freqlist = new Corpusdesktop.Table();
                    var tabdata = [];
                    var langs = Loaders.GetLanguagesInCorpus();
                    var headerlangs = [];
                    var ngramrange = LRDtab.GetNgramRange();
                    console.log(data);
                    $.each(data[langs[0]],function(keyword_idx, keyword_data){
                        tabdata.push({});
                    });
                    $.each(data,function(lang, langdata){
                        headerlangs.push(lang);
                        for(var i = 0; i < LRDtab.GetNumberOfTopicWords(); i++){
                            if(langdata[i+1]){
                                $ul = $("<ul class='ldrtab'></ul>");
                                for(var n = ngramrange[0]; n <= ngramrange[1]; n++){
                                    var ngram_data = langdata[i+1][n];
                                    $ul.append(`<li><strong>${n}</strong></li>`);
                                    $.each(ngram_data,function(idx, this_ngram){
                                        if(this_ngram){
                                            $(`<li class='LRD_ngram'>${this_ngram.ngram}
                                                <input type='hidden' class='ngram_ll' value='${this_ngram.LL}'></input>
                                                <input type='hidden' class='ngram_pmi' value='${this_ngram.PMI}'></input>
                                            </li>`).appendTo($ul);
                                        }
                                    });
                                }
                                tabdata[i][lang] = $ul.get(0).outerHTML;
                            }
                        }
                    });
                    freqlist.SetName(this.$parent_li.text())
                            .SetClass("lrd_table")
                            .SetHeader(headerlangs)
                            .SetRows(tabdata)
                            .BuildOutput();
                    freqlist.$container.appendTo($details_li.hide());
                    $(".LRD_ngram").click(LRDtab.ViewNgramDetails);
                    //freqlist.AddRowAction(this.ExamineThisRow.bind(this), 2);
                    //ADD an action to inspect LL etc
                    $details_li.slideDown();
        },

        /**
         *
         * ASKS for  the LRDtab function from the backend
         *
         * @param $parent_li the li element above the link that fired the event
         *
         **/
        LaunchLRDTab: function($parent_li){
            var self = this;
            picked_code = $parent_li.find("input[name='code']").val();
            picked_lang = Loaders.GetPickedLang();
            langs = Loaders.GetLanguagesInCorpus();
            codes = Loaders.GetPickedCodesInAllLanguages();
            var words = [];
            var tf_idf = {};
            var bar;
            this.msg = new Utilities.Message("Loading...", $parent_li);
            this.msg.Show();
            $.each(langs,function(idx,lang){
                var pat = new RegExp("(_?)" + picked_lang + "$","g");
                words.push(self.ExamineThisText(
                    $parent_li, 
                    {
                    action:"examine_text",
                    picked_code: picked_code.replace(pat,"$1" + lang),
                    lang: lang,
                    codes: codes[lang]
                    },
                    function(){
                        if(!bar){
                            bar = new Utilities.ProgressBar(self.msg.$box);
                            bar.Initialize(langs.length);
                        }
                        bar.Progress();
                        //self.msg.Add(lang + " done.");
                    }, true));
            });

            LRDtab.Run(words, self);

        },

        /**
         *
         * Examine the row (the lemma) in question. Prints out a list of ngrams containing this word
         *
         * @param $launcher the element that fired the event
         *
         **/
        ExamineThisRow: function($launcher){
            var self = this;
            $(".my-lightbox").hide();
            $(".lrd_menu").fadeIn();
            this.lrd_lemma = $launcher.text();
        },


        /**
         *
         * Choose, whether to use a verb-centered or a noun centered set of filters for ngrams
         *
         * @param $launcher the list element that fired the event
         *
         **/
        ChooseParadigm: function($launcher){
            this.current_n = $launcher.attr("id").replace(/.*_(\d+)/g,"$1") * 1;
            var $menu = $launcher.find("ul");
            if(!$menu.length){
                var $ul = $(`
                    <ul>
                        <li>Noun-centered</li>
                        <li>Verb-centered</li>
                    </ul>`);
                //$nounli.click()
                $ul.appendTo($launcher).hide().slideDown();
                var self = this;
                $ul.find("li").click(function(){
                    self.PrintNgrams($(this).text());
                });
            
            }else
            {
                $menu.slideToggle();
            }
            
        },

        /**
         *
         * Print ngram lists based on the words defined by tf_idf
         *
         * @param paradigm Noun-centered or Verb-centered
         *
         **/
        PrintNgrams: function(paradigm){
            CorpusActions.SubCorpusCharacteristics.PrintNgramList(
                {
                    n:this.current_n,
                    lemmas:"no",
                    must_include: this.lrd_lemma,
                    included_word_lemma: true,
                    ldr_paradigm: paradigm,
                },
                `${this.current_n}-grams with ${this.lrd_lemma}`
            );
        },

    };


    return {
    
        ExamineTopics,
        SubCorpusCharacteristics
    
    };

    }();
