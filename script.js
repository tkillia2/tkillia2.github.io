d3.csv("goal15.forest_shares.csv").then(function(data) {
    data.forEach(d => {
        d.forests_2000 = +d.forests_2000;
        d.forests_2020 = +d.forests_2020;
        d.trend = +d.trend;
    });

    const declines = data.sort((a, b) => a.trend - b.trend).slice(0, 5);
    const growths = data.sort((a, b) => b.trend - a.trend).slice(0, 5);

    createBarChart("#visualization", declines, "Declines in Forestation");
    createBarChart("#visualization", growths, "Growths in Forestation");
});

function createBarChart(selector, data, title) {
    const svg = d3.select(selector).append("svg")
        .attr("width", 800)
        .attr("height", 400);
    
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.iso3c))
        .range([0, 600])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.trend), d3.max(data, d => d.trend)])
        .range([400, 0]);
    
    svg.append("g")
        .attr("transform", "translate(0,400)")
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.iso3c))
        .attr("y", d => yScale(d.trend))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 400 - yScale(d.trend))
        .attr("fill", d => d.trend < 0 ? "red" : "green");
    
    svg.append("text")
        .attr("x", 400)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text(title);
}
