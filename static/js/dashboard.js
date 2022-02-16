$(document).ready(function() {
    // const test_url = "http://energycomps.its.carleton.edu/api/anomalies/vent-and-temp?start_time=1636478378&end_time=1636564778&vent=30&temp=75"
    const BASE_URL = "http://energycomps.its.carleton.edu/api";

    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // const now = new Date()
    var end_time = "1636564778"; // the current time minus 24 hours? 1 week?
    var start_time = "1636478378"; // the current time
    var temp = "75"
    var vent = "30";

    var api_url = BASE_URL + "/anomalies/vent-and-temp";
    api_url = api_url + "?start_time=" + start_time;
    api_url = api_url + "&end_time=" + end_time;
    api_url = api_url + "&vent=" + vent;
    api_url = api_url + "&temp=" + temp;
    $('#dashboard-table tbody tr').remove();
    $("#dashboard-table").find("tr:not(:first)").remove();

    const resultsTable = document.getElementById("dashboard-table");

    $.ajax({
    type: "GET",
    dataType: "json",
    url: api_url,
    cache: false,
    success: function (data) {
        if (jQuery.isEmptyObject(data)) {
            var empty = "<div class=\"empty\">";
            empty += "<p> No anomalies detected! Hurray! </p>"
            empty += "</div>"
            $(".no-anomalies").append(empty);
        } else {
            $.each(data, function(key, val) {
                const row = resultsTable.insertRow();
                const buildingRoomCell = row.insertCell();
                buildingRoomCell.innerHTML = key;

                const dateTimeCell = row.insertCell();

                const firstDateStamp = Math.min.apply(Math, val.values.timestamp);
                const firstIndex = val.values.timestamp.indexOf(firstDateStamp);

                const lastDateStamp = Math.max.apply(Math, val.values.timestamp);
                const lastIndex = val.values.timestamp.indexOf(lastDateStamp);

                const firstDate = new Date(firstDateStamp * 1000);
                const firstDateDisplay = firstDate.getHours() + ':' + firstDate.getMinutes() + ' ' + months[firstDate.getMonth()] + ' ' + firstDate.getDate()
                
                const lastDate = new Date(lastDateStamp * 1000);
                const lastDateDisplay = lastDate.getHours() + ':' + lastDate.getMinutes() + ' ' + months[lastDate.getMonth()] + ' ' + lastDate.getDate()
                
                dateTimeCell.innerHTML = firstDateDisplay + "<hr>" + lastDateDisplay;
                
                const tempCell = row.insertCell();
                tempCell.innerHTML = val.values.temp[firstIndex] + "°<hr>" + val.values.temp[lastIndex] + "°";
                
                const damperCell = row.insertCell();
                damperCell.innerHTML = val.values.vent[firstIndex] + "%<hr>" + val.values.vent[lastIndex] + "%";
            });
        }
    }
    });
});
