// Sample data
const data = [ /* Your data here */ ];

let currentScene = 0;

function renderScene(sceneIndex) {
  const container = d3.select('#visualization-container');
  container.html('');  // Clear previous content

  // Create SVG element
  const svg = container.append('svg')
    .attr('width', 1200)
    .attr('height', 600);

  // Add elements based on the scene
  if (sceneIndex === 0) {
    // Scene 1: Example content
    svg.append('circle')
      .attr('cx', 400)
      .attr('cy', 300)
      .attr('r', 50)
      .style('fill', 'blue');
  } else if (sceneIndex === 1) {
    // Scene 2: Example content
    svg.append('rect')
      .attr('x', 350)
      .attr('y', 250)
      .attr('width', 100)
      .attr('height', 100)
      .style('fill', 'green');
  } else if (sceneIndex === 2) {
    svg.append('circle')
    .attr('cx', 400)
    .attr('cy', 300)
    .attr('r', 150)
    .style('fill', 'yellow');
  }  else if (sceneIndex === 3) {
    // Scene 2: Example content
    svg.append('rect')
      .attr('x', 350)
      .attr('y', 250)
      .attr('width', 300)
      .attr('height', 500)
      .style('fill', 'orange');
  } else if (sceneIndex === 4) {
    svg.append('circle')
    .attr('cx', 400)
    .attr('cy', 300)
    .attr('r', 75)
    .style('fill', 'red');
  } 
  // Add more scenes as needed
}

d3.select('#nextButton').on('click', function() {
  currentScene = (currentScene + 1) % 5;  // Cycle through scenes
  renderScene(currentScene);
});

// Initial render
renderScene(currentScene);
