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
            this.$box.draggable();
            
            //BlurContent(self.box);
        },

        /**
         *  Adds new text to the box
         *
         */
        Add: function(newtext){
            if(!this.$box.find("ul").length){
                var oldtext = this.$box.text();
                $(`<ul><li>${oldtext}</li></ul>`).appendTo(this.$box.html(""));
            }
            this.$box.find("ul").append(`<li>${newtext}</li>`)
        },

        /**
         *  Clears the text in the message box
         *
         */
        Clear: function(){
            this.$box.html("");
            return this;
        },

        /**
         *
         *  Changes the text of the last item of the message
         *
         */
        Update: function(){
            if(this.$box.find("ul").length){
                this.$box.find("li:last-of-type").text(text);
            }
            else{
                this.$box.text(text);
            }
            return this;
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

    /**
     *
     * A simple proggress bar
     *
     **/
    var ProgressBar = function($parent_el){

        this.$parent_el = $parent_el || $("body");
        this.destination_val = null;
        this.progressed = 0;

        /**
         *
         * Sets the bar up
         *
         * @param destination_val the value that will be 100 %
         *
         **/
        this.Initialize = function(destination_val){
            this.$cont = $("<div class='progressbar'></div>");
            this.$bar = $("<div class='bar'></div>");
            this.$bar.appendTo(this.$cont);
            this.$cont.appendTo(this.$parent_el);
            this.destination_val = destination_val;
        }

        /**
         *
         * Moves the bar forward
         *
         * @param how_much how much we move the bar
         *
         **/
        this.Progress = function(how_much){
            how_much = how_much || 1;
            this.progressed += how_much;
            var percent = this.progressed / this.destination_val * 100;
            //var percent = this.$bar.get(0).style.width.replace("%","")*1;
            this.$bar.css({"width" : percent + "%"});
        }

        /**
         *
         * Makes a new assessment of the length of the task
         *
         **/
        this.AddToDestination = function(addedval){
            this.destination_val += addedval;
            return this;
        }

        /**
         *
         * Removes the progress bar
         *
         **/
        this.Destroy = function(){
            this.$cont.fadeOut().remove();
        }
    }

    return {
        uuidv4,
        SelectAll,
        Message,
        ProgressBar,
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
                event.preventDefault();  
                event.stopPropagation();
                var $cont = $(this).parent();
                //if(!$cont.find(`div > input[value='${CurrentElement.id}']`).length){
                    //if this object has not been added yet on the desktop
                    var $dropped_object = CurrentElement.$container.clone(true);
                    $dropped_object.append($(`<input type='hidden' value='${CurrentElement.id}'></input>`))
                    $dropped_object.find(".data-table-menu a").remove();
                    if($cont.find(".data-table-container").length){
                        $cont.find(".data-table-container:last-of-type").after($dropped_object);
                    }
                    else{
                        $cont.prepend($dropped_object);
                    }
                //}
            });

        // Make the text examining windows draggable
        $(".text_examiner").draggable();
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
         * Binds a specific action to the rows of the table.
         *
         * @param callback a function that is called when a row of the table is clicked
         * @param col_idx index of the column tha triggers the event
         *
         **/
        this.AddRowAction = function(callback, col_idx){
            this.$table.find("tr td:nth-child(" + col_idx + ")").click(function(){
                //Note: always send the launcher  as the first param
                callback($(this));
            });
        };

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
                .click(function(){self.OrderBy("asc",$(this))}));
            this.$column_action_menu.append($("<li>Order by (descending)</li>")
                .click(function(){self.OrderBy("desc",$(this))}));
            this.$column_action_menu.find("li").click(function(){
                $(this).parents(".data-table-container").find(".column_action_menu").hide();
                $(".arrow_box").removeClass("arrow_box");
                });
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
            var $container = $launcher.parents(".data-table-container:eq(0)");
            $column_action_menu = $container.find(".column_action_menu");
            if($launcher.hasClass("arrow_box")){
                $column_action_menu.hide();
                $(".arrow_box").removeClass("arrow_box");
                return this;
            }
            $column_action_menu
                .css({
                    "left": ($launcher.offset().left - $container.offset().left) + "px",
                    "top": "-" + ($launcher.height() + 9) + "px"})
                .show();
            $(".arrow_box").removeClass("arrow_box");
            $launcher.addClass("arrow_box");
            return this;
        };
        /**
         *
         * Orders the table by a specific column
         *
         * @param string direction asc or desc
         * @param $launcher the element that fired the event
         *
         **/
        this.OrderBy = function(direction, $launcher){
            var self = this;
            var $table = $launcher.parents(".data-table-container").find("table");
            var rows = $table.find("tbody tr").get();
            rows.sort(function(a,b){
                var keyA = $(a).children('td').eq(self.current_column).text();
                var keyB = $(b).children('td').eq(self.current_column).text();
                if (!isNaN(keyA*1)){
                    keyA = keyA*1;
                    keyB = keyB*1;
                }
                else{
                    keyA = $.trim(keyA).toUpperCase();
                    keyB = $.trim(keyB).toUpperCase();
                }
                if ( direction == "asc" ){
                    if( keyA < keyB ){
                         return -1;
                    }
                    if( keyB < keyA ){
                         return 1;
                    }
                }
                else{
                    if( keyA < keyB ){
                         return 1;
                    }
                    if( keyB < keyA ) {
                        return -1;
                    }
                }
                return 0;
            })
            //console.log(rows);
            $.each(rows,function(idx,row){
                //jquery guide p. 292: append doesn't clone but moves!
                //console.log(row.)
                $table.children('tbody').append(row);
            });
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
                .append(this.$menu.prepend(this.$column_action_menu))
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
        var picked_corpus = "";
        var languages_in_corpus = [];


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
         * Gets the languages in the current corpus
         *
         **/
        function GetLanguagesInCorpus(){
            return languages_in_corpus;
        }

        /**
         *
         * Gets the value of the current corpus
         *
         **/
        function GetPickedCorpus(){
            return picked_corpus;
        }

        /**
         *
         * Fetches the name of the current corpus
         *
         * @param callback do something with the corpus name after loading is ready
         *
         **/
        function SetCurrentCorpus(callback){
            $.get("php/ajax/get_corpus_information.php",
                {action:"corpus_name"}, function(corpus_name){
                    $(".corpus_select").text(corpus_name)
                    picked_corpus = corpus_name;
                    callback(corpus_name);
                });
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
         * Gets the currently picked codes for each of the languages in the corpus
         * This is still a hack, a more robust solution is needed.
         * The function assumes an identical naming shceme for each text:
         * the text has to end in _[lang], [lang] being a two-character language code
         *
         *
         */
        function GetPickedCodesInAllLanguages(){
            var codes = GetPickedCodes();
            var all_codes = {};
            $.each(languages_in_corpus,function(idx,lang){
                all_codes[lang] = [];
            });
            $.each(codes,function(idx,code){
                $.each(languages_in_corpus,function(idx,lang){
                    var pat = new RegExp("(_?)" + picked_lang + "$","g");
                    all_codes[lang].push(code.replace(pat,"$1" + lang));
                });
            });
            return all_codes;
        }

        /**
         *
         * Lists the languages available in a given corpus
         *
         * @param string corpus_name the name of the corpus in the database
         *
         **/
        function ListLanguagesInThisCorpus(corpus_name){
            $.getJSON("php/ajax/get_corpus_information.php",
                {
                    action:"languages", 
                    corpus_name:picked_corpus, 
                },
                function(langlist){
                    languages_in_corpus = langlist;
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
                {
                    action: "text_names", 
                    lang: picked_lang,
                    corpus_name:picked_corpus, 
                },
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
        SetCurrentCorpus,
        GetPickedCorpus,
        GetPickedTexts,
        GetPickedCodes,
        GetPickedLang,
        GetLanguagesInCorpus,
        GetPickedCodesInAllLanguages,
    
    };

}();


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
         *
         **/
        ExamineThisText: function($parent_li, params, custom_callback){
            var self = this;
            var callback = custom_callback || this.BuildTfIdfTable.bind(this);
            picked_code = $parent_li.find("input[name='code']").val();
            params = params || {
                action:"examine_text",
                picked_code: picked_code,
                codes: Loaders.GetPickedCodes(),
                lang: Loaders.GetPickedLang()
            };
            this.msg = new Utilities.Message("Loading...", $parent_li);
            this.msg.Show(9999999);
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
                    $.each(data[langs[0]],function(idx, topic_word_data){
                        tabdata.push({});
                        $.each(langs,function(lang_idx,lang){
                            tabdata[tabdata.length-1][lang] = $("<ul class='ldrtab'></ul>");
                        });
                    });
                    $.each(langs,function(lang_idx,lang){
                        $.each(data[lang], function(idx, topic_word_data){
                            for(ngramidx in topic_word_data){
                                tabdata[idx][lang].append(`<li><strong>${ngramidx}</strong></li>`);
                                $.each(topic_word_data[ngramidx],function(ngidx,this_ngram){
                                    tabdata[idx][lang].append(`<li>${this_ngram}</li>`);
                                })
                            }
                            tabdata[idx][lang] = tabdata[idx][lang].get(0).outerHTML;
                        });
                    });
                    freqlist.SetName(this.$parent_li.text())
                            .SetHeader(langs)
                            .SetRows(tabdata)
                            .BuildOutput();
                    freqlist.$container.appendTo($details_li.hide());
                    //freqlist.AddRowAction(this.ExamineThisRow.bind(this), 2);
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
            LRDtab.SetNgramRange();
            LRDtab.SetNumberOfTopicWords();
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
                    }
                ));
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
