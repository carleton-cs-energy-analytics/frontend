/**
 * Search UI javascript
 * Authors: Ethan Cassel-Mace, Alex Davis, Chris Tordi
 * March 13, 2019
 * javascript for datepicker is used from daterangepicker
 */

//list of parameters we care about when building a search param for api query
let SELECTOR_LIST = ["building", "floor", "room", "device",
    "point", "tag", "type", "unit", "measurement"];


/**
 * Builds boolean logic search param for search engine from point selector options
 * @param  {html element} form_element  html form element for point selector
 * @param {list} selector_list list of parameters used to build search param
 */
function build_query_string(form_element, selector_list = SELECTOR_LIST) {
    // console.log("build_query_string");
    let disjunctive_clauses = [];
    for (let i = 0; i < selector_list.length; i++) {
        let clauses = form_element.find("select." + selector_list[i]).val();
        if (!(clauses.length == 0 || clauses.includes(""))) {
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
    value_search = $("#value-query").val();
    //value_search = $($("form.series")).find("input.value-query").val();
    if (value_search) {
        params['value_search'] = value_search;
    }
    if (include_date_range) {
        params['date_range'] = {};
        //console.log('date', (new Date(date_range_picker_element.startDate._d)).getTime());
        params.date_range['startDate'] = (new Date(date_range_picker_element.startDate._d)).getTime();
        params.date_range['endDate'] = (new Date(date_range_picker_element.endDate._d).getTime());
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
        date_range_picker_element.setStartDate(new Date(parseInt(selector_state.date_range.startDate)));
    }
    if (selector_state.date_range && selector_state.date_range.endDate) {
        date_range_picker_element.setEndDate(new Date(parseInt(selector_state.date_range.endDate)));
    }
    if (selector_state.value_search) {
        //$($("form.series")).find("input.value-query").val(selector_state.value_search); -> use this for multiple forms
        $("#value-query").val(selector_state.value_search);
    }
}

/**
 * Fills options for tags, types, units, measurements filters
 * The options for these filters come from their respective db tables
 * @param  {html element} form_element  html form element that is being changed
 */
function update_static(form_element, initial_load = false) {
    console.log("update_static()");
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

/**
 * Fills options for building filter. Options are all buildings from the buildings table in db
 * @param  {html element} form_element  html form element that is being changed
 */
function update_building(form_element, initial_load = false) {
    console.log("update_building()");
    $.getJSON(BACKEND_URL + "buildings",
        null,
        function (data, status, jqXHR) {
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

/**
 * Fills options for floor filter. If all buildings are selected -> options are all floors for all buildings
 * If options in building filter are selected -> options are floors in selected buildings
 * @param  {html element} form_element  html form element that is being changed
 */
function update_floor(form_element, initial_load = false) {
    console.log("update_floor()");
    let query = build_query_string(form_element, ["building"]);

    $.getJSON(BACKEND_URL + "floors",
        {search: query},
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

/**
 * Fills options for room filter. If all floors are selected -> options are all rooms
 * If options in upstream  filters are selected -> options are rooms that match upstream filters
 * @param  {html element} form_element  html form element that is being changed
 */
function update_room(form_element, initial_load = false) {
    console.log("update_room()");
    let query = build_query_string(form_element, ["building", "floor"]);

    $.getJSON(BACKEND_URL + "rooms",
        {search: query},
        function (data, status, jqXHR) {
            let room_select = form_element.find("select.room");
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

/**
 * Fills options for device filter. If no upstream filters are selected -> options are all devices
 * If options in upstream  filters are selected -> options are devices that match upstream filters
 * @param  {html element} form_element  html form element that is being changed
 */
function update_device(form_element, initial_load = false) {
    console.log("update_device()");
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

/**
 * Fills options for device filter. If no upstream filters are selected -> options are all devices
 * If options in upstream  filters are selected -> options are devices that match upstream filters
 * @param  {html element} form_element  html form element that is being changed
 */
function update_point(form_element, initial_load = false) {
    console.log("update_point()");
    //filters that are taken into consideration when updating the points filter options
    let query = build_query_string(form_element, ["building", "floor", "room", "device", "tag", "type"]);

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

/**
 * Updates UI to show number of points matched by current filter selection.
 * @param  {html element} form_element  html form element that is being changed
 */
function update_point_verification_text(form_element) {
    console.log("update_point_verification_text()");
    $.ajax({
        url: BACKEND_URL + 'points/verify',
        dataType: 'json',
        data: {search: build_query_string($(form_element))},
        type: 'GET',
        success: function (data, status, jqXHR) {
            //sum number of points
            if (Array.isArray(data)) {
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    sum += data[i]["count"];
                }
                //$(form_element).find('p.point-verification-text').html(sum + " points found");
                $('#point-verification-text').html(sum + " points found"); //success message
            } else {
                //$(form_element).find('p.point-verification-text').html(data);
                $('#point-verification-text').html(data); //error message
            }
        }
    });
}

/**
 * Triggered on press of submit btn. Queries api to get set of points and set of values. Passes data to visualizations
 * and displays viz
 * @param  {event} event  javascript event for click of submit btn
 */
function submit_search(event, pushState = true) {
    console.log("submit_search()");

    let selector_state = build_url_param_string($("#series-0"), $('#daterange').data('daterangepicker'));
    if (pushState) {
        // console.log('PUSHING STATE:', selector_state);
        $.bbq.pushState(selector_state);
    }

    let point_series = [];
    let forms = $("form.series");
    let formCount = forms.length;
    // start and end dates for value range
    let drp = $('#daterange').data('daterangepicker');
    let startDate = drp.startDate._d.valueOf() / 1000;
    let endDate = drp.endDate._d.valueOf() / 1000;

    // loop through each form. Right now there is only one form.
    forms.each(function (index, form) {
        // what type of data we are returning. Determines what viz we display
        let value_type = $(form).find("select.type").val();
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
                        //search: $(form).find("input.value-query").val() -> use this for multiple forms
                        search: $("#value-query").val()
                    },
                    success: function (data, status, jqXHR) {
                        point_series.push(data);
                    },
                    error: function (jqXHR, status, error) {
                        point_series.push(null)
                    },
                    complete: function (jqXHR, status) {
                        //when ajax call is complete, build viz
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


function conditionally_apply_query_state() {
    console.log("conditionally_apply_query_state()");
    query_state = $.bbq.getState();
    // apply url parameter if there is one
    if (!$.isEmptyObject(query_state)) {
        //console.log('Applying query state to selectors');
        apply_search_param_string(query_state, $("#series-0"), $('#daterange').data('daterangepicker'));
        submit_search(null, false);
    }
}

/**
 * Monitors for changes in UI on load.
 */
$(function () {
    //update building filter
    update_building($("#series-0"), true);
    //update tags, units, type, measurement
    update_static($("#series-0"), true);
    //on change in building filter, update floor filter options
    $("select.building").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_floor(series);
    });
    //on change in floor filter, update room filter options
    $("select.floor").on("change", function (event) {

        let series = $(event.target).parent().parent();
        update_room(series);
    });
    //on change in room filter, update device options
    $("select.room").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_device(series);
    });
    //on change in device filter, update point filter
    $("select.device").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_point(series);
    });
    //on change in tag filter, update point filter
    $("select.tag").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_point(series);
    });
    //on change in type filter, update point filter
    $("select.type").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_point(series);
    });
    // datepicker js
    $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('week'),
        endDate: moment().startOf('day').subtract(1, 'day'),
        locale: {
            format: 'M/DD hh:mm A'
        }
    });
    //update html showing number of points selected when point selector ui changes
    $("select").on("change", function (event) {
        let series = $(event.target).parent().parent();
        update_point_verification_text(series);
    });

    //graph btn is pressed
    $("#submit-search-query").on("click", submit_search);

    //reset form
    $("#reset-form").on("click", function () {
        $('#series-0')[0].reset();
         update_point_verification_text('#series-0');
    });


});