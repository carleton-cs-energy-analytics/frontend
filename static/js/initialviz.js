// Javascript file for Initial visualiation
// Modified from my assignment 4 in data visualization
// Author: Eva Grench
// Date: 1/29/2019

w = 700;			// Width of our visualization
h = 500;			// Height of our visualization
xOffset = 40;		// Space for x-axis labels
yOffset = 100;		// Space for y-axis labels
margin = 10;		// Margin around visualization
transDur = 1500;	// Duration of transitions (in milliseconds)
vals = ['point_id','point_name','1','2','3','4','5','6','7','8','9','10'] // data columns for the line data
mouseOverColor = '#9e9fa3'
colors = ["#b2746b", "#7a91c1", "#86b265"]

// create svg element at linegraph id
var svg = d3.select('#linegraph')
  .append('svg:svg')
  .attr('width', w)
  .attr('height', h);

function getScales(data) {
    xScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return parseFloat(d.timestamp); })-1,
						 d3.max(data, function(d) { return parseFloat(d.timestamp); })+1])
				.range([yOffset + margin, w - margin]);

    yScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return parseFloat(d.value); })-1,
						 d3.max(data, function(d) { return parseFloat(d.value); })+1])
				.range([h - xOffset - margin, margin]);
    return [xScale, yScale];
}


// draws the axis for each year
function drawAxis(xScale, yScale) {
    xAxis = d3.svg.axis()
               .scale(xScale)
               .orient('bottom')
               .ticks(5);

    xAxisG = svg.append('g')
               .attr('class', 'axis')
               .attr('transform', 'translate(0,' + (h - xOffset) + ')')
               .call(xAxis)

    xLabel = svg.append('text')
              .attr('class','label')
              .attr('x', w/2)
              .attr('y', h - 5)
              .text('Timestamp');

    yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .ticks(5);

    yAxisG = svg.append('g')
              .attr('class', 'axis')
              .attr('transform', 'translate(' + yOffset + ',0)')
              .call(yAxis)

    yLabel = svg.append('text')
              .attr('class','label')
              .attr('x', yOffset/2)
              .attr('y', h/2 - 10)
              .text('Value');
}


// draws all the lines
function drawLines(data, xScale, yScale) {
    // displays the state when a line is hovered over
    tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    line = svg.selectAll('.polyline')
                .data(data);

    line.enter().append('polyline')
                .attr('class', 'line')
                .attr('points', function(d) { return getPolylinePoints(d, xScale, yScale); })
                .style('stroke', function(d) { return getStroke(d); })
                .style('stroke-width', function(d) { return getStrokeWidth(d); })
                .style('fill','none')
                .on('mouseover', function(d) {
                    showTooltip(d);
                    greyoutOtherLines(d);
                })
                .on('mouseout', function(d) {
                    bringBackColor(d);
                    hideTooltip();
                })
                .on('click', function(d) {
                    if (d3.select(this).style('stroke-width') == '2.5px') { // Clicked on
                        toggleLine(d, true, '5px');
                    } else {
                        toggleLine(d, false, '2.5px');
                    }
                });
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
    tooltip.html('<p>' + d.values[0].point_name + '</p>') // shows the point name
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
}


// gets the color for a given line
function getStroke(d) {
    console.log(d.key, 'd.key');
    // return colors[d.key];
    return 'Black';
}


// gets the stoke width to be 1px
function getStrokeWidth(d) {
    return '2.5px';
}


// gets the point string for where the polyline should be drawn
function getPolylinePoints(d, xScale, yScale) {
    var points ='';
    for (var i = 0; i < d.values.length; i++) {
        x = xScale(d.values[i].timestamp);
        y = yScale(d.values[i].value);
        points += x + ',' + y + ', ';
    }
    return points.slice(0, -2);
}


// changes the thickness of a line when clicked
function toggleLine(selectedLineData, clickedOn, newThickness) {
    lines = d3.selectAll('polyline')
    for (i = 0; i < lines.length; i++) {
        for (j = 0; j < lines[i].length; j++) {
            if (lines[i][j].__data__.key == selectedLineData.key) {
                lines[i][j].style.strokeWidth = newThickness
            }
        }
    }
}


function greyoutOtherLines(selectedLineData) {
    lines = d3.selectAll('polyline')
    for (var i = 0; i < lines.length; i++) {
        for (var j = 0; j < lines[i].length; j++) {
            if (lines[i][j].__data__.key != selectedLineData.key) {
                lines[i][j].style.stroke = mouseOverColor;
            }
        }
    }
}


function bringBackColor(selectedLineData) {
    lines = d3.selectAll('polyline')
    for (var i = 0; i < lines.length; i++) {
        for (var j = 0; j < lines[i].length; j++) {
            if (lines[i][j].__data__.key != selectedLineData.key) {
                lines[i][j].style.stroke = getStroke(lines[i][j].__data__);
            }
        }
    }
}


// loads csv data and calls create axes and create line functions
function buildTrendViz(jsonData) {
    var data = jsonData;

    scales = getScales(data);
    xScale = scales[0];
    yScale = scales[1];

    dataByPoint = d3.nest()
        .key(function(d) { return d.point_name; })
        .entries(data);
    console.log('dataByPoint', dataByPoint);
    drawLines(dataByPoint, xScale, yScale);
    drawAxis(xScale, yScale);

}

/*d3.json('/static/js/dummy-json-values.json', function(jsonData) {
    var data = jsonData;

    scales = getScales(data);
    xScale = scales[0];
    yScale = scales[1];

    dataByPoint = d3.nest()
        .key(function(d) { return d.point_name; })
        .entries(data);
    console.log('dataByPoint', dataByPoint);
    drawLines(dataByPoint, xScale, yScale);
    drawAxis(xScale, yScale);
});*/
