let currentScene = 1;
let data;
let countryData;

Promise.all([
    d3.csv("goal15.forest_shares.csv"),
    d3.csv("countries_iso3166b.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
]).then(function([deforestationData, countries, world]) {
    data = deforestationData; 
    countryData = countries;
    initScenes(data, world);
});

function initScenes(data, world) {
    renderScene(currentScene, data, world);

    d3.select("#next").on("click", () => {
        if (currentScene < 3) {
            currentScene++;
            renderScene(currentScene, data, world);
        }
    });

    d3.select("#prev").on("click", () => {
        if (currentScene > 1) {
            currentScene--;
            renderScene(currentScene, data, world);
        }
    });
}

function renderScene(scene, data, world) {
    d3.select("#visualization").html(""); 
    switch (scene) {
        case 1:
            createBarChart("#visualization", getDeclines(data), "Top 5 Countries for Declines in Forestation (2000-2020)");
            break;
        case 2:
            createBarChart("#visualization", getGrowths(data), "Top 5 Countries for Growths in Forestation (2000-2020)");
            break;
        case 3:
            createMap("#visualization", data, world);
            break;
    }
}

function getDeclines(data) {
    return data
        .filter(d => !isNaN(d.trend)) 
        .sort((a, b) => a.trend - b.trend)
        .slice(0, 5)
        .map(d => {
            const countryInfo = countryData.find(c => c.iso3 === d.iso3c);
            return {
                iso3c: d.iso3c,
                trend: Math.abs(d.trend), 
                country: countryInfo ? countryInfo.country_common : d.iso3c,
                forests_2000: +d.forests_2000,
                forests_2020: +d.forests_2020
            };
        });
}

function getGrowths(data) {
    return data
        .filter(d => !isNaN(d.trend)) 
        .sort((a, b) => b.trend - a.trend)
        .slice(0, 5)
        .map(d => {
            const countryInfo = countryData.find(c => c.iso3 === d.iso3c);
            return {
                iso3c: d.iso3c,
                trend: Math.abs(d.trend),
                country: countryInfo ? countryInfo.country_common : d.iso3c,
                forests_2000: +d.forests_2000,
                forests_2020: +d.forests_2020
            };
        });
}

function createBarChart(selector, data, title) {
    if(title === "Top 5 Countries for Growths in Forestation (2000-2020)") {
        color = "green"
    } else {
        color = "red"
    }
    d3.select(selector).html("");

    const margin = {top: 200, right: 30, bottom: 40, left: 70};
    const width = 1000 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    const svg = d3.select(selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -150) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(title);

    const x = d3.scaleBand()
        .domain(data.map(d => d.country)) 
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.trend)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d => d));

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
    
    const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(data.map(d => ({
            note: {
                label: `2000: ${d.forests_2000}, 2020: ${d.forests_2020}`,
                title: d.country
            },
            x: x(d.country) + x.bandwidth() / 2,
            y: y(Math.abs(d.trend)),
            dy: -30,
            dx: 0
        })));

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}

function createMap(selector, data, world) {
    const width = 960;
    const height = 600;

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(selector).append("svg")
        .attr("width", width)
        .attr("height", height);

    const countries = topojson.feature(world, world.objects.countries).features;

    const color = d3.scaleLinear()
        .domain([-100, 0, 100])
        .range(["darkred", "white", "darkgreen"]);

    countries.forEach(function(country) {
        const countryInfo = countryData.find(c => c.iso_num == country.id);
        if (countryInfo?.iso3) {
            trendData = data.find(d => d.iso3c === countryInfo.iso3);
        }
        if (countryInfo) {
            country.country = countryInfo.country
        }
        if (trendData) {
            country.trend = trendData.trend;
            country.forests_2000 = trendData.forests_2000
            country.forests_2020 = trendData.forests_2020
        } 
        if (!countryInfo) {
            country.country = undefined
        }
        if (!trendData) {
            country.trend = 0
        }
    });

    svg.selectAll("path")
        .data(countries)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            return color(d.trend)
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
            const tooltip = d3.select("#tooltip")
                .style("opacity", 1)
                .html(`${d.country}<br/>Trend: ${d.trend}<br/>Percent Forest in 2000: ${d.forests_2000}<br/>Percent Forest in 2020: ${d.forests_2020}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", d => color(d.trend));
            d3.select("#tooltip").style("opacity", 0);
        });
    
    d3.select(selector).append("text")
        .attr("x", width / 2)
        .attr("y", -800) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Global Forestation Trends (2000 - 2020)");
}

d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px");