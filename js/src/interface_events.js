/**
 *
 * Adds the basic functionality to the interface by attaching the relevant events
 *
 **/
$(document).ready(function(){
    //Load the name of the corpus. When done, load the list of languages available
    Loaders.SetCurrentCorpus(Loaders.ListLanguagesInThisCorpus)
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
    $(".select_other_function button").click(function(){
        if(!$("#other_functions_menu").is(":visible")){
            $(this).text("Hide functionmenu");
        }
        else{
            $(this).text("Other functions");
        }
        $("#other_functions_menu").slideToggle()
    });
    $(".start_rnd button").click(function(){
        if(!$("#rnd_action").is(":visible")){
            $(this).text("Hide LRD");
        }
        else{
            $(this).text("LRD");
        }
        $("#rnd_action").slideToggle()
    });
    //Defining possible actions on corpora
    $("#corpusaction a, #corpusaction button, #rnd_action button").click(function(){
        $(".select_action button").text("Select action");
        var actions = $(this).attr("class").replace(/ *(opened|closed) */g,"").split(" ");
        console.log(actions);
        if(actions.length == 2){
            CorpusActions[actions[0]][actions[1]]();
        }
        else{
            CorpusActions[actions[0]]();
        }
    });
    //Defining possible corpus management actions 
    $("#other_functions_menu a").click(function(){
        var actions = $(this).attr("class").split(" ");
        if(actions.length == 2){
            CorpusManagementActions[actions[0]][actions[1]]();
        }
        else{
            CorpusManagementActions[actions[0]]();
        }
    });
    //Basic lightbox hiding functionality
    $(".boxclose").click(function(){
        $(this).parents(".my-lightbox").fadeOut();
        console.log("closed...");
        //Attempt: freeing up memory
        $.each(Corpusdesktop.GarbageList,function(id,el){
            if (id in Corpusdesktop.ElementList){
            }
            else{
                //If the object hasn't been added to the desktop, delete it
                Corpusdesktop.GarbageList[id] = undefined;
                console.log("deleted " + id);
            }
        });
    });
    //Corpus desktop
    $("#show_desktop_objects_link").click(function(){
        $("aside").slideToggle();
    })
    //Events for the corpus desktop
    Corpusdesktop.AddDesktopEvents();

    //Events for tf_idf
    $(".lrd_menu li").click(function() {
            CorpusActions.ExamineTopics.ChooseParadigm($(this));
        }
    );

});
