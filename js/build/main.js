/**
 *
 * Just some small helper functions
 *
 **/


var Utilities = function(){

    /**
     *
     * Selects or unselects all checkboxes within a div
     *
     * @param $launcher the link that fired the event
     *
     */
    function SelectAll($launcher){
        if($launcher.text() == "Select all"){
            var newval = true;
            $launcher.text("Unselect all");
        }
        else{
            var newval = false;
            $launcher.text("Select all");
        }
        $launcher.parents("div").find("input[type='checkbox']").each(function(){
            $(this)[0].checked = newval;
        });
    
    };


    /**
     *
     * Olio lyhyiden viestien näyttämiseen hallintanäytöllä.
     *
     * @param msg näytettävä viesti
     * @param $parent_el jquery-elementti, jonka sisään viesti syötetään
     *
     */
    var Message = function(msg, $parent_el){
        this.$box = $("<div></div>").text(msg).attr({"class":"msgbox"});
        this.$parent_el = $parent_el || $("body");
    }

    Message.prototype = {
        background: "",
        color: "",

        /**
         * Näyttää viestilaatikon viesti käyttäjälle
         *
         * @param offtime millisekunteina se, kuinka kauan viesti näkyy (oletus 2 s)
         *
         */
        Show: function(offtime){
            var self = this;
            var offtime = offtime || 2000;
            this.$parent_el.css({"position":"relative"});
            this.$box.appendTo(this.$parent_el).fadeIn("slow");
            setTimeout(function(){ self.Destroy(); },offtime);
            
            //BlurContent(self.box);
        },

        Destroy: function(){
            var self = this;
            self.$parent_el.find(".msgbox").fadeOut("slow",function(){
                self.$parent_el.find(".msgbox").remove();
            });
        }
    }

    /**
     *
     * Generates unique ids, from  
     * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#2117523
     *
     **/
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    return {
        uuidv4,
        SelectAll,
        Message
    };

}();


//
// https://stackoverflow.com/questions/16648076/sort-array-on-key-value
Array.prototype.sortOn = function(key, direction){
    var direction = direction || "desc";
    if (direction == "asc"){
        this.sort(function(a, b){
            if(a[key] < b[key]){
                return -1;
            }else if(a[key] > b[key]){
                return 1;
            }
            return 0;
        });
    }
    else{
        this.sort(function(a, b){
            if(a[key] > b[key]){
                return -1;
            }else if(a[key] < b[key]){
                return 1;
            }
            return 0;
        });
    }
}

/**
 *
 * Controls the area and the elements where a user can add, view
 * and edit data retrieved from the corpus. This can be frequency tables,
 * concordances etc.
 *
 */
