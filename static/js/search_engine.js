let SELECTOR_LIST = ["building", "floor", "room", "device",
    "point", "tag", "type", "unit", "measurement"];


function build_query_string(form_element, selector_list = SELECTOR_LIST) {
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

function build_url_param_string(select_form_element, date_range_picker_element, include_date_range = true) {
    let params = {
        select: {},
    };
    SELECTOR_LIST.forEach(function (selector) {
        let clauses = select_form_element.find("select." + selector).val();
        params.select[selector] = clauses;
    });
    value_search = $($("form.series")).find("input.value-query").val();
    if (value_search) {
        params['value_search'] = value_search;
    }
    if (include_date_range) {
        params['date_range'] = {};
        params.date_range['startDate'] = date_range_picker_element.startDate._d;
        params.date_range['endDate'] = date_range_picker_element.endDate._d;
    }

    return $.param(params); // serializes the params object
}


function apply_search_param_string(selector_state, select_form_element, date_range_picker_element) {
    SELECTOR_LIST.forEach(function (selector) {
        if (selector in selector_state.select) {
            select_form_element.find("select." + selector).val(selector_state.select[selector]);
        }
    });
    if (selector_state.date_range && selector_state.date_range.startDate) {
        date_range_picker_element.setStartDate(new Date(selector_state.date_range.startDate));
    }
    if (selector_state.date_range && selector_state.date_range.endDate) {
        date_range_picker_element.setEndDate(new Date(selector_state.date_range.endDate));
    }
    if (selector_state.value_search) {
        $($("form.series")).find("input.value-query").val(selector_state.value_search);
    }

}

function update_static(form_element, initial_load = false) {
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
                    select_el.append($("<option selected value=''>All " + columns[i].charAt(0).toUpperCase() +
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
            select_el.append($("<option selected value=''>All Measurements</option>"));
            for (let j = 0; j < data.length; j++) {
                select_el
                    .append($("<option value=':measurement &#39;" + data[j] + "&#39;'>"
                        + data[j] + "   </option>"));

            }
        });
}

function update_building(form_element, initial_load = false) {
    $.getJSON(BACKEND_URL + "buildings",
        null,
        function (data, status, jqXHR) {
            console.log(data);
            let building_select = form_element.find("select.building");
            building_select.empty();
            building_select.append($("<option selected value=''>All Buildings</option>"));
            for (let i = 0; i < data.length; i++) {
                building_select
                    .append($("<option value='@" + data[i]["building_id"] + "'>"
                        + data[i]["building_name"] + "</option>"));
            }
            update_floor(form_element, initial_load);
        }
    );
}

function update_floor(form_element, initial_load = false) {
    let query = build_query_string(form_element, ["building"]);

    $.getJSON(BACKEND_URL + "all_floors",
        null,
        function (data, status, jqXHR) {
            let floor_select = form_element.find("select.floor");
            floor_select.empty();
            floor_select.append($("<option selected value=''>All Floors</option>"));
            for (let i = 0; i < data.length; i++) {
                floor_select
                    .append($("<option value=':floor = " + data[i] + "'>"
                        + data[i] + "</option>"));
            }
            update_room(form_element, initial_load);
        });
}

function update_room(form_element, initial_load = false) {
    let query = build_query_string(form_element, ["building", "floor"]);

    $.getJSON(BACKEND_URL + "rooms",
        {search: query},
        function (data, status, jqXHR) {
            let room_select = form_element.find("select.room");
            console.log(room_select);
            room_select.empty();
            room_select.append($("<option selected value=''>All Rooms</option>"));
            for (let i = 0; i < data.length; i++) {
                room_select
                    .append($("<option value='$" + data[i]["room_id"] + "'>"
                        + data[i]["room_name"] + "</option>"));
            }
            update_device(form_element, initial_load);
        });
}

function update_device(form_element, initial_load = false) {
    let query = build_query_string(form_element, ["building", "floor", "room"]);

    $.getJSON(BACKEND_URL + "devices",
        {search: query},
        function (data, status, jqXHR) {
            let device_select = form_element.find("select.device");
            device_select.empty();
            device_select.append($("<option selected value=''>All Devices</option>"));
            for (let i = 0; i < data.length; i++) {
                device_select
                    .append($("<option value='%" + data[i]["device_id"] + "'>"
                        + data[i]["device_name"] + "</option>"));
            }
            update_point(form_element, initial_load);
        });
}

function update_point(form_element, initial_load = false) {
    let query = build_query_string(form_element, ["building", "floor", "room", "device"]);

    $.getJSON(BACKEND_URL + "points",
        {search: query},
        function (data, status, jqXHR) {
            let point_select = form_element.find("select.point");
            point_select.empty();
            point_select.append($("<option selected value=''>All Points</option>"));
            for (let i = 0; i < data.length; i++) {
                point_select
                    .append($("<option value='*" + data[i]["point_id"] + "'>"
                        + data[i]["point_name"] + "</option>"));
            }
            if (initial_load) {
                conditionally_apply_query_state();
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
                //$(form_element).find('p.point-verification-text').html(sum + " points found");
                $('#point-verification-text').html(sum + " points found");

            } else {
                //$(form_element).find('p.point-verification-text').html(data);
                $('#point-verification-text').html(data);
            }
        }
    });
}

function submit_search(event) {

    let selector_state = build_url_param_string($("#series-0"), $('#daterange').data('daterangepicker'));
    $.bbq.pushState(selector_state);
    console.log("button clicked");

    let point_series = [];
    let forms = $("form.series");
    let formCount = forms.length;
    let drp = $('#daterange').data('daterangepicker');
    let startDate = drp.startDate._d.valueOf() / 1000;
    let endDate = drp.endDate._d.valueOf() / 1000;

    forms.each(function (index, form) {
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
                        search: $("input.value-query").val()
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

function conditionally_apply_query_state() {
    query_state = $.bbq.getState();
    // apply url parameter if there is one
    if (!$.isEmptyObject(query_state)) {
        console.log('Applying query state to selectors');
        apply_search_param_string(query_state, $("#series-0"), $('#daterange').data('daterangepicker'));
        submit_search();
    }
}

$(function () {
    update_building($("#series-0"), true);
    update_static($("#series-0"), true);
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
        startDate: moment().startOf('hour').subtract(1, 'day'),
        endDate: moment().startOf('hour'),
        locale: {
            format: 'M/DD hh:mm A'
        }
    });

    $("select").on("change", function (event) {
        let series = $(event.target).parent();
        console.log("select box has been changed");
        update_point_verification_text(series);
        // update_value_verification_text(series);
    });

    $("#submit-search-query").on("click", submit_search);
});