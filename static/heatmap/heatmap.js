//height of each row in the heatmap
//width of each column in the heatmap
var gridSize = 500,
    h = gridSize,
    w = gridSize,
    rectPadding = 60;

var colorMap = {"ON": 'green', "OFF": 'red'};

//var margin = {top: 20, right: 80, bottom: 30, left: 50},
//    width = 640 - margin.left - margin.right,
//    height = 380 - margin.top - margin.bottom;

var svg = d3.select("#heatmap").append("svg")
    .attr("width", w)
    .attr("height", h)
//  .append("g")
//    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function getScales(data) {
    colorScale = d3.scale.quantize()
                    .domain(["OFF", "OFF"])
                    .range(["red", "green"]);
    
    xScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return parseFloat(d.timestamp); })-1,
						 d3.max(data, function(d) { return parseFloat(d.timestamp); })+1])
				.range([rectPadding, w]);

    yScale = d3.scale.ordinal()
                .domain(data.map(function(d) { return d.point_name; }))
				.range([h - rectPadding, rectPadding]);
    
    return [colorScale, xScale, yScale];
}


// draws the axis for each year
function drawAxis(xScale, yScale) {
    xAxis = d3.svg.axis()
               .scale(xScale)
               .orient('bottom')
               .ticks(5);
    
    xAxisG = svg.append('g')
               .attr('class', 'axis')
               .attr('transform', 'translate(0,' + (h - rectPadding) + ')')
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
              .attr('transform', 'translate(' + rectPadding + ',0)')
              .call(yAxis)
      
    yLabel = svg.append('text')
              .attr('class','label')
              .attr('x', rectPadding/2)
              .attr('y', h/2 - 10)
              .text('Point');
}


// draws all the lines
function drawBoxes(data, colorScale, xScale, yScale) {
    // displays the state when a line is hovered over
    tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    var heatMap = svg.selectAll(".heatmap")
                .data(data)
                .enter().append("svg:rect")
                .attr("x", function(d) { return xScale(d.timestamp); })
                .attr("y", function(d) { return yScale(d.point_name); })
                .attr("width", function(d) { return 35; }) // Need to find the next timestamp
                .attr("height", function(d) { return (h - rectPadding)/3; }) //needs to be the number of points
                .style("fill", function(d) { return colorMap[d.value]; })
                .on('mouseover', function(d) {
                    showTooltip(d);
                })
                .on('mouseout', function(d) {
                    hideTooltip();
                })
                .on('click', function(d) {
                    if (d3.select(this).style('stroke-width') == '1px') { // Clicked on
                        
                    } else { // Clicked off

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
    tooltip.html('<p>' + d.point_name + '</p>') // shows the point name
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
}


// gets the color for a given line
function getStroke(d) {
    return colors[d.key];
}

// loads csv data and calls create axes and create line functions
d3.json('dummy-enums.json', function(jsonData) {
    var data = jsonData;
    
    scales = getScales(data);
    colorScale = scales[0]
    xScale = scales[1];
    yScale = scales[2];
    
//    dataByPoint = d3.nest()
//        .key(function(d) { return d.point_name; })
//        .entries(data);
//    
    drawBoxes(data, colorScale, xScale, yScale);
    drawAxis(xScale, yScale);
});
