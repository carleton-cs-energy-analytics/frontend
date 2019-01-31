
var api_base_url = 'http://127.0.0.1:5000/api';

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
