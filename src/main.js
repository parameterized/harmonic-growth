
var ssx = 800, ssy = 600;

var gfx = {};
var sfx = {};

function preload() {
  gfx.toggleBG = loadImage('gfx/toggleBG.png');
  gfx.toggleSelector = loadImage('gfx/toggleSelector.png');
  gfx.play = loadImage('gfx/play.png');
  gfx.edit = loadImage('gfx/edit.png');
  gfx.dim2 = loadImage('gfx/dim2.png');
  gfx.dim3 = loadImage('gfx/dim3.png');
}

var cam, doGraphStep, defaultGraph, baseGraph, timer, closestToMouse;
var ctmDist, heldVertex, regrab, edgeVertex, graph, sim;

function setup() {
  let canvas = createCanvas(ssx, ssy);
  canvas.parent('sketch');
  let $canvas = $('canvas');
  $canvas.bind('contextmenu', function(e) {
    return false;
  });
  $canvas.bind('mousedown', function(e) {
    if (e.detail > 1 || e.which === 2) {
      e.preventDefault();
    }
  });
  $(document).bind('keydown', function(e) {
    if (e.keyCode === 9) { // tab
      e.preventDefault();
    }
  })
  strokeJoin(ROUND);

  doGraphStep = true;

  defaultGraph = new Graph();
  let v1 = defaultGraph.addVertex({x: ssx/2, y: ssy/2 - 85});
  let v2 = defaultGraph.addVertex({x: ssx/2, y: ssy/2 + 85});
  let v3 = defaultGraph.addVertex({x: ssx/2 - 85, y: ssy/2});
  let v4 = defaultGraph.addVertex({x: ssx/2 + 85, y: ssy/2});
  let v5 = defaultGraph.addVertex({x: ssx/2, y: ssy/2 - 170});
  let v6 = defaultGraph.addVertex({x: ssx/2, y: ssy/2 + 170});
  defaultGraph.addEdge(v1, v2);
  defaultGraph.addEdge(v3, v4);
  defaultGraph.addEdge(v1, v4);
  defaultGraph.addEdge(v4, v2);
  defaultGraph.addEdge(v2, v3);
  defaultGraph.addEdge(v3, v1);
  defaultGraph.addEdge(v1, v5);
  defaultGraph.addEdge(v2, v6);

  menu.load();

  load();
}

function load() {
  cam = new Cam({x: ssx/2, y: ssy/2});

  baseGraph = defaultGraph.clone();
  loadGraph();

  timer = 1;
  closestToMouse = 1;
  ctmDist = 0;
  heldVertex = null;
  regrab = false;
  edgeVertex = 1;
}

function loadGraph() {
  graph = baseGraph.clone();
  let dim = menu.dimToggle.selected === 1 ? '3d' : '2d';
  if (dim === '2d') {
    for (let i in graph.vertices) {
      let v = graph.vertices[i];
      v.z = random(-0.1, 0.1);
    }
  }
  sim = new Sim({graph: graph, dim: dim});
}

function update() {
  let dt = min(1/frameRate(), 1/4);

  menu.update(dt);

  timer -= dt*3;
  if (timer < 0) {
    timer += 1;
    if (doGraphStep && menu.editToggle.selected === 0) {
      sim.graphStep();
    }
  }
  sim.embedStep();

  let [mx, my] = cam.screen2world(mouseX, mouseY);
  ctmDist = null;
  for (let vi in graph.vertices) {
    let v = graph.vertices[vi];
    let mdist = dist(v.x, v.y, mx, my);
    if (ctmDist === null || mdist < ctmDist) {
      ctmDist = mdist;
      closestToMouse = vi;
    }
  }
  if (regrab) {
    regrab = false;
    heldVertex = closestToMouse;
  }
  if (heldVertex) {
    let v = graph.vertices[heldVertex];
    if (v) {
      v.x = mx, v.y = my;
    }
  }
}

