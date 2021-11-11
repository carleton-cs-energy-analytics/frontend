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

    firstParam.innerHTML = firstDropdownVal;
    secondParam.innerHTML = secondDropwdownVal;

    var firstParamSetter = document.getElementById("first-new-dropdown");
    firstParamSetter.style.display = "block";

    var secondParmSetter = document.getElementById("second-new-dropdown");
    secondParmSetter.style.display = "inline-block";

    var firstForm = document.createElement("form");
    firstForm.setAttribute("type", "number");
    firstForm.setAttribute("min", "1");
    firstForm.setAttribute("max", "100");
    document.body.appendChild(firstForm)
}

function changeLeftSelection(text) {
    var dropdown = document.getElementsByName("first-new-button");

    var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';
} 

function changeRightSelection(text) {
    var dropdown = document.getElementsByName("second-new-button");

    var y = dropdown[0].innerHTML = text + ' <span class="caret"></span>';
}

function generateTable() {
    var table = document.getElementById("results-table");

    table.style.display = "block";
}
