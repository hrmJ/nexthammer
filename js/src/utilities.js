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
Array.prototype.sortOn = function(key){
    this.sort(function(a, b){
        if(a[key] < b[key]){
            return -1;
        }else if(a[key] > b[key]){
            return 1;
        }
        return 0;
    });
}
