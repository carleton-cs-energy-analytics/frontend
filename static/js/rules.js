$(function () {
    $.getJSON(BACKEND_URL + "rules",
        null,
        function (data, status, jqXHR) {
            for (let i = 0; i < data.length; i++) {
                $("#rule-table tbody").append($("<tr data-id='" + data[i]["rule_id"] +
                    "'><td><p class='name'>" + data[i]["rule_name"] + "</p></td><td><button type=\"button\" class=\"btn btn-success rename\">Rename</button>\n" +
                    "<button type=\"button\" class=\"btn btn-danger delete\">Delete</button>\n" +
                    "<a type=\"button\" class=\"btn btn-primary\" href=\""+ data[i]["url"] +"\">View</a></td></tr>"));
            }
            $("#rule-table button.rename").on("click", function (event) {
                let table_row = $(event.target).parents("tr");
                let rule_id = table_row.data("id");
                if (table_row.find("input").length > 0) {
                    console.log("Found an input");
                    console.log("input value", table_row.find("input").val());
                    $.ajax({
                        url: BACKEND_URL + "rule/" + rule_id + "/rename",
                        data: {name: table_row.find("input").val()},
                        method: 'POST',
                        success: function (data, status, jqXHR) {
                            table_row.find("p.name").html(data);
                        }
                    })
                } else {
                    let rule_name = table_row.find("p.name").text();
                    table_row.find("p.name").html($("<input type='text' value='" + rule_name + "'/>"));
                }
            });
            $("#rule-table button.delete").on("click", function (event) {
                let table_row = $(event.target).parents("tr");
                let rule_id = table_row.data("id");
                $.ajax({
                    url: BACKEND_URL + "rule/" + rule_id + "/delete",
                    method: 'POST',
                    success: function (data, status, jqXHR) {
                        table_row.remove();
                    }
                });
            });
        });
});