var api_base_url = 'http://127.0.0.1:5000/api';

$(document).on('click', '.point', function () {
    console.log($(this))
    var point_id = $(this).attr('id').split('_')[1];
    console.log(point_id);
    get_values(point_id)
})


function get_values(point_id) {
    console.log('get_values()');
    console.log(point_id);
    var data = {
        point_ids: [point_id],
        start_time: 1548300800,
        end_time: 1548568989
  };

   $.ajax(
   {
       url: 'http://energycomps.its.carleton.edu:8080/api/values',
      dataType : 'json',
      data     :  data,
      type     :  'GET',
      success  : function(json)
      {
         console.log('Value Data: ')
         console.log(json);
         buildTrendViz(json);
      }
   });

}

function get_points() {
    console.log('get_points()')
    var url = $('#query').val();
    console.log("Query URL: " + url);
    var data = {
    search: url
  };

   $.ajax(
   {
       url: 'http://energycomps.its.carleton.edu:8080/api/points',
      dataType : 'json',
      data     :  data,
      type     :  'GET',
      success  : function(json)
      {
         console.log('Points Data: ')
         console.log(json);
         print_points(json);
      }
   });
}

function print_points(json) {
    for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        console.log(obj['point_id']);
        var link = "<br><a class='point' id='point_" + obj['point_id'] + "'>" + obj['point_name'] + "</a>";
        $('#results').append(link);
    }

}
