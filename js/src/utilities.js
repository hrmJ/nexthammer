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
