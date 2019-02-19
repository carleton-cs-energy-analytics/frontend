// Javascript file for Voronoi style line graph
// Modified from example online by...
// Author: Ethan Cassel-Mace & Eva Grench
// Date: 2/11/2019


function buildTrendViz(data) {
    var w = 960,			// Width of our visualization (hacky)
        h = 500;            // Height of our visualization (hacky)

    var svg = d3.select('#visualization')
        .append('svg')
        .attr('width', w)
        .attr('height', h);
    console.log('svg', svg)
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // var xScale = d3.scaleLinear() // @TODO: used to be d3.scaleTime. look into this when switching back to time.
    //     .range([0, width]);

    var xScale = d3.scaleTime()
        .domain([getTime(d3.min(data, function (d) { return d.timestamp; })),
                getTime(d3.max(data, function (d) { return d.timestamp; }))])
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
        .attr("stroke", "steelblue")
        .attr("d", function (d) {
            //console.log(d)
            d.line = this;
            //console.log(d.values)
            return line(d.values);
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
        .attr("y", -10);

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

    function mouseover(d) {
        d3.select(d.data.line).classed("line--hover", true);
        d.data.line.parentNode.appendChild(d.data.line);
        focus.attr("transform", "translate(" + xScale(getTime(d.data.timestamp)) + "," + yScale(d.data.value) + ")");
        focus.select("text").text(d.data.point_name + '\n' + d.data.value);

    }

    function mouseout(d) {
        d3.select(d.data.line).classed("line--hover", false);
        focus.attr("transform", "translate(-100,-100)");
    }

    function getTime(unixTimestamp) {
        return new Date(unixTimestamp * 1000);
    }
}