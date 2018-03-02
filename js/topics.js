//FUnctions related to the topics functionality
$(document).ready(function(){


    //Create list of languages
    $.getJSON("get_langs.php",{},function(langlist){
        var $sel = $("<select><option>Choose language</option></select>");
        //When the language is selected, print a list of the texts
        $sel.on("change",function(){ GetTexts($(this).val());});
        $.each(langlist,function(idx,el){
            $sel.append("<option>" + el + "</option>");
        });
        $sel.appendTo($(".langlist_container"));
    });

    //Attach events
    $("#topiclauncher").click(function(){ PickTexts(); });
    //$("#topiclauncher").click(function(){ TestCgi(); });

    //Fetch the list of texts in this lang and print it as
    function GetTexts(thislang){
        $.getJSON("get_texts.php",{"lang":thislang},function(textlist){
            $ul = $("<ul>");
            $.each(textlist,function(idx,el){
                var $gal = $("<span><input type='checkbox' value='" + el.code + "'></input></span>");
                var $name = $("<span>" + el.title + "</span>");
                var $li = $("<li>").append($gal).append($name);
                $ul.append($li);
            });
            $ul.appendTo($(".textlist_container").html("")).hide().slideDown();
        });
    }

    //Picks the texts for the analysis
    function PickTexts(){
        var codes = [];
        $(".textlist_container input:checked").each(function(idx, el){
            codes.push(el.getAttribute("value"));
            //console.log(el.getAttribute("value"));
        });
        var params = {"lang":$(".langlist_container select").val(),"codes":codes};
        var $table = $("<table></table>");
        var $head = $("<thead></thead>");
        $head.append($("<tr><td>Lemma</td><td>Freq</td><td>NB</td></tr>"));
        $table.append($head);
        var $body = $("<tbody></tbody>");
        $.getJSON("get_frequency_list.php",params,function(data){
            $.each(data,function(idx, el){
                $body.append($(`<tr><td>${el.lemma}</td><td>${el.freq}</td><td>${el.nb}</td></tr>`));
            });
            $body.appendTo($table);
            $table.appendTo($(".textlist_container").html("")).hide().fadeIn();
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

});
