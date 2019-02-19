function displaySearchResults(values) {
    console.log("Received values:", values);
    let tbody = $("#result-table > table > tbody");
    tbody.empty();
    for (let i = 0; i < values.length; i++) {
        tbody.append($("<tr><th>" + values[i].point_name + "</th><td>" +
            values[i].timestamp + "</td><td>" + values[i].value + "</td></tr>"));
    }
}