function concatenate_clauses(clauses) {
    if (clauses.length === 0 || clauses.includes("")) {
        return null;
    }
    return "(" + clauses.join(' or ') + ")";
}

function update_building(form_element) {
    $.getJSON("http://localhost:5000/api/buildings",
        null,
        function (data, status, jqXHR) {
            console.log(data)
            let building_select = form_element.find("select.building");
            building_select.empty();
            building_select.append($("<option value=''>All Buildings</option>"));
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
    let query = concatenate_clauses(form_element.find("select.building").val());
    $.getJSON("http://localhost:5000/api/all_floors",
        null,
        function (data, status, jqXHR) {
            let floor_select = form_element.find("select.floor");
            floor_select.empty();
            floor_select.append($("<option value=''>All Floors</option>"));
            for (let i = 0; i < data.length; i++) {
                floor_select
                    .append($("<option value=':floor = " + data[i] + "'>"
                        + data[i] + "</option>"));
            }
            update_room(form_element);
        });
}

function update_room(form_element) {

    let query = [
        concatenate_clauses(form_element.find("select.building").val()),
        concatenate_clauses(form_element.find("select.floor").val()),
    ].filter(n => n).join("and");

    $.getJSON("http://localhost:5000/api/rooms",
        {search: query},
        function (data, status, jqXHR) {
            let room_select = form_element.find("select.room");
            room_select.empty();
            room_select.append($("<option value=''>All Rooms</option>"));
            for (let i = 0; i < data.length; i++) {
                room_select
                    .append($("<option value='$" + data[i]["room_id"] + "'>"
                        + data[i]["room_name"] + "</option>"));
            }
            update_device(form_element);
        });
}

function update_device(form_element) {

    let query = [
        concatenate_clauses(form_element.find("select.building").val()),
        concatenate_clauses(form_element.find("select.floor").val()),
        concatenate_clauses(form_element.find("select.room").val())
    ].filter(n => n).join("and");

    $.getJSON("http://localhost:5000/api/devices",
        {search: query},
        function (data, status, jqXHR) {
            let device_select = form_element.find("select.device");
            device_select.empty();
            device_select.append($("<option value='' selected>All Devices</option>"));
            for (let i = 0; i < data.length; i++) {
                device_select
                    .append($("<option value='%" + data[i]["device_id"] + "'>"
                        + data[i]["device_name"] + "</option>"));
            }
            update_point(form_element);
        });
}

function update_point(form_element) {
    let query = [
        concatenate_clauses(form_element.find("select.building").val()),
        concatenate_clauses(form_element.find("select.floor").val()),
        concatenate_clauses(form_element.find("select.room").val()),
        concatenate_clauses(form_element.find("select.device").val())
    ].filter(n => n).join("and");

    $.getJSON("http://localhost:5000/api/points",
        {search: query},
        function (data, status, jqXHR) {
            let point_select = form_element.find("select.point");
            point_select.empty();
            point_select.append($("<option value=''>All Points</option>"));
            for (let i = 0; i < data.length; i++) {
                point_select
                    .append($("<option value='*" + data[i]["point_id"] + "'>"
                        + data[i]["point_name"] + "</option>"));
            }
        });

}

$(function () {
    update_building($("#series-0"));
    $("select.building").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_floor(series);
    });
    $("select.floor").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_room(series);
    });
    $("select.room").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_device(series);
    });
    $("select.device").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_point(series);
    });


    $("select#series-0 > select").on("change", function (event) {
        let bubble_right = $(event.target).parent().parent().children(".bubble-right");
        bubble_right.empty();
        let clause_category = event.target.value;
        let select;
        switch (clause_category) {
            case "and":
            case "or":
            case "not":
            case "(":
            case ")":
                break;
            case "building":
            case "device":
            case "point":
            case "tag":
            case "unit":
            case "type":
                select = $("<select data-clause-category='" +
                    clause_category + "'></select>")[0];
                bubble_right.append(select);
                $.getJSON("http://localhost:5000/api/" + clause_category + "s",
                    null,
                    function (data, status, jqXHR) {
                        console.log(data);
                        for (let i = 0; i < data.length; i++) {
                            $(select).append($("<option value='" + data[i][clause_category + "_id"]
                                + "'>" + data[i][clause_category + "_name"] + "</option>"));
                        }
                    }
                );
                break;
            case "room":
                select = $("<select data-clause-category='" +
                    clause_category + "'></select>")[0];
                bubble_right.append(select);
                $.getJSON("http://localhost:5000/api/buildings",
                    null,
                    function (data, status, jqXHR) {
                        console.log(data);
                        for (let i = 0; i < data.length; i++) {
                            let building = data[i];
                            let optgroup = $("<optgroup label=\"" + data[i]["building_name"]
                                + "\"></optgroup>")[0];
                            $.getJSON("http://localhost:5000/api/" + clause_category + "s",
                                {search: "@" + building["building_id"]},
                                function (data, status, jqXHR) {
                                    console.log(data);
                                    for (let i = 0; i < data.length; i++) {
                                        $(optgroup).append($("<option value='" + data[i][clause_category + "_id"]
                                            + "'>" + data[i][clause_category + "_name"] + "</option>"));
                                    }
                                }
                            );
                            $(select).append(optgroup);
                        }
                    }
                );
                break;
            case "floor":
                bubble_right.html("<input type='number'/>");
                break;
            case "measurement":
                bubble_right.html("<input type='text'/>");
                break;
        }
    });
});