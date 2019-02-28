function displaySearchResults(values) {
    let viz_choice = $('input[name=visualization]:checked').val();

    if (viz_choice === 'graph') {
        d3.selectAll('#visualization svg').remove();
        $("#anomalous-points").empty();
        let pointDict = findAnomalyLines(values);
        console.log("this is point dict before it is passed: ");
        console.log(pointDict);
        buildAnomalyViz([values], pointDict);
        fillAnomalousPoints(pointDict);
    } else {
        buildTable(values)
    }
}

function buildTable(values) {
    let tbody = $("#result-table > table > tbody");
    tbody.empty();
    for (let i = 0; i < values.length; i++) {
        tbody.append($("<tr><th>" + values[i].point_name + "</th><td>" +
            values[i].timestamp + "</td><td>" + values[i].value + "</td></tr>"));
    }
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
    console.log('positng anomoly rule')
    let series = $("#series-0");
    let name = prompt('Enter a name for your rule', 'New Rule (created ' + moment().format('M/D/YYYY h:m:s A') + ')');
    let urlHash = build_url_param_string(series, $('#daterange').data('daterangepicker'), false);
    let url = window.location.pathname + '#' + urlHash;

    let value_search = $($("form.series")).find("input.value-query").val();
    let point_search = build_query_string(series);
    if (!value_search) {
        alert('Anomaly rule must include a value search');
        return;
    }
    let data = {name, url, value_search, point_search};
    $.ajax({
        url: BACKEND_URL + 'rule/add',
        data: data,
        type: 'POST',
        success: newRuleAdded,
        error: newRuleErrored
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
