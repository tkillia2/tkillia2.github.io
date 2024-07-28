// Sample data
const data = "cfb23.csv";

let currentScene = 0;

function renderScene(sceneIndex) {
  const container = d3.select("#visualization-container");
  container.html(""); // Clear previous content

  // Create SVG element
  const svg = container.append("svg").attr("width", 1200).attr("height", 600);

  // Add elements based on the scene
  if (sceneIndex === 0) {
    svg
      .append("text")
      .attr("x", 100)
      .attr("y", 100)
      .text("2023 NCAA College Football Season Overview")
      .style("font-size", "24px");
  } else if (sceneIndex === 1) {
    svg
      .append("text")
      .attr("x", 100)
      .attr("y", 50)
      .text("Top Team Performances")
      .style("font-size", "24px");

    const margin = { top: 80, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.Off_Rank)]) // Ensure numeric data
      .range([0, width]);
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.Team))
      .range([0, height])
      .padding(0.1);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g").call(d3.axisLeft(y));
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", (d) => y(d.Team))
      .attr("width", (d) => x(+d.Off_Rank))
      .attr("height", y.bandwidth())
      .attr("fill", "steelblue");
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  } else if (sceneIndex === 2) {
    svg
      .append("circle")
      .attr("cx", 400)
      .attr("cy", 300)
      .attr("r", 150)
      .style("fill", "yellow");
  } else if (sceneIndex === 3) {
    // Scene 2: Example content
    svg
      .append("rect")
      .attr("x", 350)
      .attr("y", 250)
      .attr("width", 300)
      .attr("height", 500)
      .style("fill", "orange");
  } else if (sceneIndex === 4) {
    svg
      .append("circle")
      .attr("cx", 400)
      .attr("cy", 300)
      .attr("r", 75)
      .style("fill", "red");
  }
  // Add more scenes as needed
}

d3.select("#nextButton").on("click", function () {
  currentScene = (currentScene + 1) % 5; // Cycle through scenes
  renderScene(currentScene);
});

// Initial render
renderScene(currentScene);
