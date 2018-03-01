//FUnctions related to the topics functionality
$(document).ready(function(){

    //Create list of languages
    $.getJSON("get_langs.php",{},function(langlist){
        var $sel = $("<select><option>Choose language</option></select>");
        $sel.on("change",function(){ GetTexts($(this).val());});
        $.each(langlist,function(idx,el){
            $sel.append("<option>" + el + "</option>");
        });
        $sel.appendTo($(".langlist_container"));
    });




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
            $ul.appendTo($(".textlist_container").html(""));
        });
    }

});