var Corpusdesktop = function(){


    //Object containing the jquery objects that can be presented
    //on the corpus desktop. The keys will be unique ids, which
    //will be linked to the corresponding "add to dekstop " link

    var ElementList = {};
    // Attempt to free up memory
    var GarbageList = {};

    //This variable reocords, which element is being dragged
    var CurrentElement = undefined;

    
    /**
     *
     *  Attaches events, specifically related to the corpus desktop
     *
     */
    function AddDesktopEvents(){
    
        $("#clead_dt_link").click(function(){
            ClearElements();
        });

        $(".drop-target")
            .on("dragover",function(event){
                event.preventDefault();  
                event.stopPropagation();
                console.log("over");
                //$(this).addClass("drop-highlight").text("Siirrä tähän");
            })
            .on("dragleave",function(event){
                console.log("left");
                event.preventDefault();  
                event.stopPropagation();
                //$(this).text("").removeClass("drop-highlight");
            })
            .on("drop",function(event){
                console.log("moi!");
                event.preventDefault();  
                event.stopPropagation();
                var $cont = $(this).parent();
                //if(!$cont.find(`div > input[value='${CurrentElement.id}']`).length){
                    //if this object has not been added yet on the desktop
                    var $dropped_object = CurrentElement.$container.clone(true);
                    $dropped_object.append($(`<input type='hidden' value='${CurrentElement.id}'></input>`))
                    $dropped_object.find(".data-table-menu").remove();
                    if($cont.find(".data-table-container").length){
                        $cont.find(".data-table-container:last-of-type").after($dropped_object);
                    }
                    else{
                        $cont.prepend($dropped_object);
                    }
                //}
            });
    };

    /**
     *
     * Clears the list of desktop elements
     *
     **/
    function ClearElements(){
        ElementList = {};
        UpdateVisibleElementList();
        $(".innercontent .data-table-container").remove();
    };


    /**
     *
     * Updates the list of dekstop elements, from which the user 
     * can choose the elements that will be displayed on the "corpus desktop"
     * and can be e.g. compared with each other.
     *
     */
    function UpdateVisibleElementList(){
        $("#desktop_element_list").html("");
        $.each(ElementList,function(id, element){
            var $li = 
                $(`<li draggable='true'>
                    <input type='hidden' class='desktop_object_id' value='${id}'></input>
                        ${element.name}
                    </li>`);
            $li.on("dragstart",function(event){ 
                        //For firefox combatibility
                         event.originalEvent.dataTransfer.setData('text/plain', 'anything');
                        //Hide the dekstop menu
                        //$("aside").slideUp();
                        CurrentElement = ElementList[$(this).find(".desktop_object_id").val()];
            });
            $("#desktop_element_list").append($li);
        });
    
    }


    /**
     *
     * Represents a basic building block of the elements that can be saved
     * as a desktop element. This can be concordance lists, frequency lists etc.
     *
     **/
    function DesktopObject(){
        var self = this;
        this.$container = $("<div class='data-table-container'></div>");
        //Functionality related to data tables and other types of desktop objects:
        this.id = Utilities.uuidv4();
        this.$menu = $(`<div class='data-table-menu'>
            <input type='hidden' class='desktop_object_id' value='${this.id}'></input>`);
        $a = $("<a href='javascript:void(0)'>Add to desktop</a>");
        $a.click(function(){ self.AddToDesktop($(this).parent()); });
        this.$menu.append($a);
        this.name = "";

        /**
         *
         * Sets the name of the table
         *
         * @param name the name of the table
         *
         */
        this.SetName = function(name){
            this.name = name;
            return this;
        }

        /**
         *
         * Adds this element to the list of desktop objects
         * @param $parent_el the parent of the link that fired the event
         *
         */
        this.AddToDesktop = function($parent_el){
            ElementList[this.id] = this;
            UpdateVisibleElementList();
            var msg = new Utilities.Message("Added the table to desktop objects", $parent_el);
            msg.Show(3000);
            return this;
        }

    };


    /**
     *
     * A dekstop element formatted as an html table. Inherits from
     * DesktopObject.
     *
     */
    function Table(){
        DesktopObject.call(this);
        this.$table = $("<table></table>");
        this.$head = $("<thead></thead>");
        this.$body = $("<tbody></tbody>");
        this.$header = undefined;
        //Save each column as a separate value to make sorting faster
        this.columns = {};
        //IMportant to keep order
        this.column_names = [];
        this.current_column = undefined;

        /**
         *
         * Construct the menu, by which actions can be performed related to one column.
         * E.g. sorting, highlighting.
         *
         **/
        this.BuildColumnActionMenu = function(){
            var self = this;
            this.$column_action_menu = $("<ul class='column_action_menu'></ul>");
            this.$column_action_menu.append(
                $("<li>Order by (ascending)</li>")
                .click(function(){self.OrderBy("asc")}));
            this.$column_action_menu.append($("<li>Order by (descending)</li>")
                .click(function(){self.OrderBy("desc")}));
        }

        /**
         *
         * Sets the header for this table.
         *
         **/
        this.SetHeader = function(column_names){
            var self = this;
            var $tr = $("<tr></tr>");
            $tr.append("<th>No.</th>");
            $.each(column_names,function(idx,column_name){
                var $col_header = $(`<th>${column_name}</th>`);
                $col_header.click(function(){self.ShowHeaderMenu($(this))});
                $tr.append($col_header);
            });
            this.$head.append($tr);
            return this;
        };


        /**
         *
         * Shows a menu of different actions for each column header
         *
         **/
        this.ShowHeaderMenu = function($launcher){
            this.current_column = $launcher.index();
            return this;
        };
        /**
         *
         * Orders the table by a specific column
         *
         * @param string direction asc or desc
         *
         **/
        this.OrderBy = function(direction){
            var self = this;
            var msg = new Utilities.Message("Loading...", this.$menucontainer);
            msg.Show(333);
            var rows = this.$body.find("tr").get();
            rows.sort(function(a,b){
                var keyA = $(a).children('td').eq(self.current_column).text();
                var keyB = $(b).children('td').eq(self.current_column).text();
                if (!isNaN(keyA*1)){
                    keyA = keyA*1;
                    keyB = keyB*1;
                }
                else{
                    console.log("alphabetic!");
                    keyA = $.trim(keyA).toUpperCase();
                    keyB = $.trim(keyB).toUpperCase();
                }
                console.log(keyA + ">>" + keyB);
                if ( direction == "asc" ){
                    if( keyA < keyB ) return -1;
                    if( keyB > keyA ) return 1;
                }
                else{
                    console.log("desc!");
                    if( keyA < keyB ) return 1;
                    if( keyB > keyA ) return -1;
                }
                console.log("rac")
                return 0;
            })
            $.each(rows,function(idx,row){
                //jquery guide p. 292: append doesn't clone but moves!
                self.$table.children('tbody').append(row);
            });
            msg.Destroy();
        };

        /**
         *
         * Sets rows  in this table.
         *
         * it has a visile css class, which can be changed by the user.
         *
         * @param data_table the data to be included. In the format:
         * Array of objects: [{column_name: value},{column_name: value}...];
         *
         *
         **/
        this.SetRows = function(data_table){
            var self = this;
            $.each(data_table,function(row_idx, row){
                var $tr = $("<tr></tr>");
                //NOTICE: the first column is always the row indices. By default,
                $tr.append($(`<td class='row_name'>${row_idx + 1}</td>`));
                $.each(row,function(column, value){
                    //Add to the separate column array, too
                    if(column in  self.columns){
                    }
                    else{
                        self.columns[column] = [];
                    }
                    if(column in self.column_names){
                    }
                    else{
                        self.column_names.push(column);
                    }
                    self.columns[column].push({"value":value,"idx":row_idx});
                    //ACtual html representation
                    $tr.append($(`<td>${value}</td>`));
                });
                self.$body.append($tr);
            });
            return this;
        };


        /**
         *
         * Combines the components of the table
         *
         */
        this.BuildOutput = function(){
            this.BuildColumnActionMenu();
            this.$container
                .append(this.$menu)
                .append(this.$column_action_menu)
                .append(this.$table
                    .append(this.$head)
                    .append(this.$body)
                );
            //Experimental:
            GarbageList[this.id] = this;
            return this;
        };

    
    
    }

    Table.prototype = Object.create(DesktopObject.prototype);



    return{
        Table,
        ElementList,
        GarbageList,
        AddDesktopEvents
    };

}();


