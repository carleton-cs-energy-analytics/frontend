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
mouseOverColor = '#565556'
colors = ["#b2746b", "#7a91c1", "#86b265"]

xScale = d3.scale.linear()
				.domain([1,10])
				.range([yOffset + margin, w - margin]);

yScale = d3.scale.linear()
				.domain([0,90])
				.range([h - xOffset - margin, margin]);

// create svg element at linegraph id
var svg = d3.select('#linegraph')
  .append('svg:svg')
  .attr('width', w)
  .attr('height', h);


// draws the axis for each year
function drawAxis(year) {
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
function drawLines(data) {
    // displays the state when a line is hovered over
    tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    line = svg.selectAll('.polyline')
                .data(data);

    line.enter().append('polyline')
                .attr('class', 'line')
                .attr('points', function(d) { return getPolylinePoints(d); })
                .style('stroke', function(d) { return getStroke(d); })
                .style('stroke-width', function(d) { return getStrokeWidth(d); })
                .style('fill','none')
                .on('mouseover', function(d) {
                    showTooltip(d);
                    highlightLine(d, true);
                })
                .on('mouseout', function(d) {
                    hideTooltip();
                    highlightLine(d, false);
                })
                .on('click', function(d) {
                    if (d3.select(this).style('stroke-width') == '1px') { // Clicked on
                        toggleLine(d, true, '5px');
                    } else { // Clicked off (can't click on US)
                        toggleLine(d, false, '1px');
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
    tooltip.html('<p>' + d['point_name'] + '</p>') // shows the point name
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
}


// gets the color for a given line
function getStroke(d) {
    return colors[d['point_id']];
}


// gets the stoke width to be 1px
function getStrokeWidth(d) {
    return '2.5px';
}


// gets the point string for where the polyline should be drawn
function getPolylinePoints(d) {
    var points ='';
    for (var i = 2; i < vals.length; i++) {
        x = xScale(Number(vals[i]));
        y = yScale(Number(d[vals[i]]));
        points += x + ',' + y + ', ';
    }
    return points.slice(0, -2);
}


// changes the thickness and color of a line when clicked
function toggleLine(selectedLineData, clickedOn, newThickness) {
    lines = d3.selectAll('polyline')
    for (i = 0; i < lines.length; i++) {
        for (j = 0; j < lines[i].length; j++) {
            if (lines[i][j].__data__['point_name'] == selectedLineData['point_name']) {
                if (clickedOn) {
                    lines[i][j].style.stroke = mouseOverColor
                } else {
                    lines[i][j].style.stroke = getStroke(lines[i][j].__data__)
                }
                lines[i][j].style.strokeWidth = newThickness
            }
        }
    }
}


// changes the color of a line when hovered over and moused out
function highlightLine(selectedLineData, isMouseOver) {
  lines = d3.selectAll('polyline')
	for (i = 0; i < lines.length; i++) {
		for (j = 0; j < lines[i].length; j++) {
			if (lines[i][j].__data__['point_name'] == selectedLineData['point_name'] && lines[i][j].style.strokeWidth != '5px' && !isMouseOver) {
				lines[i][j].style.stroke = getStroke(lines[i][j].__data__)
			} else if (lines[i][j].__data__['point_name'] == selectedLineData['point_name'] && lines[i][j].style.strokeWidth != '5px' && isMouseOver) {
				lines[i][j].style.stroke = mouseOverColor
			}
		}
	}
}


// loads csv data and calls create axes and create line functions
d3.json('dummy-json-values.json', function(jsonData) {
    drawLines(jsonData);
    drawAxis();
});
