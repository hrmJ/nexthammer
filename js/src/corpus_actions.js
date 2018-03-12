/**
 *
 * The actual functionality of the interface: what we can do whit the corpora
 *
 **/

var CorpusActions = function(){

    var ExamineTopics = {

        /**
         *
         * Display the list of the texts of the current subcorpus as links
         * TODO: make this more general
         *
         **/
        DisplayTexts: function(){
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
                    freqlist.SetName(picked_code).SetHeader(["Lemma","Freq","TF_IDF","NB"]).SetRows(data).BuildOutput();
                    freqlist.$container.appendTo($details_li.hide());
                    $details_li.slideDown()
                }
            );
        }
    
    };


    return {
    
        ExamineTopics,
    
    };

}();
