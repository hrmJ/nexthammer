//FUnctions related to the topics functionality
$(document).ready(function(){


    //Create list of languages
    $.getJSON("get_langs.php",{},function(langlist){
        var $sel = $("<select><option>Choose language</option></select>");
        //When the language is selected, print a list of the texts
        $sel.on("change",function(){ GetTexts($(this));});
        $.each(langlist,function(idx,el){
            $sel.append("<option>" + el + "</option>");
        });
        $sel.appendTo($(".langlist_container"));
    });

    //Create list of stop words
    function CreateStopWordList(){
        $.getJSON("get_stopwords.php",{"do":"read"},function(wordlist){
            var $ul  = $("<ul>");
            $.each(wordlist,function(idx,el){
                var $el =  $("<span>" + el + "</span>");
                var $a = $("<a href='javascript:void(0)' class='rm-link'>Remove</a>");
                $a.click(function(){RemoveStopWord($(this).parents("li").find("span").text())});
                var $li =  $("<li></li>");
                $li.append($el).append($a);
                $ul.append($li);
            });
            $("#stopwords-list").find("ul").remove()
            $ul.appendTo($("#stopwords-list"));
        });
    }

    CreateStopWordList();

    //Attach events
    $(".topiclauncher").click(function(){ PickTexts($(this)); });
    $("#language_comparison_adder").click(function(){ AddLanguageForComparison(); });
    $("#launch_swlist").click(function(){$(this).parents("div,section").next("section,div").slideToggle()});
    $("#add_stopword").click(function(){ AddStopWord()});

    //Add another language on the same screen
    function AddLanguageForComparison(){
        var $new_comparison = $("#comparisons > div:last-of-type").clone(true);
        $new_comparison.find(".textlist_container").html("");
        $("#comparisons").append($new_comparison);
    }

    //Fetch the list of texts in this lang and print it as
    function GetTexts($launcher){
        var thislang = $launcher.val();
        var $this_container = $launcher.parents(".item_for_comparison");
        $.getJSON("get_texts.php",{"lang":thislang},function(textlist){
            $ul = $("<ul>");
            var $select_all = $("<a href='javascript:void(0)'>Select all</a>");
            $select_all.click(function(){
                $(".textlist_container [type='checkbox']").click();
            })
            $ul.append($select_all);
            $.each(textlist,function(idx,el){
                var $gal = $("<span><input type='checkbox' value='" + el.code + "'></input></span>");
                var $name = $("<span>" + el.title + "</span>");
                var $li = $("<li>").append($gal).append($name);
                $ul.append($li);
            });
            $ul.appendTo($this_container.find(".textlist_container").html("")).hide().slideDown();
        });
    }

    //Picks the texts for the analysis
    function PickTexts($launcher){
        var $parent_div = $launcher.parents(".item_for_comparison");
        var codes = [];
        $parent_div.find(".textlist_container input:checked").each(function(idx, el){
            codes.push(el.getAttribute("value"));
        });
        var params = {"lang":$parent_div.find(".langlist_container select").val(),"codes":codes};
        var $table = $("<table></table>");
        var $head = $("<thead></thead>");
        $head.append($("<tr><td>No.</td><td>Lemma</td><td>Freq</td><td>NB</td><td>VSM</td></tr>"));
        $table.append($head);
        var $body = $("<tbody></tbody>");
        $.getJSON("get_frequency_list.php",params,function(data){
            $.each(data,function(idx, el){
                $body.append($(`<tr>
                    <td>${idx + 1}</td>
                    <td>${el.lemma}</td>
                    <td>${el.freq}</td>
                    <td>${el.nb}</td>
                    <td>${el.vsm}</td>
                    </tr>`));
            });
            $body.appendTo($table);
            $table.appendTo($parent_div.find(".textlist_container").html("")).hide().fadeIn();
        });
    }

    function TestCgi(){
        var codes = [];
        $(".textlist_container input:checked").each(function(idx, el){
            codes.push(el.getAttribute("value"));
            //console.log(el.getAttribute("value"));
        });
        var params = {"lang":$(".langlist_container select").val(),"codes":codes};
        var $table = $("<table></table>");
        $.getJSON("../../cgi-bin/get_frequency_list.py",params,function(data){
            console.log(data);
        });
    }


    //Add a new stopword
    function AddStopWord(){
        $.get("get_stopwords.php",{"do":"add","newlemma":$("[name='sw_adder']").val()},function(){
            CreateStopWordList();
        });
    }
    //Remove a stopword
    function RemoveStopWord(word){
        $.get("get_stopwords.php",{"do":"remove","newlemma":word},function(){
            CreateStopWordList();
        });
    }


});
