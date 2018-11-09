import Utilities from '../utilities';

/**
 *
 * Controls the area and the elements where a user can add, view
 * and edit data retrieved from the corpus. This can be frequency tables,
 * concordances etc.
 *
 */
const Corpusdesktop = function(){


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
        var self = this,
            $a = $("<a href='javascript:void(0)'>Add to desktop</a>");

        this.$container = $("<div class='data-table-container'></div>");
        //Functionality related to data tables and other types of desktop objects:
        this.id = Utilities.uuidv4();
        this.$menu = $(`<div class='data-table-menu'>
            <input type='hidden' class='desktop_object_id' value='${this.id}'></input>`);
        
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
         * Adds a specific css class for the table
         *
         * @param newclass the name of the css class 
         *
         **/
        this.SetClass = function(newclass){
            this.$table.addClass(newclass);
            return this;
        };

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
            var $container = $launcher.parents(".data-table-container:eq(0)"),
                $column_action_menu = $container.find(".column_action_menu");

            this.current_column = $launcher.index();

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

export default Corpusdesktop;

