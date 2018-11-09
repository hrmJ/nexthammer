/**
 *
 * Additional functionality for the interface: managing corpora, adding
 * stopwords etc.
 *
 **/

const CorpusManagementActions = function(){

    /**
     *
     * Managing stopwords for frequency lists etc.
     *
     **/
    var ManageStopWords = {
    
        /**
         *
         * Print a list of the current stopwords
         *
         * @param dontslide boolean whether or not to display the slide down animation
         *
         **/
        PrintCurrentStopWords: function(dontslide){
            var self = this;
            var dontslide = dontslide || false;
            $.getJSON("php/ajax/corpus_management.php", {"action":"list_stopwords"},
                function(stopwords){
                    var $ul = $("<ul class='datalist'></ul>");
                    var $add_new = $("<li>");
                    $add_new.append("<input type='text' placeholder='Add a new stopword'></input>")
                            .append($("<button> Add </button>")
                                    .click(function(){
                                        var stopword = $(this).prev().val();
                                        self.AddNewStopWord(stopword);
                                    })
                                    );
                    $ul.append($add_new);
                    $.each(stopwords,function(idx,word){
                        $ul.append(`<li>${word}</li>`)
                    });
                    var $li = $(".PrintCurrentStopWords:eq(0)").parent();
                    $li.find("ul").remove();
                    $li.append($ul);
                    if(!dontslide){
                        $ul.hide().slideDown();
                    }
                }
            );
        },

        /**
         *
         * Adds a new stopword to the database
         *
         * @param stopword the word to be added
         *
         **/
        AddNewStopWord: function(stopword){
            var self = this;
            $.get("php/ajax/corpus_management.php",{"action":"insert_stopword","new_word":stopword},
            function(){
                self.PrintCurrentStopWords(true);
            });
        }

    }



    return {
        ManageStopWords,
    
    };

}();

export default CorpusManagementActions;
