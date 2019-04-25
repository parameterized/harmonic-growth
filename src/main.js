
var ssx = 800, ssy = 600;

function setup() {
  let canvas = createCanvas(ssx, ssy);
  canvas.parent('sketch');
  $('canvas').bind('contextmenu', function(e) {
    return false;
  });
  $('canvas').bind('mousedown', function(e) {
    if (e.detail > 1) {
      e.preventDefault();
    }
  });
  strokeJoin(ROUND);
}

function update() {
  let dt = min(1/frameRate(), 1/4);
}

let graph = {
  vertices: [
    {x: ssx/2, y: ssy/2 - 85},
    {x: ssx/2, y: ssy/2 + 85},
    {x: ssx/2 - 85, y: ssy/2},
    {x: ssx/2 + 85, y: ssy/2},
    {x: ssx/2, y: ssy/2 - 170},
    {x: ssx/2, y: ssy/2 + 170}
  ],
  edges: [
    [0, 1],
    [2, 3],
    [0, 3],
    [3, 1],
    [1, 2],
    [2, 0],
    [0, 4],
    [1, 5]
  ]
};

function draw() {
  update();
  background(50);
  stroke(200);
  fill(200);
  strokeWeight(2);
  for (let i in graph.edges) {
    let e = graph.edges[i];
    let v1 = graph.vertices[e[0]];
    let v2 = graph.vertices[e[1]];
    line(v1.x, v1.y, v2.x, v2.y);
  }
  for (let i in graph.vertices) {
    let v = graph.vertices[i];
    ellipse(v.x, v.y, 5, 5);
  }
}