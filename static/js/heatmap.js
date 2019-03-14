// Javascript file for heatmap to display enumerated values
// Significantly modified from a combination of labs and homeworks from data visualization
// Author: Eva Grench
// Date: 2/9/2019

// This is all in one function so that javascript doesn't start mixing variables between this code and the line graph...
// This is what the dashboard calls to make the visualization.
function buildHeatmapViz(data) {

    let h = 700;		    // Height of the svg and used for various other things
    let w = 1200;		    // Width of the svg and used for various other things
    let xOffset = 40;		// Space for x-axis labels
    let yOffset = 100;		// Space for y-axis labels
    let margin = 10;		// Margin around visualization

    // The svg element that everything is connected to
    let svg = d3.select("#visualization").append("svg")
        .attr("height", h)
        .attr("width", w);

    // Returns the three different scales that are used to make the visualization: xScale, yScale, and colorScale
    function getScales(data, numPoints, numValues) {
        let colorScale;

        // If we are only visualizing 2 enums, we need to manually select colors because colorbrewer's minimum is 3.
        if (numValues <= 2) {
            colorScale = d3.scaleOrdinal()
                .domain(data.map(function (d) {
                    return d.value; // Each value gets its own color
                }))
                .range(["rgb(38,73,109)", "rgb(180,221,212)"]);
        } else {
            colorScale = d3.scaleOrdinal()
                .domain(data.map(function (d) {
                    return d.value; // Each value gets its own color
                }))
                .range(colorbrewer.Set3[numValues]);
        }

        // x-axis is all about time, so we use the built in scaleTime() to make it
        let xScale = d3.scaleTime()
            .domain([getTime(d3.min(data, function (d) {
                return parseFloat(d.timestamp); // min timestamp is where we start
            })),
                getTime(d3.max(data, function (d) {
                    return parseFloat(d.timestamp); // max timestamp is where we end
                }))])
            .range([yOffset + margin, w - margin]);

        // y-axis is points, so there is no linear sort of scale for this.
        let yScale = d3.scaleBand()
            .domain(data.map(function (d) {
                return d.point_name;
            }))
            // we want a little space above and below the first and last point --> that is why we are using rangeRound
            .rangeRound([margin, h - xOffset - margin], 0, -.075);

        return [colorScale, xScale, yScale];
    }

    // Converts the timestamp as a unixtimestamp to a date to be understood by scaleTime()
    function getTime(unixTimestamp) {
        return new Date(unixTimestamp * 1000);
    }

    // Gets the timestamp in human readable format for the tooltip
    function getPrettyTime(unixTimestamp) {
        date = new Date(unixTimestamp * 1000);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear() % 2000;
        let minute = date.getMinutes();
        let hour = date.getHours();
        // We want there to always be two digits for hours and minutes.
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        return hour + ':' + minute + ',   ' + month + '/' + day + '/' + year;
    }


    // Draws the axes for the heatmap.
    function drawAxis(xScale, yScale, numPoints) {
        let xAxis = d3.axisBottom(xScale)
            .scale(xScale)
            .ticks(5); // I'm not convinced this does anything or really should...

        let xAxisG = svg.append('g') // I still don't know what a g is, but they all use it
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h - xOffset - 7) + ')')
            .call(xAxis);

        let xLabel = svg.append('text')
            .attr('class', 'label')
            .attr('x', w / 2)
            .attr('y', h - 3)
            .text('Timestamp');

        let yAxis = d3.axisLeft(yScale)
            .scale(yScale)
            .ticks(numPoints + 1);

        let yAxisG = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + (yOffset + 7) + ',0)')
            .call(yAxis);
    }


    // Draws all the boxes.
    function drawBoxes(data, colorScale, xScale, yScale, numPoints, dataByPoint) {
        // The tooltip to display more information when hovering over a particular box
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('text-align', 'center');

        // All the boxes
        let heatMap = svg.selectAll(".visualization")
            .data(data)
            .enter().append("svg:rect") // A bunch of rectangles
            .attr("x", function (d) {
                return xScale(getTime(d.timestamp)); // The box is located in along the x-axis where the timestamp for the value starts
            })
            .attr("y", function (d) {
                return yScale(d.point_name); // The box is located in the row for the point the value is related to
            })
            .attr("width", function (d) {
                return findBoxWidth(d, dataByPoint, xScale);
            })
            .attr("height", function (d) {
                return (h - xOffset) / numPoints; // The height of the box is the height of the viz divided by how many rows there are
            })
            .style("fill", function (d) {
                return colorScale(d.value); // color is dependent on the value
            })
            .on('mouseover', function (d) {
                showTooltip(d); // hover displays the tooltip
            })
            .on('mouseout', function (d) {
                hideTooltip();
            });
    }

    // Gets the width of each rectangle
    function findBoxWidth(currentData, dataByPoint, xScale) {
        // Probably not the most efficient way of doing things, but for each box, this loops through all the data
        // finding the data for the next rectangle and uses that to get the width of the box.
        for (let i = 0; i < dataByPoint.length; i++) {
            if (dataByPoint[i].key === currentData.point_name) {
                for (let j = 0; j < dataByPoint[i].values.length; j++) {
                    if (dataByPoint[i].values[j].timestamp === currentData.timestamp && j + 1 < dataByPoint[i].values.length) {
                        // Most boxes are where the next box begins to where this one begins plus a little bit to avoid whitespace
                        return xScale(getTime(dataByPoint[i].values[j + 1].timestamp)) - xScale(getTime(currentData.timestamp)) + 1;
                    } else if (dataByPoint[i].values[j].timestamp === currentData.timestamp) { // The last timestamp
                        // The last box just fills in what's left
                        return w - xScale(getTime(currentData.timestamp));
                    }
                }
            }
        }
    }

    // Shows the tooltip on mousein
    function showTooltip(d) {
        tooltip.transition()
            .duration(200)
            .style('opacity', .9); // makes it visible

        // shows the point name, value, and time
        tooltip.html('<p>' + d.point_name + '<br>' + d.value + '<br>' + getPrettyTime(d.timestamp) + '</p>')
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
    }

    // Hides the tooptip on mouseout
    function hideTooltip() {
        tooltip.transition()
            .duration(400)
            .style('opacity', 0);
    }

    // WHAT IS BASICALLY THE MAIN FUNCTION...

    // This groups the data by point, so all the values are associated with the point they are from
    let dataByPoint = d3.nest()
        .key(function (d) {
            return d.point_name;
        })
        .sortKeys(d3.ascending) // Sorts the keys (makes the heatmap more readable because some like things are nearer)
        .sortValues(function (a, b) { // Importantly sorts the values by timestamp to be able to get the width of the boxes
            return parseFloat(a.timestamp) - parseFloat(b.timestamp);
        })
        .entries(data);

    let numPoints = dataByPoint.length;

    let numValues = d3.nest()
        .key(function (d) {
            return d.value;
        })
        .entries(data)
        .length;

    let scales = getScales(data, numPoints, numValues);
    let colorScale = scales[0];
    let xScale = scales[1];
    let yScale = scales[2];

    // Make the viz!
    drawBoxes(data, colorScale, xScale, yScale, numPoints, dataByPoint);
    drawAxis(xScale, yScale, numPoints);
}
