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

