// Javascript file for Voronoi style line graph
// Author: Ethan Cassel-Mace & Eva Grench
// Edited to work for anomalies by Chris Tordi
// @TODO THIS SHOULD BE COMBINED WITH linegraph.js ASAP!!! REPEATED CODE IS GOING TO BUILD UP AND WILL ONLY
// GET HARDER TO SEPARATE
// Date: 2/11/2019


// This is what the dashboard calls to make the visualization.
function buildAnomalyViz(data, pointDict) {
    console.log("buildAnomalyViz()");
    console.log("point dict");
    console.log(pointDict);

    // viewBox and preserveAspectRatio with no height or width would make the svg responsive
    let svg = d3.select('#visualization')
        .append('svg')
        .attr('viewBox', '0 0 850 500')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .classed("svg-content", true);
    let margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 850 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
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
        .sortValues(function (a, b) {
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
        .attr("stroke", function (d) {
            if (pointDict[d.key] === null) {
                return "#cccac9"
            } else if (pointDict[d.key] === true) {
                return "#a32716"
            }
        })
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
        changeOtherLineColors(true, d.data['point_name'], pointDict[d.data['point_name']], '3px', null);
    }

    // Changes the color of all the lines other than the one being hovered over to grey and thickens the hovered one
    function changeOtherLineColors(mouseIn, hoveredLineId, hoveredPointIsAnomalous, width, blend) {
        let lines = d3.select('.points').selectAll('path')['_groups'];
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
                let currentId = lines[i][j].id;
                let currentPointIsAnomalous = pointDict[lines[i][j].id] === true;

                // Lots of cases here because the lines all now one of two colors so it changes was should happen when
                // one is hovered over versus another.
                if (mouseIn && currentId === hoveredLineId && hoveredPointIsAnomalous) {
                    lines[i][j].style.stroke = '#a32716';
                    lines[i][j].style.strokeWidth = width;
                } else if (mouseIn && currentId === hoveredLineId && hoveredPointIsAnomalous === null) {
                    lines[i][j].style.stroke = '#5e5e5e';
                    lines[i][j].style.strokeWidth = width;
                } else if (mouseIn && currentId !== hoveredLineId && currentPointIsAnomalous) {
                    lines[i][j].style.stroke = '#cc4f4f';
                } else if (mouseIn && currentId !== hoveredLineId && !currentPointIsAnomalous) {
                    lines[i][j].style.stroke = '#cccac9';
                } else if (!mouseIn && currentPointIsAnomalous) {
                    lines[i][j].style.stroke = '#a32716';
                    lines[i][j].style.strokeWidth = width;
                } else if (!mouseIn && !currentPointIsAnomalous) {
                    lines[i][j].style.stroke = '#cccac9';
                    lines[i][j].style.strokeWidth = width;
                }
                lines[i][j].style.mixBlendMode = blend; // All lines should stop blending when something is hovered over
            }
        }
    }

    // Changes all the colors of the lines back to red or grey, small in width, and easy to see where they overlap
    function mouseout(d) {
        focus.attr("transform", "translate(-100,-100)");
        changeOtherLineColors(false, d.data['point_name'], pointDict[d.data['point_name']], '1px', 'multiply')
    }

    // Converts the timestamp as a unixtimestamp to a date to be understood by scaleTime()
    function getTime(unixTimestamp) {
        return new Date(unixTimestamp * 1000);
    }
}