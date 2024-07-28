let currentScene = 0;
let data;

Promise.all([
    d3.csv("goal15.forest_shares.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
]).then(function([deforestationData, world]) {
    const countryNameMap = {};
    const countries = topojson.feature(world, world.objects.countries).features;

    console.log('countires: ', countries)
    
    countries.forEach(country => {
        const iso3c = country.id; 
        const name = country.properties.name;
        countryNameMap[iso3c] = name;
    });

    data = deforestationData; 
    initScenes(data, countryNameMap, world);
});

function initScenes(data, countryNameMap, world) {
    renderScene(currentScene, data, countryNameMap, world);

    d3.select("#next").on("click", () => {
        currentScene++;
        if (currentScene < 3) {
            renderScene(currentScene, data, countryNameMap, world);
        }
    });

    d3.select("#prev").on("click", () => {
        currentScene--;
        if (currentScene >= 0) {
            renderScene(currentScene, data, countryNameMap, world);
        }
    });
}

function renderScene(scene, data, countryNameMap, world) {
    d3.select("#visualization").html(""); 
    switch (scene) {
        case 0:
            showGlobalStats(data);
            break;
        case 1:
            createBarChart("#visualization", getDeclines(data, countryNameMap), "Declines in Forestation");
            break;
        case 2:
            createBarChart("#visualization", getGrowths(data, countryNameMap), "Growths in Forestation");
            break;
        default:
            // createMap("#map", data, world);
            break;
    }
}

function showGlobalStats(data) {
    d3.select("#visualization").append("h2")
        .text("Global Forest Statistics (2000 - 2020)");
}

function getDeclines(data, countryNameMap) {
    return data
        .filter(d => !isNaN(d.trend)) 
        .sort((a, b) => a.trend - b.trend)
        .slice(0, 5)
        .map(d => ({
            iso3c: d.iso3c,
            country: countryNameMap[d.iso3c] || d.iso3c,
            trend: Math.abs(d.trend)
        }));
}

function getGrowths(data, countryNameMap) {
    return data
        .filter(d => !isNaN(d.trend)) 
        .sort((a, b) => b.trend - a.trend)
        .slice(0, 5)
        .map(d => ({
            iso3c: d.iso3c,
            country: countryNameMap[d.iso3c] || d.iso3c, 
            trend: Math.abs(d.trend) 
        }));
}

function createBarChart(selector, data, title) {
    if(title === "Growths in Forestation") {
        color = "green"
    } else {
        color = "red"
    }
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
        .domain(data.map(d => d.country)) 
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.trend)]) 
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
        .attr("x", d => x(d.country))
        .attr("y", d => y(d.trend))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.trend))
        .attr("fill", color);

    svg.selectAll(".value-label")
        .data(data)
        .enter().append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.country) + x.bandwidth() / 2) 
        .attr("y", d => y(d.trend) - 5) 
        .text(d => d.trend) 
        .style("font-size", "12px")
        .style("fill", "black")
        .style("text-anchor", "middle"); 
}
