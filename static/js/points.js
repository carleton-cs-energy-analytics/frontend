var api_base_url = 'http://127.0.0.1:5000/api';

$(document).on('click', '.point', function () {
    console.log($(this))
    var point_id = $(this).attr('id').split('_')[1];
    console.log(point_id);
    visualize_point(point_id)
})

function visualize_point(point_id) {
    //get attribute data
    var point_data  = get_point_data(point_id);
    console.log("Point Data: " + point_data);
    $('#point-data').append(point_data['point_name']);
    //get value data

    //visualize data


}

function get_point_data(point_id) {
    var url = api_base_url + "/points?search=*" + point_id;
    console.log("Point Query URL: " + url);
	xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.open('get', url);

	xmlHttpRequest.onreadystatechange = function() {
		if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
			var responseText = JSON.parse(xmlHttpRequest.responseText);
            console.log(responseText);
            return responseText;
        } else {
            console.log("Error retrieving data. Ready State: " + xmlHttpRequest.readyState + " Status: " + xmlHttpRequest.status);
        }
    }
    xmlHttpRequest.send(null);
}



function get_points() {
    var url = api_base_url + $('#query').val();
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
                var obj = responseText[i];
                console.log(obj['point_id']);
                var link = "<br><a class='point' id='point_" +obj['point_id']+"'>"+obj['point_name']+"</a>";
                /*var pointGrp = $('<div />', {class:'pointGrp',
                    html: link}).append($('<button>', {type:'button',
                                           class:'btn btn-primary view-point',
                                           text:'View Point'}));;*/
                $('#results').append(link);
            }
        } else {
            console.log("Error retrieving data. Ready State: " + xmlHttpRequest.readyState + " Status: " + xmlHttpRequest.status);
        }
    }
    xmlHttpRequest.send(null);
}
