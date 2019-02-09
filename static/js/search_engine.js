$(function () {
    console.log("foobar");
    $("span.bubble-left > select").on("change", function (event) {
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
