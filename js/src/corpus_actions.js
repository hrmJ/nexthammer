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
            msg.Show(9999999);
            $.getJSON("php/ajax/get_frequency_list.php", params,
                function(data){
                    console.log(data);
                    msg.Destroy();
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
                $li.click(text_action);
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
         * Display the list of the texts of the current subcorpus as links. 
         * Clicking each text starts the process for building a mutlilingual
         * LRD table for the text
         *
         **/
        DisplayTextsForTab: function(){
            ExamineTopics.DisplayTexts();
        },

        /**
         *
         * Examine the text in question
         *
         * @param $parent_li the li element above the link that fired the event
         *
         **/
        ExamineThisText: function($parent_li){
            var self = this;
            picked_code = $parent_li.find("input[name='code']").val();
            params = {
                action:"examine_text",
                picked_code: picked_code,
                codes: Loaders.GetPickedCodes(),
                lang: Loaders.GetPickedLang()
            };
            var msg = new Utilities.Message("Loading...", $parent_li);
            var $details_li = $parent_li.next();
            msg.Show(9999999);
            $.getJSON("php/ajax/get_frequency_list.php", params,
                /**
                 *
                 * Build a table. TODO: abstract this.
                 *
                 **/
                function(data){
                    msg.Destroy();
                    $parent_li.addClass("opened");
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
                    freqlist.AddRowAction(self.ExamineThisRow.bind(self), 2);
                    $details_li.slideDown()
                }
            );
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
