
var api_base_url = 'http://127.0.0.1:5000/api';

$(document).ready(function () {
    //add new series
    $('#addSeriesBtn').click(function () {
        generateNextSeries().hide().appendTo('#series-block').slideDown('slow');
    })
});

$(document).on('click', '.delete', function () {
    $(this).closest('.series').slideUp('slow', function() {
        $(this).closest('.series').remove();
    })
})

function generateNextSeries() {
    var newIndex = $('.series').length;
    console.log(newIndex);

    var building = $('<select />', {type: 'text',
        id:'building'+newIndex,
        class:'building form-control',
        value:''});

    $(building).append('<option value="@2">Evans</option>')

    var buildingGrp = $('<div />', {class:'form-group col-md-2',
        html: building});

    var device = $('<select />', {type: 'text',
        id:'device'+newIndex,
        class:'device form-control',
        value:''});

    $(device).append('<option value="all">All Devices</option>')

    var deviceGrp = $('<div />', {class:'form-group col-md-2',
        html: device});

    var floor = $('<select />', {type: 'text',
        id:'floor'+newIndex,
        class:'floor form-control',
        value:''});

    $(floor).append('<option value="all">All Floors</option>')

    var floorGrp = $('<div />', {class:'form-group col-md-2',
        html: floor});

    var room = $('<select />', {type: 'text',
        id:'room'+newIndex,
        class:'room form-control',
        value:''});

    $(room).append('<option value="all">All Rooms</option>')

    var roomGrp = $('<div />', {class:'form-group col-md-2',
        html: room});

    var series = $('<div />', {class:'form-row series input-group col-md-9',
        id:'series'+newIndex,
        html: $(buildingGrp).add(deviceGrp).add(floorGrp).add(roomGrp)
    }).append('<div>', {class:'col-md-2'})
             .append($('<button>', {type:'button',
                                    class:'btn btn-danger delete',
                                    text:'remove'}));

    return series;
}

/*
 * Updates dropdowns based on previous dropdown values
*/
function update_dropdown() {


}

/*
 * Constructs api query url from UI dropdown select boxes
*/
function construct_url() {
    var query = "/points?search=";
    var building = $(".building").val();
    var device = $(".device").val();
    var floor = $(".floor").val();
    var room = $(".room").val();

    query += building;
    if (device != 'all') {
        query += 'and% = ' + device;
    } else if (floor != 'all') {
        query += 'and:floor = ' + floor;
    } else if (room != 'all') {
        query += 'and$ = ' + room;
    }
    return query;
}

/*
 * Formats return data for d3 visualizations
*/
function format_data() {

}


function test_api() {
    var url = api_base_url + construct_url();
    console.log("Query URL: " + url);
	xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.open('get', url);

    //empty div
    $("#results").empty();

	xmlHttpRequest.onreadystatechange = function() {
		if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
			var responseText = JSON.parse(xmlHttpRequest.responseText);
            console.log(responseText);
            for (var i = 0; i < responseText.length; i++){
                $("#results").append("<br><br>array index: " + i);
                var obj = responseText[i];
                for (var key in obj){
                    var value = obj[key];
                    $("#results").append("<br> - " + key + ": " + value);
                }
            }
        } else {
            console.log("Error retrieving data. Ready State: " + xmlHttpRequest.readyState + " Status: " + xmlHttpRequest.status);
        }
    }
    xmlHttpRequest.send(null);
}
