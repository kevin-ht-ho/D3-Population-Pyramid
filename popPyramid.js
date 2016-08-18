function pyramidBuilder(data, target, height, width){

function prettyFormat(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var w = width,
    h = height;
var margin = {
        top: 50,
        right: 10,
        bottom: 20,
        left: 10,
        middle: 20
    },
    sectorWidth = w / 2 - margin.middle,
    leftBegin = sectorWidth,
    rightBegin = w - sectorWidth;

    // string concat for translate
    function translation(x,y) {
      return 'translate(' + x + ',' + y + ')';
    }

var totalPopulation = d3.sum(data, function(d) {
        return d.male + d.female;
    }),
    percentage = function(d) {
        return d / totalPopulation;
    };

var region = d3.select(target).append('svg')
    .attr('width', margin.left + w + margin.right)
    .attr('height', margin.bottom + h + margin.top);


var legend = region.append('g')
      .attr('class','legend');

    legend.append('rect')
      .attr('class','bar left')
      .attr('x', (w/2) - (margin.middle*3) )
      .attr('y',12)
      .attr('width',12)
      .attr('height',12);

    legend.append('text')
      .attr('fill','#000')
      .attr('x', (w/2) - (margin.middle*2))
      .attr('y',18)
      .attr('dy','0.32em')
      .text('Males');

    legend.append('rect')
      .attr('class','bar right')
      .attr('x', (w/2) + (margin.middle*2) )
      .attr('y',12)
      .attr('width',12)
      .attr('height',12);

    legend.append('text')
      .attr('fill','#000')
      .attr('x', (w/2) + (margin.middle*3) )
      .attr('y',18)
      .attr('dy','0.32em')
      .text('Females');

var tooltipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var pyramid = region.append('g')
    .attr('class', 'inner-region')
    .attr('transform', translation(margin.left,margin.top));

    // find the maximum data value for whole dataset
    //  since this will be shared by both of the x-axes
    var maxValue = Math.max(
      d3.max(data, function(d) { return percentage(d.male); }),
      d3.max(data, function(d) { return percentage(d.female); })
    );

    // SET UP SCALES

    // the xScale goes from 0 to the width of a region
    //  it will be reversed for the left x-axis
    var xScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, sectorWidth])
      .nice();

    var xScaleLeft = d3.scaleLinear()
      .domain([0, maxValue])
      .range([sectorWidth, 0]);

    var xScaleRight = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, sectorWidth]);

    var yScale = d3.scaleBand()
      .domain(data.map(function(d) { return d.group; }))
      .range([h,0], 0.1);


    // SET UP AXES
    var yAxisLeft = d3.axisRight()
      .scale(yScale)
      .tickSize(4,0)
      .tickPadding(margin.middle-4);

    var yAxisRight = d3.axisLeft()
      .scale(yScale)
      .tickSize(4,0)
      .tickFormat('');

    var xAxisRight = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.format('.0%'));

      var xAxisLeft = d3.axisBottom()
      // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
      .scale(xScale.copy().range([leftBegin, 0]))
      .tickFormat(d3.format('.0%'));

    // MAKE GROUPS FOR EACH SIDE OF CHART
    // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = pyramid.append('g')
      .attr('transform', translation(leftBegin, 0) + 'scale(-1,1)');
    var rightBarGroup = pyramid.append('g')
      .attr('transform', translation(rightBegin, 0));

    // DRAW AXES
    pyramid.append('g')
      .attr('class', 'axis y left')
      .attr('transform', translation(leftBegin, 0))
      .call(yAxisLeft)
      .selectAll('text')
      .style('text-anchor', 'middle');

    pyramid.append('g')
      .attr('class', 'axis y right')
      .attr('transform', translation(rightBegin, 0))
      .call(yAxisRight);

    pyramid.append('g')
      .attr('class', 'axis x left')
      .attr('transform', translation(0, h))
      .call(xAxisLeft);

    pyramid.append('g')
      .attr('class', 'axis x right')
      .attr('transform', translation(rightBegin, h))
      .call(xAxisRight);

    // DRAW BARS
    leftBarGroup.selectAll('.bar.left')
      .data(data)
      .enter().append('rect')
        .attr('class', 'bar left')
        .attr('x', 0)
        .attr('y', function(d) { return yScale(d.group) + margin.middle/4; })
        .attr('width', function(d) { return xScale(percentage(d.male)); })
        .attr('height', (yScale.range()[0]/data.length) - margin.middle/2)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltipDiv.html("Males: " + prettyFormat(d.male) +
                            "<br />" + (Math.round(percentage(d.male) *1000) /10) + "% of population")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });

    rightBarGroup.selectAll('.bar.right')
      .data(data)
      .enter().append('rect')
        .attr('class', 'bar right')
        .attr('x', 0)
        .attr('y', function(d) { return yScale(d.group) + margin.middle/4; })
        .attr('width', function(d) { return xScale(percentage(d.female)); })
        .attr('height', (yScale.range()[0]/data.length) - margin.middle/2)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltipDiv.html("Females: " + prettyFormat(d.female) +
                            "<br />" + (Math.round(percentage(d.female) *1000) /10) + "% of population")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