/**
 *
 * Loads the data needed to set up the action the user wants to make:
 * languages, subcorpora etc.
 *
 * @param string picked_lang the current language
 * @param Array picked_texts codes of the texts belogning to the current subcorpus
 *
 **/
var Loaders = function(){

        var picked_lang = "none";
        var picked_texts = [];


        /**
         *
         * Sets the value of the current language
         *
         * @param lang the language to be picked
         *
         **/
        function SetPickedLang(lang){
            if(lang !== 'none'){
                picked_lang = lang;
            }
            return this;
        }

        /**
         *
         * Gets the value of the current language
         *
         **/
        function GetPickedLang(){
            return picked_lang;
        }

        /**
         *
         * Sets the value of the currently picked texts
         *
         *
         **/
        function SetPickedTexts(){
            picked_texts = [];
            $("#text_picker_for_sobcorpus [type='checkbox']:checked").each(function(){
                picked_texts.push({
                    code: $(this).val(),
                    title: $(this).parents("span").next("span").text()
                    });
            });
            $(".texts_picked").text(picked_texts.length);
            return this;
        }


        /**
         *
         * Gets the currently picked texts
         *
         */
        function GetPickedTexts(){
            return picked_texts;
        }

        /**
         *
         * Gets the currently picked codes only
         *
         */
        function GetPickedCodes(){
            var codes = [];
            for(i=0;i<picked_texts.length;i++){
                codes.push(picked_texts[i].code);
            }
            return codes;
        }


        /**
         *
         * Lists the languages available in a given corpus
         *
         * @param string corpus_name the name of the corpus in the database
         *
         **/
        function ListLanguagesInThisCorpus(corpus_name){
            $.getJSON("php/ajax/get_corpus_information.php",{action:"languages"},
                function(langlist){
                    var $sel = $("<select><option value='none'>Choose language</option></select>");
                    //When the language is selected, print a list of the texts
                    $.each(langlist,function(idx,el){
                        $sel.append("<option>" + el + "</option>");
                    });
                    $sel.hide().fadeIn().appendTo($(".lang_select").html(""));
                    $(".lang_select select").selectmenu();
                    $(".lang_select select").on("selectmenuchange",function(){
                            SetPickedLang($(this).val());
                            UpdateSubCorpus()});
                });
        }


        /**
         *
         * Lists the texts available in a given corpus
         *
         *
         **/
        function UpdateSubCorpus(){
            $.getJSON("php/ajax/get_corpus_information.php",
                {action: "text_names", lang: picked_lang},
                function(textlist){
                    var $ul = $("<ul>");
                    var $a = $("<a href='javascript:void(0);' >Unselect all</a>");
                    $a.click(function(){
                        Utilities.SelectAll($(this));
                        SetPickedTexts();
                    });
                    $ul.append($("<li class='sel_all_link'></li>").append($a));
                    $.each(textlist,function(idx,el){
                        var $gal = $("<span><input type='checkbox' checked='true' value='" 
                            + el.code + "'></input></span>");
                        var $name = $(`<span> <strong>${el.code}:</strong> <span class='el_title'>${el.title}</span> </span>`);
                        var $li = $("<li>").append($gal).append($name);
                        $ul.append($li);
                    });
                    $ul.appendTo($("#text_picker_for_sobcorpus").html(""));
                    //Updating when picking the texts for the current subcorpus
                    $("#text_picker_for_sobcorpus input[type='checkbox']").click(function(){SetPickedTexts();});
                    SetPickedTexts();
                }); } 

    return {

        ListLanguagesInThisCorpus,
        GetPickedTexts,
        GetPickedCodes,
        GetPickedLang,
    
    };

}();


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
         */
        PrintNgramList: function(){
            $("#corpusaction").hide();
            var self = this;
            $(".my-lightbox").hide();
            params = {
                action:"corpus_ngram_list",
                codes: Loaders.GetPickedCodes(),
                lang: Loaders.GetPickedLang(),
                n:  $("[name='ngram_n_number']").val()*1 || 2,
                lemmas:  ($("[name='ngram_lemma']").get(0).checked ? "yes" : "no")
            };
            var msg = new Utilities.Message("Loading...", $(".container"));
            msg.Show(9999999);
            $.getJSON("php/ajax/get_frequency_list.php", params,
                function(data){
                    msg.Destroy();
                    var freqlist = new Corpusdesktop.Table();
                    freqlist
                        .SetName("Ngrams (the whole subcorpus)")
                        .SetHeader(["Ngram","Freq"])
                        .SetRows(data).BuildOutput();
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

/**
 *
 * Additional functionality for the interface: managing corpora, adding
 * stopwords etc.
 *
 **/

var CorpusManagementActions = function(){

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
    $(".select_other_function button").click(function(){
        if(!$("#other_functions_menu").is(":visible")){
            $(this).text("Hide functionmenu");
        }
        else{
            $(this).text("Other functions");
        }
        $("#other_functions_menu").slideToggle()
    });
    //Defining possible actions on corpora
    $("#corpusaction a, #corpusaction button").click(function(){
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

});
