/**
 *
 * Adds the basic functinality to the interface by attaching the relevant events
 *
 **/
$(document).ready(function(){
    //Load the name of the corpus. When done, load the list of languages available
    $.get("php/ajax/get_corpus_information.php",
        {action:"corpus_name"},
        function(corpus_name){
            $(".corpus_select").text(corpus_name);
            Loaders.ListLanguagesInThisCorpus(corpus_name);
        });
    //Displaying the current subcorpus
    $(".current_subcorpus").click(function(){$(".textpicker").fadeToggle()});
    //Open the actions subwindow
    $(".select_action button").click(function(){
        if(!$("#corpusaction").is(":visible")){
            $(this).text("Hide actionmenu");
        }
        else{
            $(this).text("Select action");
        }
        $("#corpusaction").slideToggle()
    });
    //Defining possible actions on corpora
    $("#corpusaction a").click(function(){
        $("#corpusaction").hide();
        $(".select_action button").text("Select action");
        var actions = $(this).attr("class").split(" ");
        if(actions.length == 2){
            CorpusActions[actions[0]][actions[1]]();
        }
        else{
            CorpusActions[actions[0]]();
        }
    });
    //Basic lightbox hiding functionality
    $(".boxclose").click(function(){$(this).parents(".my-lightbox").fadeOut()});
    //Corpus desktop
    $("#show_desktop_objects_link").click(function(){
        $("aside").slideToggle();
    })
    //Events for the corpus desktop
    Corpusdesktop.AddDesktopEvents();

});
