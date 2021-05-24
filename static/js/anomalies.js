/**
 * Javascript for anomalies
 * Author: Ethan Cassel-Mace, Chris Tordi
 * March 13, 2019
 */

window.onload = initialize;

function initialize() {
    $("#dataTable").load("evans_anom_counts.html"); 
}

/**
 * Passes data from point selector to anomalies line graph and anomalous points table
 * @param {object} values js object with point names and values associated with selected time range
 */
function displaySearchResults(values) {
    console.log("displaySearchResults()");
    //remove previous viz
    d3.selectAll('#visualization svg').remove();
    $("#anomalous-points").empty();
    let pointDict = findAnomalyLines(values);
    buildAnomalyViz([values], pointDict);
    fillAnomalousPoints(pointDict);

}

/**
 * Populates flagged points UI table with name of points that contain anomalous values
 * @param {dictionary} pointDict point name is key. Value is bool indicated whether line contains anomalous value
 *
 */
function fillAnomalousPoints(pointDict) {
    $("#anomalous-points").append("<b> Flagged Points </b> <hr>");
    for (let key in pointDict) {
        if (pointDict[key] === true) {
            $("#anomalous-points").append("<p>" + key + "</p>");
        }
    }
}

/**
 * Checks each point to see if it has a value that returns true for the value param query
 * @param {object} values js object with point names and values associated with selected time range
 *
 * @return {dictionary} pointDict point name is key. Value is bool indicated whether line contains anomalous value
 */
function findAnomalyLines(values) {
    console.log("findAnomalyLines()");
    let pointDict = {}
    for (let i = 0; i < values.length; i++) {
        let point_name = values[i]["point_name"];
        let point_match = values[i]["matches"];
        if (point_name in pointDict) {
            if (point_match === true) {
                pointDict[point_name] = point_match
            }
        } else {
            pointDict[point_name] = point_match
        }
    }

    return pointDict;
}

/**
 * Posts rule to rules table in db
 */
function postAnomalyRule() {
    console.log('postAnomalyRule()');
    let series = $("#series-0");
    let name = prompt('Enter a name for your rule', 'New Rule (created ' + moment().format('M/D/YYYY h:m:s A') + ')');
    if (name === null) {
        return;
    }
    let urlHash = build_url_param_string(series, $('#daterange').data('daterangepicker'), false);
    let url = window.location.pathname + '#' + urlHash;

    //let value_search = $($("form.series")).find("input.value-query").val(); -> use for multiple forms
    let value_search = $("#value-query").val();
    let point_search = build_query_string(series);
    if (!value_search) {
        alert('Anomaly rule must include a value search');
        return;
    }
    $.ajax({
        url: BACKEND_URL + 'values/verify',
        method: 'POST',
        data: {search: value_search},
        success: function (data) {
            if (data.includes("Invalid")) {
                alert(data);
                return;
            }
            $.ajax({
                url: BACKEND_URL + 'rule/add',
                data: {name, url, value_search, point_search},
                type: 'POST',
                success: newRuleAdded,
                error: newRuleErrored
            })
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Invalid value query???")
        }
    })
}

function loadDataTable(){
    $("#dataTable").load("evans_anom_counts.html");

}

function newRuleErrored(data, status, jqXHR) {
    alert('There was an error creating your new rule. Status: ' + status);
}

function newRuleAdded(data, status, jqXHR) {
    alert('your rule has been added to the database');
}

/**
 * Monitors of create btn being clicked
 */
$(function () {
    $("#create-rule").on("click", postAnomalyRule);
});
