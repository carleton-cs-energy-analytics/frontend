function build_query_string(form_element, selector_list = ["building", "floor", "room", "device",
    "point", "tag", "type", "unit", "measurement"]) {
    console.log("form element" + form_element);
    console.log(form_element);
    let disjunctive_clauses = [];
    for (let i = 0; i < selector_list.length; i++) {
        let clauses = form_element.find("select." + selector_list[i]).val();
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
        $.getJSON(BACKEND_URL + columns[i] + "s",
            null,
            function (data, status, jqXHR) {
                let select_el = form_element.find("select." + columns[i]);
                select_el.empty();
                if (columns[i] === "type") {
                    select_el.append($("<option value=':type 2 or :type 3' selected>Numeric</option>"));
                } else {
                    select_el.append($("<option value=''>All " + columns[i].charAt(0).toUpperCase() +
                        columns[i].slice(1) + "s</option>"));
                }
                for (let j = 0; j < data.length; j++) {
                    if (columns[i] === "tag") {
                        select_el
                            .append($("<option value='#" + data[j][columns[i] + "_id"] + "'>"
                                + data[j][columns[i] + "_name"] + "</option>"));
                    } else {
                        select_el
                            .append($("<option value=':" + columns[i] + " " + data[j][columns[i] + "_id"] + "'>"
                                + data[j][columns[i] + "_name"] + "</option>"));
                    }
                }
            });
    }
    $.getJSON(BACKEND_URL + "measurements",
        null,
        function (data, status, jqXHR) {
            let select_el = form_element.find("select.measurement");
            select_el.empty();
            select_el.append($("<option value=''>All Measurements</option>"));
            for (let j = 0; j < data.length; j++) {
                select_el
                    .append($("<option value=':measurement &#39;" + data[j] + "&#39;'>"
                        + data[j] + "   </option>"));

            }
        });
}

function update_building(form_element) {
    $.getJSON(BACKEND_URL + "buildings",
        null,
        function (data, status, jqXHR) {
            console.log(data);
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
    let query = build_query_string(form_element, ["building"]);

    $.getJSON(BACKEND_URL + "all_floors",
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
    let query = build_query_string(form_element, ["building", "floor"]);

    $.getJSON(BACKEND_URL + "rooms",
        {search: query},
        function (data, status, jqXHR) {
            let room_select = form_element.find("select.room");
            console.log(room_select);
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
    let query = build_query_string(form_element, ["building", "floor", "room"]);

    $.getJSON(BACKEND_URL + "devices",
        {search: query},
        function (data, status, jqXHR) {
            let device_select = form_element.find("select.device");
            device_select.empty();
            device_select.append($("<option value=''>All Devices</option>"));
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

    $.getJSON(BACKEND_URL + "points",
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

function update_point_verification_text(form_element) {
    console.log("update_point_verification_text()");
    $.ajax({
        url: BACKEND_URL + 'points/verify',
        dataType: 'json',
        data: {search: build_query_string($(form_element))},
        type: 'GET',
        success: function (data, status, jqXHR) {
            if (Array.isArray(data)) {
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    sum += data[i]["count"];
                }
                $(form_element).find('p.point-verification-text').html(sum + " points found");

            } else {
                $(form_element).find('p.point-verification-text').html(data);
            }
        }
    });
}

//let update_value_verification_text_timed_out = false;
function update_value_verification_text() {
    console.log("update_value_verification_text()");
    /*if (update_value_verification_text_timed_out) {
        return;
    }
    update_value_verification_text_timed_out = true;
    setTimeout(function () {
        update_value_verification_text_timed_out = false;
    }, 500);*/

    let forms = $("form.series");
    let drp = $('#daterange').data('daterangepicker');
    let startDate = drp.startDate._d.valueOf() / 1000;
    let endDate = drp.endDate._d.valueOf() / 1000;

    forms.each(function (index, form) {
        console.log("Ajax fired for value verification");
        $.ajax({
            url: BACKEND_URL + 'points/ids',
            dataType: 'json',
            data: {search: build_query_string($(form))},
            type: 'POST',
            success: function (data, status, jqXHR) {
                console.log("this is points data: ");
                console.log(data);
                console.log("values query");
                console.log($(form).find("input.value-query").val());
                $.ajax({
                    url: BACKEND_URL + 'values/verify',
                    data: {
                        point_ids: data,
                        start_time: startDate,
                        end_time: endDate,
                        search: $(form).find("input.value-query").val()
                    },
                    success: function (data, status, jqXHR) {
                        console.log("data for value verification: " + data);
                        $(form).find('p.value-verification-text').html(data);
                    }
                })
            }
        });
    })
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
    $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('week'),
        endDate: moment().startOf('day').subtract(1, 'day'),
        locale: {
            format: 'M/DD hh:mm A'
        }
    });

    $("select").on("change", function (event) {
        let series = $(event.target).parent();
        console.log("select box has been changed");
        update_point_verification_text(series);
        //update_value_verification_text(series);
    });

    $("#submit-search-query").on("click", function (event) {
        console.log("button clicked");
        let point_series = [];
        let forms = $("form.series");
        let formCount = forms.length;
        let drp = $('#daterange').data('daterangepicker');
        let startDate = drp.startDate._d.valueOf() / 1000;
        let endDate = drp.endDate._d.valueOf() / 1000;

        forms.each(function (index, form) {
            console.log("Ajax fired for: " + $(event.target));
            let value_type = $(form).find("select.type").val();
            console.log(value_type);
            $.ajax({
                url: BACKEND_URL + 'points/ids',
                dataType: 'json',
                data: {search: build_query_string($(form))},
                type: 'GET',
                success: function (data, status, jqXHR) {
                    $.ajax({
                        url: BACKEND_URL + 'values',
                        dataType: 'json',
                        data: {
                            point_ids: data,
                            start_time: startDate,
                            end_time: endDate,
                            search: $(form).find("input.value-query").val()
                        },
                        success: function (data, status, jqXHR) {
                            point_series.push(data);
                        },
                        error: function (jqXHR, status, error) {
                            point_series.push(null)
                        },
                        complete: function (jqXHR, status) {
                            if (point_series.length === formCount) {
                                console.log("Values data: ");
                                console.log(point_series[0]);
                                displaySearchResults(point_series[0], value_type[0])
                            }
                        }
                    })
                }
            });
        })
    })
});