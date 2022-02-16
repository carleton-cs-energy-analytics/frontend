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
       var secondDropwdownVal = "Damper %";
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

    var datetimeParam = document.getElementById("datetimepicker");
    datetimeParam.style.display = "block";    
    datetimeParam.style.float = "left";
    
    var firstForm = document.createElement("form");
    firstForm.setAttribute("type", "number");
    firstForm.setAttribute("min", "1");
    firstForm.setAttribute("max", "100");
    //document.body.appendChild(firstForm);
    
    
}

// TODO: create reset button?

// TODO: implement calendar functionality to set start/end times

function generateTable() {
    var temp = (document.getElementById("first-num-input").value).toString();
    var vent = (document.getElementById("second-num-input").value).toString();
    var start_time = "1636478378";
    var end_time = "1636564778";
    console.log("start time: " + start_time);

    // default hardcoded start time
    // params['date_range'] = {};
    // console.log('date', (new Date(date_range_picker_element.startDate._d)).getTime());
    // params.date_range['startDate'] = (new Date(date_range_picker_element.startDate._d)).getTime();
    // params.date_range['endDate'] = (new Date(date_range_picker_element.endDate._d).getTime());    
    /* else {
        var end_time = Date.now();
        var start_time = end_time - 604800000;
    } */   

    // start and end dates for value range
    var drp = $('#daterange').data('daterangepicker');
    var startDate = drp.startDate._d.valueOf() / 1000;
    var endDate = drp.endDate._d.valueOf() / 1000; 
    
    console.log("startDate type: " + typeof(startDate));
    start_time = startDate.toString();
    end_time = endDate.toString();
    
    console.log("start time: " + startDate);
    console.log("start type: " + typeof(start_time));
    
    
    var api_url = "http://energycomps.its.carleton.edu/api/anomalies/vent-and-temp";
    api_url = api_url + "?start_time=" + start_time;
    api_url = api_url + "&end_time=" + end_time;
    api_url = api_url + "&vent=" + vent;
    api_url = api_url + "&temp=" + temp;
    $('#results-table tbody tr').remove();
    $("#results-table").find("tr:not(:first)").remove();
    
    console.log("backend query: " + api_url);
    const currentBuilding = document.getElementById("building-selector").value;
    const selectedBuilding = buildings.get(currentBuilding);
    const resultsTable = document.getElementById("results-table");

    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
   

    // retrieve data for all buildings
    if (selectedBuilding == 8) {
        $.getJSON(api_url, function(data) {
            $.each(data, function(key, val) {
                const row = resultsTable.insertRow();
                const buildingRoomCell = row.insertCell();
                buildingRoomCell.innerHTML = key;
                const tempCell = row.insertCell();
                tempCell.innerHTML = Math.max.apply(Math, val.values.temp);
                const damperCell = row.insertCell();
                damperCell.innerHTML = Math.max.apply(Math, val.values.vent);
                const dateTimeCell = row.insertCell();
                const dateStamp = Math.min.apply(Math, val.values.timestamp)
                const d = new Date(dateStamp * 1000);
                /* code to convert date to AMPM found here: https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format */
                var hours = d.getHours() % 12;
                  hours = hours ? hours : 12;
                var date = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(d.getMonth() + 1)] + " " + 
                    ("00" + d.getDate()).slice(-2) + " " + 
                    d.getFullYear() + " " + 
                    ("00" + hours).slice(-2) + ":" + 
                    ("00" + d.getMinutes()).slice(-2) + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM'); 
                dateTimeCell.innerHTML = date;
                
            });
        })
    }

    // retrieve data for single building specified by user
    else {
        $.getJSON(api_url, function(data) {
            $.each(data, function(key, val) {
                if (key.includes(currentBuilding)) {
                    const row = resultsTable.insertRow();
                    const buildingRoomCell = row.insertCell();
                    buildingRoomCell.innerHTML = key;
                    const tempCell = row.insertCell();
                    tempCell.innerHTML = Math.max.apply(Math, val.values.temp);
                    const damperCell = row.insertCell();
                    damperCell.innerHTML = Math.max.apply(Math, val.values.vent);
                    const dateTimeCell = row.insertCell();
                    const dateStamp = Math.min.apply(Math, val.values.timestamp)
                    const d = new Date(dateStamp * 1000);
                    var hours = d.getHours() % 12;
                      hours = hours ? hours : 12;
                    var date = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(d.getMonth() + 1)] + " " + 
                        ("00" + d.getDate()).slice(-2) + " " + 
                        d.getFullYear() + " " + 
                        ("00" + hours).slice(-2) + ":" + 
                        ("00" + d.getMinutes()).slice(-2) + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM'); 
                    dateTimeCell.innerHTML = date;
                    }
            });
        })
    }

    document.getElementById("results-table").style.display="block";
}