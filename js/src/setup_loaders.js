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

