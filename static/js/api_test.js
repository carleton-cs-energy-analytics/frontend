
var api_base_url = 'http://127.0.0.1:5000/api';

function test_api() {
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
