$(function () {
    $.loadJSON("/rules",
        null,
        function (data, status, jqXHR) {
            for (let i = 0; i < data.length; i++) {
                $("#rule-table tbody").append($("<tr data-id='" + data[i]["rule_id"] +
                    "'><td>" + data[i]["rule_name"] + "</td><td><button type=\"button\" class=\"btn btn-success\">Rename</button>\n" +
                    "<button type=\"button\" class=\"btn btn-danger\">Delete</button>\n" +
                    "<a type=\"button\" class=\"btn btn-primary\" href=\"\">Jump!</a></td></tr>"))
            }
        })
}