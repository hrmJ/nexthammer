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


    return {
        SelectAll,
        Message
    };

}();


/**
 *
 * Controls the area and the elements where a user can add, view
 * and edit data retrieved from the corpus. This can be frequency tables,
 * concordances etc.
 *
 */
var Corpusdesktop = function(){

    function Table(){

        var $table = $("<table></table>");
        var $head = $("<thead></thead>");
        var $container = $("<div class='data-table-container'></div>");
        var $body = $("<tbody></tbody>");
        var $header = undefined;

        /**
         *
         * Sets the header for this table.
         *
         **/
        this.SetHeader = function(column_names){
            self = this;
            var $tr = $("<tr></tr>");
            $.each(column_names,function(idx,column_name){
                $tr.append($(`<td>${column_name}</td>`));
            });
            return this;
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
                $tr.append($(`<td class='row_name'>{idx}</td>`));
                $.each(row,function(column, value){
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
            this.$table.append(this.$head).append(this.$body);
            return this;
        };

    
    
    }

    function TopicFrequencyTable(){

        Table.call(this);
    
    }


    TopicFrequencyTable.prototype = Object.create(Table.prototype);


    return{
        Table,
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
                        var $name = $("<span>" + el.title + "</span>");
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
                    var $table = $("<table></table>");
                    var $head = $("<thead></thead>");
                    $head.append($("<tr><td>No.</td><td>Lemma</td><td>Freq</td><td>TF_IDF</td></tr>"));
                    $table.append($head);
                    var $body = $("<tbody></tbody>");
                    $.each(data,function(idx, el){
                        $body.append($(`<tr>
                            <td>${idx + 1}</td>
                            <td>${el.lemma}</td>
                            <td>${el.freq}</td>
                            <td>${el.tf_idf}</td>
                            </tr>`));
                    });
                    $body.appendTo($table);
                    $table.appendTo($details_li.hide());
                    $details_li.slideDown()
                }
            );
        }
    
    };


    return {
    
        ExamineTopics,
    
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
    $(".current_subcorpus a").click(function(){$(".textpicker").fadeToggle()});
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
});
