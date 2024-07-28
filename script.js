Promise.all([
    d3.csv("data/deforestation.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
]).then(function([data, world]) {
    data.forEach(d => {
        d.forest_2000 = +d.forest_2000;
        d.forest_2020 = +d.forest_2020;
        d.trend = +d.trend;
    });

    const declines = data.sort((a, b) => a.trend - b.trend).slice(0, 5);
    const growths = data.sort((a, b) => b.trend - a.trend).slice(0, 5);

    createBarChart("#visualization", declines, "Declines in Forestation");
    createBarChart("#visualization", growths, "Growths in Forestation");

    createMap("#map", data, world);
}).catch(error => {
    console.error("Error loading the data:", error);
});

function createBarChart(selector, data, title) {
    const svg = d3.select(selector).append("svg")
        .attr("width", 800)
        .attr("height", 400 + 50);

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
    
    svg.selectAll(".label")
        .data(data)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.iso3c) + xScale.bandwidth() / 2)
        .attr("y", 420)
        .attr("text-anchor", "middle")
        .text(d => d.iso3c);
    
    svg.append("text")
        .attr("x", 400)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text(title);
}

function createMap(selector, data, world) {
    const svg = d3.select(selector).append("svg")
        .attr("width", 800)
        .attr("height", 400);

    const projection = d3.geoMercator().fitSize([800, 400], world);
    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(topojson.feature(world, world.objects.countries).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            const country = data.find(c => c.iso3c === d.id);
            return country ? (country.trend < 0 ? "red" : "green") : "lightgrey";
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);
}
