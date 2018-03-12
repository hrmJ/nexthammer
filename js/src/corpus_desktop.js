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

    //This variable reocords, which element is being dragged
    var CurrentElement = undefined;

    
    /**
     *
     * 
     *
     */
    function AddDesktopEvents(){
    
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


        /**
         *
         * Adds the functionality available for each table, such as 
         * saving for comparison etc.
         *
         **/
        this.AddTableFunctions = function(){
        };

        /**
         *
         * Sets the header for this table.
         *
         **/
        this.SetHeader = function(column_names){
            var self = this;
            var $tr = $("<tr></tr>");
            $tr.append("<td>No.</td>");
            $.each(column_names,function(idx,column_name){
                var $col_header = $(`<td>${column_name}</td>`);
                $col_header.click(function(){self.OrderBy($(this))});
                $tr.append($col_header);
            });
            this.$head.append($tr);
            return this;
        };

        /**
         *
         * Orders the table by a specific column
         *
         * @param $launcher the column headerthat fired the event
         *
         **/
        this.OrderBy = function($launcher){
            var self = this;
            var data_table = [];
            var sortby = $launcher.text().toLowerCase();
            self.columns[sortby].sortOn("value")
            $.each(self.columns[sortby],function(idx,row){
                var thisrow = {};
                $.each(self.column_names,function(colname_idx,colname){
                    thisrow[colname] = self.columns[colname][idx]
                })
                data_table.push(thisrow);
            });
            this.SetRows(data_table).BuildOutput;
            //$launcher.parents(".data-table-container").find("table").remove();
            //$launcher.parents(".data-table-container").append(self.)
            //console.log(data_table);
            //$each(this.$body.find("tr"),function(idx,row){
            //
            //});
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
            this.$container
                .append(this.$menu)
                .append(this.$table
                    .append(this.$head)
                    .append(this.$body)
                );
            return this;
        };

    
    
    }

    Table.prototype = Object.create(DesktopObject.prototype);



    return{
        Table,
        ElementList,
        AddDesktopEvents
    };

}();

