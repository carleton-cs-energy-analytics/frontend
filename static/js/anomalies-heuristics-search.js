var BACKEND_URL = "http://energycomps.its.carleton.edu/api/";
var buildings = new Map([
    ["Boliou", 1],
    ["Evans", 2],
    ["UnID'd Building", 3],
    ["Hulings", 4],
    ["Townhouses", 5],
    ["Weitz", 6],
    ["Cassat", 7],
    ["All Buildings", 8],
]);

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

// function changeLeftSelection(text) {
//     var dropdown = document.getElementsByName("first-new-button");

//     var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';
// } 

// function changeRightSelection(text) {
//     var dropdown = document.getElementsByName("second-new-button");

//     var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';
//     console.log(dropdown[0].innerHTML);
// }

// function changeBuildingSelection(text) {
//     var dropdown = document.getElementsByName("building-button");

//     var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';

//     $("#building-dropdown li").click(function() {
//         currentBuilding = $(this).text();
//         //alert($(this).text()); // gets text contents of clicked li
//     });
// }

function dateTimePick() {
    $("#datepicker").datetimepicker();
    $("#datepicker1").datetimepicker();
}

function generateTable() {
    const tempThreshold = document.getElementById("first-num-input").value;
    //const ventThreshold = document.getElementById("second-num-input").value;
    const tempOperator = document.getElementById("first-threshold").value;
    $('#results-table tbody tr').remove();
    $("#results-table").find("tr:not(:first)").remove();

    //const url = "http://energycomps.its.carleton.edu/api/rooms?search=@2";
    //const searchURL = "http://energycomps.its.carleton.edu/api/points?search=@";
    const searchURL = "http://energycomps.its.carleton.edu/api/points";
    const tempURL = "http://energycomps.its.carleton.edu/api/values?point_ids="

    const currentBuilding = document.getElementById("building-selector").value;
    const selectedBuilding = buildings.get(currentBuilding);
    alert(currentBuilding + selectedBuilding);
    const resultsTable = document.getElementById("results-table");

    // retrieve data for all buildings
    if (selectedBuilding == 8) {
        $.getJSON(searchURL, function(data) {
            $.each(data, function(key, val) {
                const currentPointID = val.point_id;
                if (val.value_type.value_type_id == 3) {
                    const roomName = val.room_name;
                    const building = val.building_name;
                    $.getJSON(tempURL + currentPointID + "&start_time=1550460000&end_time=1550469000", function(data) {
                        $.each(data, function(key, val) {
                            if (eval(val.value + tempOperator + tempThreshold)) {
                                const row = resultsTable.insertRow();
                                const buildingCell = row.insertCell()
                                buildingCell.innerHTML = building;
                                const roomNumCell = row.insertCell();
                                roomNumCell.innerHTML = roomName;
                                const roomTempCell = row.insertCell();
                                roomTempCell.innerHTML = val.value;
                                const ventPercentCell = row.insertCell();
                                ventPercentCell.innerHTML = val.value;
                            }
                        });
                    })
                }
            });
        })
    }

    // retrieve data for single building specified by user
    else {
        $.getJSON(searchURL + "?search=@" + selectedBuilding, function(data) {
            $.each(data, function(key, val) {
                const currentPointID = val.point_id;
                if (val.value_type.value_type_id == 3) {
                    //console.log(roomName);
                    const roomName = val.room_name;
                    const building = val.building_name;
                    $.getJSON(tempURL + currentPointID + "&start_time=1550460000&end_time=1550469000", function(data) {
                        $.each(data, function(key, val) {
                            if (eval(val.value + tempOperator + tempThreshold)) {
                                const row = resultsTable.insertRow();
                                const buildingCell = row.insertCell()
                                buildingCell.innerHTML = currentBuilding;
                                const roomNumCell = row.insertCell();
                                roomNumCell.innerHTML = roomName;
                                const roomTempCell = row.insertCell();
                                roomTempCell.innerHTML = val.value;
                                const ventPercentCell = row.insertCell();
                                ventPercentCell.innerHTML = val.value;
                            }
                        });
                    })
                }
            });
        })
    }
    document.getElementById("results-table").style.display="block";
}
