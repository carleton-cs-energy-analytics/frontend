var BACKEND_URL = "http://energycomps.its.carleton.edu/api/";
var buildings = new Map([
    ["Boliou", 1],
    ["Evans", 2],
    ["UnID'd Building", 3],
    ["Hulings", 4],
    ["Townhouses", 5],
    ["Weitz", 6],
    ["Cassat", 7],
]);

var currentBuilding;

function changeSelection(text) {
    var y = document.getElementsByClassName("btn btn-primary dropdown-toggle");
    var z = y[0].innerHTML = text + ' <span class="caret"></span>';

    if (text == "Room Temperature/Vent") {
       var firstDropdownVal = "Room Temperature";
       var secondDropwdownVal = "Vent Angle %";
    }
    else if (text == "Room Temperature/Set Temperature") {
        var firstDropdownVal = "Room Temperature";
        var secondDropwdownVal = "Set Temperature";
    }
    else if (text == "Current Vent Percentage/Set Vent Percentage"){
       var firstDropdownVal = "Current Vent %";
       var secondDropwdownVal = "Set Vent %"
    }
    else {
        return
    }
    firstParam = document.getElementById("first-param");
    secondParam = document.getElementById("second-param");
    thirdParam = document.getElementById("building-param");

    firstParam.innerHTML = firstDropdownVal;
    secondParam.innerHTML = secondDropwdownVal;
    thirdParam.innerHTML = "Building";

    var firstParamSetter = document.getElementById("first-new-dropdown");
    firstParamSetter.style.display = "block";

    var secondParmSetter = document.getElementById("second-new-dropdown");
    secondParmSetter.style.display = "inline-block";

    var buildingParam = document.getElementById("third-new-dropdown");
    buildingParam.style.display = "inline-block";

    var firstForm = document.createElement("form");
    firstForm.setAttribute("type", "number");
    firstForm.setAttribute("min", "1");
    firstForm.setAttribute("max", "100");
    //document.body.appendChild(firstForm);
}

function changeLeftSelection(text) {
    var dropdown = document.getElementsByName("first-new-button");

    var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';
} 

function changeRightSelection(text) {
    var dropdown = document.getElementsByName("second-new-button");

    var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';
}

function changeBuildingSelection(text) {
    var dropdown = document.getElementsByName("building-button");

    var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';

    $("#building-dropdown li").click(function() {
        currentBuilding = $(this).text();
        //alert($(this).text()); // gets text contents of clicked li
    });
}

function generateTable() {
    //const url = "http://energycomps.its.carleton.edu/api/rooms?search=@2";
    const searchURL = "http://energycomps.its.carleton.edu/api/rooms?search=@";
    const url2 = "http://energycomps.its.carleton.edu/api/points";

    const selectedBuilding = buildings.get(currentBuilding);
    // alert(selectedBuilding)
    const resultsTable = document.getElementById("results-table");

    $.getJSON(searchURL + selectedBuilding, function(data) {
        $.each(data, function(key, val) {
            const row = resultsTable.insertRow();
            const buildingCell = row.insertCell()
            const building = val.building_name;
            buildingCell.innerHTML = building;
            const roomNumCell = row.insertCell();
            const roomNum = val.room_name;
            roomNumCell.innerHTML = roomNum;
            const roomTempCell = row.insertCell();
            const roomTemp = 50;
            roomTempCell.innerHTML = roomTemp;
            const ventPercentCell = row.insertCell();
            const ventPercent = 70;
            ventPercentCell.innerHTML = ventPercent;

        });
    })
    
    document.getElementById("results-table").style.display="block";
}

function resetTable() {
    resultsTable = {};   
}
