var h = 700;
var w = 1200;
var xOffset = 40;		// Space for x-axis labels
var yOffset = 100;		// Space for y-axis labels
var margin = 10;		// Margin around visualization

// var colorMap = {"ON": 'green', "OFF": 'red'};

var svg = d3.select("#heatmap").append("svg")
    .attr("height", h)
    .attr("width", w);


function getScales(data, numPoints, numValues) {
    let colorScale = d3.scale.ordinal()
                .domain(data.map(function(d) { return d.value; }))
                .range(colorbrewer.Set3[numValues + 1]);

    let xScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return parseFloat(d.timestamp); }),
						 d3.max(data, function(d) { return parseFloat(d.timestamp); }) + 1])
				.range([yOffset + margin, w - margin]);

    let yScale = d3.scale.ordinal()
                .domain(data.map(function(d) { return d.point_name; }))
                .rangeRoundBands([margin, h - xOffset - margin], 0, -.075);
				// .range(getYRange(numPoints));
                // .rangeRoundBands([0, w], 0, 1);

    return [colorScale, xScale, yScale];
}


function getYRange(numPoints) {
    let range = [];
    let startVal = h - xOffset - margin;
    range.push(startVal);
    let numToAdd = (startVal - margin) / (numPoints - 1);
    for (let i = 1; i < numPoints - 1; i++) {
        range.push(range[i - 1] - numToAdd)
    }
    range.push(margin);

    return range;
}


// draws the axis for each year
function drawAxis(xScale, yScale, numPoints) {
    let xAxis = d3.svg.axis()
               .scale(xScale)
               .orient('bottom')
               .ticks(5);

    let xAxisG = svg.append('g')
               .attr('class', 'axis')
               .attr('transform', 'translate(0,' + (h - xOffset + 1) + ')')
               .call(xAxis);

    let xLabel = svg.append('text')
              .attr('class','label')
              .attr('x', w / 2)
              .attr('y', h)
              .text('Timestamp');

    let yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .ticks(numPoints + 1);

    let yAxisG = svg.append('g')
              .attr('class', 'axis')
              .attr('transform', 'translate(' + (yOffset + 7) + ',0)')
              .call(yAxis);

    // let yLabel = svg.append('text')
    //           // .attr("transform", "rotate(-90)")
    //           .attr('class','label')
    //           .attr('x', yOffset / 2)
    //           .attr('y', h / 2 - 10)
    //           .text('Point');
}


// draws all the lines
function drawBoxes(data, colorScale, xScale, yScale, numPoints, dataByPoint) {
    // displays the state when a line is hovered over
    tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    let heatMap = svg.selectAll(".heatmap")
                .data(data)
                .enter().append("svg:rect")
                .attr("x", function(d) { return xScale(d.timestamp); })
                // .attr("y", function(d) { return (yScale(d.point_name) - (((h - xOffset) / numPoints)) / 2); })
                .attr("y", function(d) { return yScale(d.point_name); })
                .attr("width", function(d) { return findBoxWidth(d, dataByPoint, xScale); }) // Need to find the next timestamp
                .attr("height", function(d) { return (h - xOffset) / numPoints; })
                .style("fill", function(d) { return colorScale(d.value); })
                .on('mouseover', function(d) {
                    showTooltip(d);
                })
                .on('mouseout', function(d) {
                    hideTooltip();
                });
}

function findBoxWidth(currentData, dataByPoint, xScale) {
    for (let i = 0; i < dataByPoint.length; i++) {
        if (dataByPoint[i].key == currentData.point_name) {
            for (let j = 0; j < dataByPoint[i].values.length; j++) {
                if (dataByPoint[i].values[j].timestamp == currentData.timestamp && j + 1 < dataByPoint[i].values.length) {
                    console.log(xScale(dataByPoint[i].values[j + 1].timestamp) - xScale(currentData.timestamp));
                    return xScale(dataByPoint[i].values[j + 1].timestamp) - xScale(currentData.timestamp)
                } else if (dataByPoint[i].values[j].timestamp == currentData.timestamp) {
                    return 90;
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


// gets the color for a given line
function getStroke(d) {
    return colors[d.key];
}

// loads csv data and calls create axes and create line functions
d3.json('dummy-enums.json', function(jsonData) {
    let data = jsonData;

    let dataByPoint = d3.nest()
                   .key(function(d) { return d.point_name; })
                   .sortKeys(d3.ascending)
                   .sortValues(function(a,b) { return parseFloat(a.timestamp) - parseFloat(b.timestamp); })
                   .entries(data);

    console.log(dataByPoint);

    let numPoints = dataByPoint.length;

    let numValues = d3.nest()
                   .key(function(d) { return d.value; })
                   .entries(data)
                    .length;

    let scales = getScales(data, numPoints, numValues);
    let colorScale = scales[0];
    let xScale = scales[1];
    let yScale = scales[2];

    drawBoxes(data, colorScale, xScale, yScale, numPoints, dataByPoint);
    drawAxis(xScale, yScale, numPoints);
});
