function displaySearchResults(values) {
    d3.selectAll('#visualization svg').remove();
    $("#anomalous-points").empty();
    let pointDict = findAnomalyLines(values);
    console.log("this is point dict before it is passed: ");
    console.log(pointDict);
    buildAnomalyViz([values], pointDict);
    fillAnomalousPoints(pointDict);

}

function fillAnomalousPoints(pointDict) {
    $("#anomalous-points").append("<b> Flagged Points </b> <hr>");
    for (let key in pointDict) {
        if (pointDict[key] === true) {
            $("#anomalous-points").append("<p>" + key + "</p>");
        }
    }
}

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

function postAnomalyRule() {
    console.log('postAnomalyRule()');
    let series = $("#series-0");
    let name = prompt('Enter a name for your rule', 'New Rule (created ' + moment().format('M/D/YYYY h:m:s A') + ')');
    if (name === null) {
        return;
    }
    let urlHash = build_url_param_string(series, $('#daterange').data('daterangepicker'), false);
    let url = window.location.pathname + '#' + urlHash;

    //let value_search = $($("form.series")).find("input.value-query").val();
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

function newRuleErrored(data, status, jqXHR) {
    alert('There was an error creating your new rule. Status: ' + status);
}

function newRuleAdded(data, status, jqXHR) {
    alert('your rule has been added to the database');
}

$(function () {
    $("#create-rule").on("click", postAnomalyRule);
});
