function build_query_string(form_element, selector_list = ["building", "floor", "room", "device",
    "point", "tag", "type", "unit", "measurement"]) {
    let disjunctive_clauses = [];
    for (let i = 0; i < selector_list.length; i++) {
        let clauses = form_element.find("select.building").val();
        if (!(clauses.length === 0 || clauses.includes(""))) {
            disjunctive_clauses.push("(" + clauses.join('or') + ")");
        }
    }
    return disjunctive_clauses.filter(n => n).join("and");
}

function update_static(form_element) {
    let columns = ["tag", "type", "unit"];
    for (let i = 0; i < columns.length; i++) {
        console.log("Updating " + columns[i]);
        $.getJSON("http://localhost:5000/api/" + columns[i] + "s",
            null,
            function (data, status, jqXHR) {
                let select_el = form_element.find("select." + columns[i]);
                select_el.empty();
                select_el.append($("<option>All " + columns[i].charAt(0).toUpperCase() +
                    columns[i].slice(1) + "s</option>"));
                for (let j = 0; j < data.length; j++) {
                    select_el
                        .append($("<option value='@" + data[j][columns[i] + "_id"] + "'>"
                            + data[j][columns[i] + "_name"] + "</option>"));
                }
            });
    }
    $.getJSON("http://localhost:5000/api/measurements",
        null,
        function (data, status, jqXHR) {
            let select_el = form_element.find("select.measurement");
            select_el.empty();
            select_el.append($("<option>All Measurements</option>"));
            for (let j = 0; j < data.length; j++) {
                select_el
                    .append($("<option value=':measurement = &quot;" + data[j] + "&quot;'>"
                        + data[j] + "   </option>"));

            }
        });
}

function update_building(form_element) {
    $.getJSON("http://localhost:5000/api/buildings",
        null,
        function (data, status, jqXHR) {
            console.log(data);
            let building_select = form_element.find("select.building");
            building_select.empty();
            building_select.append($("<option>All Buildings</option>"));
            for (let i = 0; i < data.length; i++) {
                building_select
                    .append($("<option value='@" + data[i]["building_id"] + "'>"
                        + data[i]["building_name"] + "</option>"));
            }
            update_floor(form_element);
        }
    );
}

function update_floor(form_element) {
    let query = build_query_string(form_element, ["building"]);

    $.getJSON("http://localhost:5000/api/all_floors",
        null,
        function (data, status, jqXHR) {
            let floor_select = form_element.find("select.floor");
            floor_select.empty();
            floor_select.append($("<option>All Floors</option>"));
            for (let i = 0; i < data.length; i++) {
                floor_select
                    .append($("<option value=':floor = " + data[i] + "'>"
                        + data[i] + "</option>"));
            }
            update_room(form_element);
        });
}

function update_room(form_element) {
    let query = build_query_string(form_element, ["building", "floor"]);

    $.getJSON("http://localhost:5000/api/rooms",
        {search: query},
        function (data, status, jqXHR) {
            let room_select = form_element.find("select.room");
            console.log(room_select);
            room_select.empty();
            room_select.append($("<option>All Rooms</option>"));
            for (let i = 0; i < data.length; i++) {
                room_select
                    .append($("<option value='$" + data[i]["room_id"] + "'>"
                        + data[i]["room_name"] + "</option>"));
            }
            update_device(form_element);
        });
}

function update_device(form_element) {
    let query = build_query_string(form_element, ["building", "floor", "room"]);

    $.getJSON("http://localhost:5000/api/devices",
        {search: query},
        function (data, status, jqXHR) {
            let device_select = form_element.find("select.device");
            device_select.empty();
            device_select.append($("<option>All Devices</option>"));
            for (let i = 0; i < data.length; i++) {
                device_select
                    .append($("<option value='%" + data[i]["device_id"] + "'>"
                        + data[i]["device_name"] + "</option>"));
            }
            update_point(form_element);
        });
}

function update_point(form_element) {
    let query = build_query_string(form_element, ["building", "floor", "room", "device"]);

    $.getJSON("http://localhost:5000/api/points",
        {search: query},
        function (data, status, jqXHR) {
            let point_select = form_element.find("select.point");
            point_select.empty();
            point_select.append($("<option>All Points</option>"));
            for (let i = 0; i < data.length; i++) {
                point_select
                    .append($("<option value='*" + data[i]["point_id"] + "'>"
                        + data[i]["point_name"] + "</option>"));
            }
        });

}

$(function () {
    update_building($("#series-0"));
    update_static($("#series-0"));
    $("select.building").on("change", function (event) {
        let series = $(event.target).parent();
        update_floor(series);
    });
    $("select.floor").on("change", function (event) {

        let series = $(event.target).parent();
        update_room(series);
    });
    $("select.room").on("change", function (event) {
        let series = $(event.target).parent();
        update_device(series);
    });
    $("select.device").on("change", function (event) {
        let series = $(event.target).parent();
        update_point(series);
    });

    $("#submit-search-query").on("click", function (event) {
        let point_series = [];
        let forms = $("form.series");
        let formCount = forms.length;
        forms.forEach(function () {
            $.ajax({
                url: 'http://localhost:5000/api/points/ids',
                dataType: 'json',
                data: {search: build_query_string(event.target)},
                type: 'GET',
                success: function (data, status, jqXHR) {
                    $.ajax({
                        url: 'http://localhost:5000/api/values',
                        dataType: 'json',
                        data: {
                            point_ids: data,
                            start_time: 0,
                            end_time: 1649922140,
                            // search:
                        },
                        success: function (data, status, jqXHR) {
                            point_series.push(data);
                        },
                        error: function (jqXHR, status, error) {
                            point_series.push(null)
                        },
                        complete: function (jqXHR, status) {
                            if (point_series.length === formCount) {
                                buildTrendViz(point_series)
                            }
                        }
                    })
                }


            });
        })
    })
});