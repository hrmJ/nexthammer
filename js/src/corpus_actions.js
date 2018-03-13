/**
 *
 * The actual functionality of the interface: what we can do whit the corpora
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
         *
         * Print a frequency list
         *
         **/
        PrintFrequencyList: function(){
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

        /**
         *
         * Give the user a chance to determine parameters for the topic-counting function.
         *
         **/
        DisplayOptions: function(){
            $("#topic_params_menu").slideToggle();
        },

        /**
         *
         * Display the list of the texts of the current subcorpus as links
         * TODO: make this more general
         *
         **/
        DisplayTexts: function(){
            $("#corpusaction").hide();
            var self = this;
            $(".my-lightbox").hide();
            var $ul = $("<ul>");
            $.each(Loaders.GetPickedTexts(),function(idx,el){
                var $li = $(`<li class='actionlist'>${el.title}</li>`);
                var $input = $(`<input type='hidden' name='code' value=${el.code}></input>`);
                var $li_below = $("<li class='text_details'></li>");
                $li.click(function(){ 
                    if( !$(this).next().find("table").length ){
                        //If data not already loaded
                        self.ExamineThisText($(this)); 
                    }
                    else{
                        $(this).toggleClass("opened").next().slideToggle();
                    }
                });
                $ul.append($li.append($input)).append($li_below);
            });
            $ul.appendTo($("#texts_to_examine").html(""));
            $(".text_examiner").fadeIn();
        },


        /**
         *
         * Examine the text in question
         *
         * @param $parent_li the li element above the link that fired the event
         *
         **/
        ExamineThisText: function($parent_li){
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
                        console.log(tf_idf_baseline);
                        $.each(data,function(idx,row){
                            if(row.nb*1 > 0 
                             && row.tf_idf >= tf_idf_baseline){
                                newdata.push(row);
                            }
                        });
                    }
                    freqlist.SetName(picked_code).SetHeader(["Lemma","Freq","TF_IDF","NB"]).SetRows(newdata).BuildOutput();
                    freqlist.$container.appendTo($details_li.hide());
                    $details_li.slideDown()
                }
            );
        }
    
    };


    return {
    
        ExamineTopics,
        SubCorpusCharacteristics
    
    };

}();
