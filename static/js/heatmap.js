// loads csv data and calls create axes and create line functions
function buildHeatmapViz(data) {

    let h = 700;
    let w = 1200;
    let xOffset = 40;		// Space for x-axis labels
    let yOffset = 100;		// Space for y-axis labels
    let margin = 10;		// Margin around visualization

    let svg = d3.select("#visualization").append("svg")
        .attr("height", h)
        .attr("width", w);


    function getScales(data, numPoints, numValues) {
        let colorScale;

        if (numValues <= 2) {
            colorScale = d3.scaleOrdinal()
                .domain(data.map(function (d) {
                    return d.value;
                }))
                .range(['#fcee50', '#a78be0']);
        } else {
            colorScale = d3.scaleOrdinal()
                .domain(data.map(function (d) {
                    return d.value;
                }))
                .range(colorbrewer.Set3[numValues]);
        }

        let xScale = d3.scaleTime()
            .domain([getTime(d3.min(data, function (d) {
                return parseFloat(d.timestamp);
            })),
                getTime(d3.max(data, function (d) {
                    return parseFloat(d.timestamp);
                }))])
            .range([yOffset + margin, w - margin]);

        let yScale = d3.scaleBand()
            .domain(data.map(function (d) {
                return d.point_name;
            }))
            .rangeRound([margin, h - xOffset - margin], 0, -.075);

        return [colorScale, xScale, yScale];
    }

    function getTime(unixTimestamp) {
        return new Date(unixTimestamp * 1000);
    }


// draws the axis for each year
    function drawAxis(xScale, yScale, numPoints) {
        let xAxis = d3.axisBottom(xScale)
            .scale(xScale)
            .ticks(5);

        let xAxisG = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h - xOffset + 1) + ')')
            .call(xAxis);

        let xLabel = svg.append('text')
            .attr('class', 'label')
            .attr('x', w / 2)
            .attr('y', h)
            .text('Timestamp');

        let yAxis = d3.axisLeft(yScale)
            .scale(yScale)
            .ticks(numPoints + 1);

        let yAxisG = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + (yOffset + 7) + ',0)')
            .call(yAxis);
    }


// draws all the lines
    function drawBoxes(data, colorScale, xScale, yScale, numPoints, dataByPoint) {
        // displays the state when a line is hovered over
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        let heatMap = svg.selectAll(".visualization")
            .data(data)
            .enter().append("svg:rect")
            .attr("x", function (d) {
                return xScale(getTime(d.timestamp));
            })
            .attr("y", function (d) {
                return yScale(d.point_name);
            })
            .attr("width", function (d) {
                return findBoxWidth(d, dataByPoint, xScale);
            })
            .attr("height", function (d) {
                return (h - xOffset) / numPoints;
            })
            .style("fill", function (d) {
                return colorScale(d.value);
            })
            .on('mouseover', function (d) {
                showTooltip(d);
            })
            .on('mouseout', function (d) {
                hideTooltip();
            });
    }

    function findBoxWidth(currentData, dataByPoint, xScale) {
        for (let i = 0; i < dataByPoint.length; i++) {
            if (dataByPoint[i].key === currentData.point_name) {
                for (let j = 0; j < dataByPoint[i].values.length; j++) {
                    if (dataByPoint[i].values[j].timestamp === currentData.timestamp && j + 1 < dataByPoint[i].values.length) {
                        return xScale(getTime(dataByPoint[i].values[j + 1].timestamp)) - xScale(getTime(currentData.timestamp));
                    } else if (dataByPoint[i].values[j].timestamp === currentData.timestamp) { // The last timestamp
                        return w - xScale(getTime(currentData.timestamp));
                    }
                }
            }
        }
    }


// hides the tooptip on mouseout
    function hideTooltip() {
        tooltip.transition()
            .duration(400)
            .style('opacity', 0);
    }


// shows the tooltip on mousein
    function showTooltip(d) {
        tooltip.transition()
            .duration(200)
            .style('opacity', .9); // makes it visible

        tooltip.html('<p>' + d.point_name + '<br>' + d.value + '</p>') // shows the point name and value
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
    }

    let dataByPoint = d3.nest()
        .key(function (d) {
            return d.point_name;
        })
        .sortKeys(d3.ascending)
        .sortValues(function (a, b) {
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

    drawBoxes(data, colorScale, xScale, yScale, numPoints, dataByPoint);
    drawAxis(xScale, yScale, numPoints);
}
