
var api_base_url = 'http://127.0.0.1:5000/api';

$(document).ready(function () {
    //add new series
    $('#addSeriesBtn').click(function () {
        generateNextSeries().hide().appendTo('#series-block').slideDown('slow');
    })
    $('.addLineBtn').click(function () {
        var seriesId = '#' + $(this).attr('id').split('-')[0];
        generateNewLine().hide().appendTo(seriesId).slideDown('slow');
    })
});

$(document).on('click', '.delete', function () {
    $(this).closest('.series').slideUp('slow', function() {
        $(this).closest('.series').remove();
    })
})

$(document).on('change','.argType',function(){
   update_dropdown($(this).attr('id'), $(this).val());
});

function generateNewLine() {
    var seriesIndex = $('.series').length - 1;
    //select logical operator
    var logicalOperator = $('<select />', {type: 'text',
        class:'series-'+seriesIndex + ' form-control',
        value:''});
    $(logicalOperator).append('<option value="and">AND</option>'+
                       '<option value="or">OR</option>' +
                       '<option value="not">NOT</option>');

    var logicOpGrp = $('<div />', {class:'col-md-1',
        html: logicalOperator});
    //select argument type
    var argType = $('<select />', {type: 'text',
        class:'series-'+seriesIndex + ' form-control',
        value:''});
    $(argType).append('<option value="building">Building</option>'+
                       '<option value="device">Device</option>' +
                       '<option value="floor">Floor</option>');

    var argTypeGrp = $('<div />', {class:'col-md-2',
        html: argType});
    //select argument value
    var argValue = $('<select />', {type: 'text',
        class:'series-'+seriesIndex + ' form-control',
        value:''});
    /*$(argValue).append('<option value="building">Building</option>'+
                       '<option value="device">Device</option>' +
                       '<option value="floor">Floor</option>');*/

    var argValueGrp = $('<div />', {class:'col-md-2',
        html: argValue});
    //line grouping
    var newLine = $('<div />', {class:'form-group row',
        html: $(logicOpGrp).add(argTypeGrp).add(argValueGrp)});

    return newLine;

}

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
function update_dropdown(id, value) {
    argValueId = '#' + id.replace('argType', 'argValue');
    console.log("id: " + id + "| value: " + value);

    query = '';
    switch (value) {
        case 'building':
            query = '/buildings';
            break;
        case 'device':
            query = '/devices';
        case 'room':
            query = '/rooms';
    }

    queryString = api_base_url + query;
    response = query_api(queryString);
    console.log("this is the response: " + response);



    var newOptions = {"Evans": "@2",
  "Option 2": "value2",
  "Option 3": "value3"
};

var $el = $(argValueId);
$el.empty(); // remove old options
$.each(newOptions, function(key,value) {
  $el.append($("<option></option>")
     .attr("value", value).text(key));
});

}


/*
 * Builds array of search operators from search UI and pass to construct_url
*/
function build_url_array() {
    var arg_list = []
    //loop through all arguements
    $('.argValue').each(function(){
        alert($(this).val());
        arg_list.push($(this).val());
    });
    console.log(arg_list);
    return arg_list;

}

/*
 * get values for points from points query
*/
function get_values() {

}

/*
 * Formats return data for d3 visualizations
*/
function format_data() {

}

/*
 * Constructs api query url from UI dropdown select boxes
*/
function construct_url() {
    var query = "/points?search=";
    var args_list = build_url_array();
    //console.log("args list: " + args_list);
    for (var index in args_list) {
        query += args_list[index];
    }
    console.log("This is our query: " + query);
    return query;
}


function query_api(url) {
    console.log('query_api()')
    console.log("Query URL: " + url);
	xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.open('get', url);

    //empty div
    $("#results").empty();

	xmlHttpRequest.onreadystatechange = function() {
		if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
			var responseText = JSON.parse(xmlHttpRequest.responseText);
            console.log(responseText)
            return responseText;
        } else {
            console.log("Error retrieving data. Ready State: " + xmlHttpRequest.readyState + " Status: " + xmlHttpRequest.status);
        }
    }
    xmlHttpRequest.send(null);
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
