// Javascript file for Voronoi style line graph
// Modified from example online by...
// Author: Ethan Cassel-Mace & Eva Grench
// Date: 2/11/2019

// This is all in one function so that javascript doesn't start mixing variables between this code and the heatmap...
// This is what the dashboard calls to make the visualization.
function buildTrendViz(data) {
    var w = 960,			// Width of our visualization (hacky)
        h = 500;            // Height of our visualization (hacky)

    // The svg element that everything is connected to
    var svg = d3.select('#visualization')
        .append('svg')
        .attr('width', w)
        .attr('height', h);

    let minYValue = d3.min(data, function (d) {
        return parseFloat(d.value);
    }) - 1;

    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Use the built in scaleTime() to make the times looking nice on the x-axis
    var xScale = d3.scaleTime()
        .domain([getTime(d3.min(data, function (d) {
            return d.timestamp; // Start at the earliest timestamp
        })),
            getTime(d3.max(data, function (d) {
                return d.timestamp; // End at the latest timestamp
            }))])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .range([height, 0]);

    var voronoi = d3.voronoi()
        .x(function (d) {
            return xScale(getTime(d.timestamp));
        })
        .y(function (d) {
            return yScale(d.value);
        })
        .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

    var line = d3.line()
        .x(function (d) {
            return xScale(getTime(d.timestamp));
        })
        .y(function (d) {
            return yScale(d.value);
        });

    function updateScales(data) {
        xScale.domain([getTime(d3.min(data, function (d) {
            return d.timestamp;
        }) - 1),
            getTime(d3.max(data, function (d) {
                return d.timestamp;
            }) + 1)]);


        yScale.domain([d3.min(data, function (d) {
            return parseFloat(d.value);
        }) - 1,
            d3.max(data, function (d) {
                return parseFloat(d.value);
            }) + 1]);
    }

    data = data[0]; //@TODO temporary to deal with nested data
    console.log('data', data)
    updateScales(data);

    var data = d3.nest()
        .key(function (d) {
            return d.point_name;
        })
        .sortKeys(d3.ascending)
        .sortValues(function (a, b) { // sorts the values by time so we don't get lines moving back in time
            return a.timestamp - b.timestamp;
        })
        .entries(data);


    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", 4)
        .attr("y", 0.5)
        .attr("dy", "0.32em")
        .style("text-anchor", "start")
        .style("fill", "#000")
        .style("font-weight", "bold")
        .text("Point Value");

    g.append("g")
        .attr("class", "points")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .style("mix-blend-mode", "multiply")
        .attr("stroke", "steelblue")
        .attr("d", function (d) {
            d.line = this;
            return line(d.values);
        })
        .attr("id", function (d) {
            return d.values[0]['point_name'];
        });

    // This is a hacky solution for getting our data to mirror the example
    data.forEach(function (item) {
        let ln = item.line;
        item.values.forEach(function (value) {
            value['line'] = ln
        })
    });

    var focus = g.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
    .attr("y", -25);
    //     .attr("y", yScale(minYValue + 10));

    focus.append("text")
        .attr('class', 'another')
        .attr('y', -10);

    var voronoiGroup = g.append("g")
        .attr("class", "voronoi");


    voronoiGroup.selectAll("path")
        .data(voronoi.polygons(d3.merge(data.map(function (d) {
            return d.values;
        }))))
        .enter().append("path")
        .attr("d", function (d) {
            return d ? "M" + d.join("L") + "Z" : null;
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    d3.select("#show-voronoi") // This is just the "show voronoi" button. if we get rid of it, we can get rid of this
        .property("disabled", false)
        .on("change", function () {
            voronoiGroup.classed("voronoi--show", this.checked);
        });

    // Show a tooltip, circle, and greying our of other lines on mouseover.
    function mouseover(d) {
        d.data.line.parentNode.appendChild(d.data.line);
        focus.attr("transform", "translate(" + xScale(getTime(d.data.timestamp)) + "," + yScale(d.data.value) + ")");
        focus.select("text").text(d.data.point_name + '  -  ' + String(d.data.value));
        momentDate = moment(d.data.timestamp * 1000);
        focus.select("text.another").text(momentDate.format('M/D/YYYY h:MM:SS A'));
        changeOtherLineColors(d, '#c2c2c4', '3px', null);
    }

    // Changes the color of all the lines other than the one being hovered over to grey and thickens the hovered one
    function changeOtherLineColors(selectedLineData, color, width, blend) {
        // Finds all the actually relevant lines in the line graph
        let lines = d3.select('.points').selectAll('path')['_groups']; // still not 100% sure why this works
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
                if (lines[i][j].id !== selectedLineData.data['point_name']) {
                    lines[i][j].style.stroke = color;
                } else {
                    lines[i][j].style.strokeWidth = width;
                }
                lines[i][j].style.mixBlendMode = blend; // Get rid of blending for all lines
            }
        }
    }

    // Changes all the colors of the lines back to blue, small in width, and easy to see where they overlap
    function mouseout(d) {
        focus.attr("transform", "translate(-100,-100)");
        changeOtherLineColors(d, 'steelblue', '1px', 'multiply')
    }

    // Converts the timestamp as a unixtimestamp to a date to be understood by scaleTime()
    function getTime(unixTimestamp) {
        return new Date(unixTimestamp * 1000);
    }
}