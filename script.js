let currentScene = 0;
let data;

Promise.all([
    d3.csv("goal15.forest_shares.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
]).then(function([deforestationData, world]) {
    data = deforestationData; 
    initScenes(data, world);
});

function initScenes(data, world) {
    renderScene(currentScene, data, world);

    d3.select("#next").on("click", () => {
        currentScene++;
        if (currentScene < 3) {
            renderScene(currentScene, data, world);
        }
    });
}

function renderScene(scene, data, world) {
    d3.select("#visualization").html(""); 
    switch (scene) {
        case 0:
            showGlobalStats(data);
            break;
        case 1:
            createBarChart("#visualization", getDeclines(data), "Declines in Forestation");
            break;
        case 2:
            createBarChart("#visualization", getGrowths(data), "Growths in Forestation");
            break;
        default:
            // createMap("#map", data, world);
            break;
    }
}

function getDeclines(data) {
    return data
        .filter(d => !isNaN(d.trend)) 
        .sort((a, b) => a.trend - b.trend)
        .slice(0, 5);
}

function getGrowths(data) {
    return data
        .filter(d => !isNaN(d.trend)) 
        .sort((a, b) => b.trend - a.trend)
        .slice(0, 5);
}

function createBarChart(selector, data, title) {
    d3.select(selector).html("");

    const margin = {top: 20, right: 30, bottom: 40, left: 70};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.iso3c))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.trend), d3.max(data, d => d.trend)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.iso3c))
        .attr("y", d => y(d.trend))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.trend))
        .attr("fill", d => d.trend < 0 ? "red" : "green");

    svg.selectAll(".value-label")
        .data(data)
        .enter().append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.iso3c) - 10)
        .attr("y", d => y(d.trend) + 4)
        .text(d => d.trend) 
        .style("font-size", "12px")
        .style("fill", "black")
        .style("text-anchor", "end"); 
}
