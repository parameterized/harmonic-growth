
function Graph(t) {
  t = orDefault(t, {});
  this.vertices = orDefault(t.vertices, []);
  this.edges = orDefault(t.edges, []);
}

Graph.prototype.clone = function() {
  let newGraph = new Graph();
  for (let k in this.vertices) {
    let v = this.vertices[k];
    newGraph.vertices[k] = {x: v.x, y: v.y, z: v.z};
  }
  for (let k in this.edges) {
    let v = this.edges[k];
    newGraph.edges[k] = [];
    for (let k2 in v) {
      let v2 = v[k2];
      newGraph.edges[k][k2] = v2;
    }
  }
  return newGraph;
}

Graph.prototype.addVertex = function(p) {
  p = orDefault(p, {});
  p.x = orDefault(p.x, random(-0.1, 0.1));
  p.y = orDefault(p.y, random(-0.1, 0.1));
  p.z = orDefault(p.z, random(-0.1, 0.1));
  let i = this.vertices.length;
  this.vertices[i] = p;
  return i;
}

Graph.prototype.removeVertex = function(i) {
  //let e = $.extend(true, {}, this.edges[i]);
  let e = lume.clone(this.edges || {});
  for (let v2i in e) {
    this.removeEdge(i, v2i);
  }
  delete this.vertices[i];
}

Graph.prototype.addEdge = function(a, b, v) {
  if (!this.vertices[a] || !this.vertices[b] || a === b) {
    return;
  }
  v = orDefault(v, true);
  this.edges[a] = orDefault(this.edges[a], []);
  this.edges[b] = orDefault(this.edges[b], []);
  this.edges[a][b] = v;
  this.edges[b][a] = v;
}

Graph.prototype.removeEdge = function(a, b) {
  if (this.edges[a]) {
    delete this.edges[a][b];
  }
  if (this.edges[b]) {
    delete this.edges[b][a];
  }
}

Graph.prototype.draw = function() {
  let [mx, my] = cam.screen2world(mouseX, mouseY);
  stroke(200);
  fill(200);
  strokeWeight(2);
  for (let v1i in this.edges) {
    let t = this.edges[v1i];
    for (let v2i in t) {
      let v1 = this.vertices[v1i];
      let v2 = this.vertices[v2i];
      line(v1.x, v1.y, v2.x, v2.y);
    }
  }
  stroke(150, 150, 200);
  fill(150, 150, 200);
  if (menu.editToggle.selected === 1) { // edit
    if (keyIsDown(86)) { // v
      let v = this.vertices[edgeVertex];
      if (v) {
        line(v.x, v.y, mx, my);
        noStroke();
        ellipse(mx, my, 5, 5);
      }
    } else if (keyIsDown(69)) { // e
      let v1 = this.vertices[edgeVertex];
      let v2 = this.vertices[closestToMouse];
      if (v1 && v2) {
        if (this.edges[edgeVertex] && this.edges[edgeVertex][closestToMouse]) {
          stroke(200, 150, 150);
        }
        line(v1.x, v1.y, v2.x, v2.y);
      }
    }
  }
  fill(200);
  noStroke();
  for (let i in this.vertices) {
    let v = this.vertices[i];
    ellipse(v.x, v.y, 5, 5);
  }
  let v = this.vertices[closestToMouse];
  if (v) {
    fill(50, 200, 50);
    ellipse(v.x, v.y, 5, 5);
  }
}