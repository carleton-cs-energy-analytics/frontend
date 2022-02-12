$(document).ready(function() {

    // const test_url = "http://energycomps.its.carleton.edu/api/anomalies/vent-and-temp?start_time=1636478378&end_time=1636564778&vent=30&temp=75"
    const BASE_URL = "http://energycomps.its.carleton.edu/api";

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

    $.ajax({
    type: "GET",
    dataType: "json",
    url: api_url,
    cache: false,
    success: function (data) {
        if (jQuery.isEmptyObject(data)) {
            var empty = "<div class=\"empty\">";
            empty += "<p> No anomolies detected! Hurray! </p>"
            empty += "</div>"
            $(".points").append(empty);
        } else {
            $.each(data, function(key, value) {
                var row = "<div class=\"points-row\">";
                row += "Temp/Vent Mismatch in " + key + "<br>";
                row += "<div class=\"show-more\">";
                row += "Points of Concern: " + value.temp_name + ", " + value.damper_name + "<br>";
                var min_reading = Math.min.apply(Math, value.values.timestamp)
                var first_reading = new Date(min_reading * 1000)
                row += "Time of First Anamolous Readings: " + first_reading + "<br>";
                var max_reading = Math.max.apply(Math, value.values.timestamp)
                var last_reading = new Date(max_reading * 1000)
                row += "Time of Most Recent Anamolous Reading: " + last_reading;
                row += "</div>";
                row += "</div>";
                $(".points").append(row)
            });
        }
    }
    });
});

$(document).on('click', '.points-row', function (){
    $(this).children().toggle();
});