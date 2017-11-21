function makeGrid() {
    //restarts history of previous actions for undo/redo purposes
    manager.history=[];
    manager.future=[];

    //erases current table, creates new and appends it to the table element
    let table=$("#pixel_canvas");
    table.html("")  
    let row;
    let cell;

    for (rows=0;rows<$("#input_height").val();rows++){
        row = document.createElement("tr");
        for (colums=0;colums<$("#input_width").val();colums++){
            cell = document.createElement("td");
            $(cell).attr("bgcolor","#FFFFFF");
            row.appendChild(cell);
        }
        table.append(row);
    }
};

var clickCell = function (cell){
        // identifies cell and its old and new color
        let cellColumn = $(cell).parent().children().index($(cell));
        let cellRow = $(cell).parent().parent().children().index($(cell).parent());
        let cellOldColor = $(cell).attr("bgcolor");
        let cellNewColor = $("#colorPicker").val();

        // if the color for the cell is new then save the new data into the manager.history array and
        // change the color of the cell
        if (cellNewColor !== cellOldColor){
            manager.history.push({
                column:cellColumn,
                row:cellRow,
                oldColor:cellOldColor,
                newColor:cellNewColor
            });

            manager.future=[];

            if(cell!=="undefined"){
                cell.attr("bgcolor",cellNewColor);
            }
        }

        // if the array of past changes is too long then remove the first item from the array
        // I have no clue how big the maximum of items in array should be here, feel free to play with it :)
        if (manager.history.length>1000){
            manager.history.splice(0,1);
        }

}

let fillFromHistory = function(cell,oldNew){
    //receives a cell and an information if old or new value of color should be used
    //(old when going back and new when goind forward with the mouse wheel)
    //sets color for the cell
    //uses only the last object in the manager.history array (make sure it contains the data you want to use)
    
    let color;
    if (oldNew ==="old"){
        color = manager.history[manager.history.length-1].oldColor;
    } else {
        color = manager.history[manager.history.length-1].newColor;
    };
    $(cell).attr("bgcolor",color);
}

let copyColor = function(cell){
    //copies color from the cell to colorPicker
    let color = cell.attr("bgcolor");
    if (color!==""){
        $("#colorPicker").val(color);
    } else ( $("#colorPicker").val("#0000"))
}

let mouseOnCell = function(){
    //this is called when a mouse is moving on a cell
    //if the left button is clicked at the same time then proceed like the cell was clicked
    let cell = $(this);
    if (manager.leftClicked){
        clickCell($(cell));
    };
}

let useWheel = function (upOrDown){
    //if mouse wheel direction was "down" then undo last move (if possible)
    //if mouse wheel direction was "up" then redo last move (if possible)

    if (upOrDown === "up"){
        if (manager.future.length>0){
                manager.history.push(manager.future[manager.future.length-1]);
                manager.future.pop();
                let cell = manager.findCell(manager.history, manager.history.length-1);
                fillFromHistory(cell,"new");
        }
    } else {
        if (manager.history.length>0){
            let cell = manager.findCell(manager.history, manager.history.length-1);
            fillFromHistory(cell,"old");
            manager.future.push(manager.history[manager.history.length-1]);
            manager.history.pop();
        }
    }
}

const manager = {
    //contains various useful data and a method to find and return a cell for further processing
    leftClicked:false,
    history:[],
    future:[],
    findCell:function(array,index){
        let info = array[index];
        let table = $("#pixel_canvas");
        let row =  table.children("tr")[info.row];
        let cell = $(row).children("td")[info.column];
        return cell;
    }
}

$(document).ready(function(){
    
    var pixels = $("#pixel_canvas");

    // Disabling right click and mousewheel actions
    pixels.attr("oncontextmenu","return false;");
    $(pixels).bind("mousewheel", function() {
        return false;
    });

    // If left button is clicked or released then I tell the manager object so that I keep track of if the mouse button is held down
    $("body").on("mousedown",function(){
        if(event.which===1)
        {manager.leftClicked=true;
        }
    });

    $("body").on("mouseup",function(){
        if(event.which===1)
        {manager.leftClicked=false;}
    });
    
    // In just one left click I fill the cell with color right away
    $(pixels).on("mousedown","td",function(){
        if(event.which===1){
            clickCell($(this))
        }
    });

    // Right click will run copying color function
    $(pixels).on("contextmenu","td",function(){
        copyColor($(this))
    })

    // If mouse moves on a cell I want to run a function that will fill the cell with color if left mouse button is held
    $(pixels).on("mousemove","td",mouseOnCell);

    // This handles using the wheel
    $(pixels).bind("mousewheel",function(e){
        if(e.originalEvent.wheelDelta/120>0){
            useWheel("up");
        } else { useWheel("down")}
    })

});