function keyPressed() {
  menu.keyPressed();
  if (menu.editToggle.selected === 1) { // edit
    switch (keyCode) {
      case 88: // x
        graph.removeVertex(closestToMouse);
        break;
      case 86: // v
      case 69: // e
        edgeVertex = closestToMouse;
        break;
    }
  }
  switch (keyCode) {
    case 70: // f
      let sumx = 0, sumy = 0, sumn = 0;
      for (let i in graph.vertices) {
        let v = graph.vertices[i];
        sumx += v.x;
        sumy += v.y;
        sumn += 1;
      }
      if (sumn === 0) { sumn = 1; }
      let meanx = sumx/sumn, meany = sumy/sumn;
      let sumd = 0;
      sumn = 0;
      for (let i in graph.vertices) {
        let v = graph.vertices[i];
        sumd += pow(v.x - meanx, 2) + pow(v.y - meany, 2);
        sumn += 1;
      }
      if (sumn === 0) { sumn = 1; }
      let std = sqrt(sumd/sumn);
      if (std === 0) { std = 50; }
      cam.x = meanx;
      cam.y = meany;
      cam.scale = 1/(std/120);
      break;
    case 82: // r
      load();
      break;
    case 32: // space
      doGraphStep = !doGraphStep;
      break;
  }
}

function keyReleased() {
  let [mx, my] = cam.screen2world(mouseX, mouseY);
  if (menu.editToggle.selected === 1) { // edit
    let v1, v2;
    switch (keyCode) {
      case 86: // v
        v1 = edgeVertex;
        v2 = graph.addVertex({x: mx, y: my});
        if (graph.vertices[v1]) {
          graph.addEdge(v1, v2);
        }
        break;
      case 69: // e
        v1 = edgeVertex, v2 = closestToMouse;
        if (v1 !== v2) {
          if (graph.edges[v1] && graph.edges[v1][v2]) {
            graph.removeEdge(v1, v2);
          } else if (graph.vertices[v1] && graph.vertices[v2]) {
            graph.addEdge(v1, v2);
          }
        }
        break;
    }
  }
}

function mousePressed() {
  let x = mouseX, y = mouseY;
  if (x < menu.x) {
    if (mouseButton === LEFT) {
      heldVertex = closestToMouse;
    }
  } else {
    menu.mousePressed();
  }
}

function mouseReleased() {
  if (mouseButton === LEFT) {
    heldVertex = null;
  }
}

function rotateY3D(p, theta) {
  let sin_t = sin(theta);
  let cos_t = cos(theta);
  let x = p.x, z = p.z;
  p.x = x*cos_t - z*sin_t;
  p.z = z*cos_t + x*sin_t;
  return p;
}

function rotateX3D(p, theta) {
  let sin_t = sin(theta);
  let cos_t = cos(theta);
  let y = p.y, z = p.z;
  p.y = y*cos_t - z*sin_t;
  p.z = z*cos_t + y*sin_t;
  return p;
}

function mouseDragged() {
  let x = mouseX, y = mouseY;
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;
  if (mouseButton === RIGHT) {
    cam.x -= dx/cam.scale;
    cam.y -= dy/cam.scale;
  } else if (mouseButton === CENTER) {
    if (menu.dimToggle.selected === 1) { // 3d
      let sumx = 0, sumy = 0, sumz = 0, sumn = 0;
      for (let i in graph.vertices) {
        let v = graph.vertices[i];
        sumx += v.x;
        sumy += v.y;
        sumz += v.z;
        sumn += 1;
      }
      if (sumn === 0) { sumn = 1; }
      let meanx = sumx/sumn, meany = sumy/sumn, meanz = sumz/sumn;
      for (let i in graph.vertices) {
        let v = graph.vertices[i];
        let p = {x: v.x - meanx, y: v.y - meany, z: v.z - meanz};
        rotateY3D(p, dx*0.01);
        rotateX3D(p, dy*0.01);
        v.x = p.x + meanx, v.y = p.y + meany, v.z = p.z + meanz;
      }
    }
  }
}

function mouseWheel(event) {
  cam.scale *= 1 - event.delta*0.001;
}

function draw() {
  update();
  background(50);
  cam.set();
  graph.draw();
  cam.reset();
  menu.draw();
}