
function Sim(t) {
  t = orDefault(t, {});
  this.graph = orDefault(t.graph, new Graph());
  this.dim = orDefault(t.dim, '2d');
}

Sim.prototype.graphStep = function() {
  let vlist = [];
  for (let i in this.graph.vertices) {
    vlist.push(i);
  }
  if (vlist.length === 0) { return; }
  let v1i = lume.randomchoice(vlist);
  let v1 = this.graph.vertices[v1i];
  let e = lume.clone(this.graph.edges[v1i] || {});
  // surrounding vertices
  let sv = [];
  for (let v2i in e) {
    sv.push(v2i);
  }
  if (heldVertex === v1i) {
    regrab = true;
  }
  this.graph.removeVertex(v1i);
  // new vertices
  let x = random(v1.x - 50, v1.x + 50);
  let y = random(v1.y - 50, v1.y + 50);
  let z = this.dim === '2d' ? random(-0.1, 0.1) : random(v1.z - 50, v1.z + 50);
  let nv1i = this.graph.addVertex({x: x, y: y, z: z});
  let nv1 = this.graph.vertices[nv1i];
  x = random(v1.x - 50, v1.x + 50);
  y = random(v1.y - 50, v1.y + 50);
  z = this.dim === '2d' ? random(-0.1, 0.1) : random(v1.z - 50, v1.z + 50);
  let nv2i = this.graph.addVertex({x: x, y: y, z: z});
  let nv2 = this.graph.vertices[nv2i];
  this.graph.addEdge(nv1i, nv2i);
  if (sv.length === 1) {
    let sv1i = sv[0];
    let sv1 = this.graph.vertices[sv1i];
    // squared distance
    let nv1sv1d = pow(nv1.x - sv1.x, 2) + pow(nv1.y - sv1.y, 2) + (this.dim === '2d' ? 0 : pow(nv1.z - sv1.z, 2));
    let nv2sv1d = pow(nv2.x - sv1.x, 2) + pow(nv2.y - sv1.y, 2) + (this.dim === '2d' ? 0 : pow(nv2.z - sv1.z, 2));
    if (nv1sv1d < nv2sv1d) {
      this.graph.addEdge(nv1i, sv1i);
    } else {
      this.graph.addEdge(nv2i, sv1i);
    }
  } else if (sv.length === 2) {
    let sv1i = sv[0];
    let sv1 = this.graph.vertices[sv1i];
    let sv2i = sv[1];
    let sv2 = this.graph.vertices[sv2i];
    let nv1sv1d = pow(nv1.x - sv1.x, 2) + pow(nv1.y - sv1.y, 2) + (this.dim === '2d' ? 0 : pow(nv1.z - sv1.z, 2));
    let nv1sv2d = pow(nv1.x - sv2.x, 2) + pow(nv1.y - sv2.y, 2) + (this.dim === '2d' ? 0 : pow(nv1.z - sv2.z, 2));
    let nv2sv1d = pow(nv2.x - sv1.x, 2) + pow(nv2.y - sv1.y, 2) + (this.dim === '2d' ? 0 : pow(nv2.z - sv1.z, 2));
    let nv2sv2d = pow(nv2.x - sv2.x, 2) + pow(nv2.y - sv2.y, 2) + (this.dim === '2d' ? 0 : pow(nv2.z - sv2.z, 2));
    if (nv1sv1d + nv2sv2d < nv1sv2d + nv2sv1d) {
      this.graph.addEdge(nv1i, sv1i);
      this.graph.addEdge(nv2i, sv2i);
    } else {
      this.graph.addEdge(nv1i, sv2i);
      this.graph.addEdge(nv2i, sv1i);
    }
  } else if (sv.length !== 0) {
    // todo: check neighbor connection degrees, connect it and opposite to both
    sv = lume.shuffle(sv);
    this.graph.addEdge(nv1i, sv[0]);
    this.graph.addEdge(nv2i, sv[0]);
    this.graph.addEdge(nv1i, sv[1]);
    this.graph.addEdge(nv2i, sv[1]);
    for (let i=2; i < sv.length; i++) {
      let sv1i = sv[i];
      let sv1 = this.graph.vertices[sv1i];
      let nv1sv1d = pow(nv1.x - sv1.x, 2) + pow(nv1.y - sv1.y, 2) + (this.dim === '2d' ? 0 : pow(nv1.z - sv1.z, 2));
      let nv2sv1d = pow(nv2.x - sv1.x, 2) + pow(nv2.y - sv1.y, 2) + (this.dim === '2d' ? 0 : pow(nv2.z - sv1.z, 2));
      if (nv1sv1d < nv2sv1d) {
        this.graph.addEdge(nv1i, sv1i);
      } else {
        this.graph.addEdge(nv2i, sv1i);
      }
    }
  }
}

Sim.prototype.embedStep = function() {
  let velocities = {};
  let pdist = 100;
  let totalvx = 0, totalvy = 0; totalvz = 0; totalvn = 0;
  for (let vi in this.graph.vertices) {
    let v = this.graph.vertices[vi];
    let vxe = 0, vye = 0, vze = 0, ven = 0;
    let vxu = 0, vyu = 0, vzu = 0, vun = 0;
    for (let v2i in this.graph.edges[vi] || {}) {
      // edge length force
      let v2 = this.graph.vertices[v2i]
      let vecx = v2.x - v.x;
      let vecy = v2.y - v.y;
      let vecz = self.dim === '2d' ? 0 : v2.z - v.z;
      let v2dist = sqrt(pow(vecx, 2) + pow(vecy, 2) + pow(vecz, 2));
      if (v2dist === 0) { v2dist = 0.1; }
      vecx /= v2dist;
      vecy /= v2dist;
      vecz /= v2dist;
      vxe += vecx*(v2dist - pdist);
      vye += vecy*(v2dist - pdist);
      vze += vecz*(v2dist - pdist);
      ven += 1;

      // unfolding force
      for (let v3i in this.graph.edges[v2i] || {}) {
        if (v3i !== vi) {
          let v3 = this.graph.vertices[v3i];
          let v3vecx = v3.x - v.x;
          let v3vecy = v3.y - v.y;
          let v3vecz = this.dim === '2d' ? 0 : v3.z - v.z;
          let v3dist = sqrt(pow(v3vecx, 2) + pow(v3vecy, 2) + pow(v3vecz, 2));
          if (v3dist === 0) { v3dist = 0.1; }
          v3vecx /= v3dist;
          v3vecy /= v3dist;
          v3vecz /= v3dist;
          vxu += v3vecx*(v3dist - 2*pdist);
          vyu += v3vecy*(v3dist - 2*pdist);
          vzu += v3vecz*(v3dist - 2*pdist);
          vun += 1;
        }
      }
    }
    if (ven === 0) { ven = 1; }
    if (vun === 0) { vun = 1; }
    let vx = (vxe/ven + vxu/vun)/2;
    let vy = (vye/ven + vyu/vun)/2;
    let vz = this.dim === '2d' ? 0 : (vze/ven + vzu/vun)/2;
    velocities[vi] = {vx: vx, vy: vy, vz: vz};
    totalvx += vx;
    totalvy += vy;
    totalvz += vz;
    totalvn += 1;
  }
  if (totalvn === 0) { totalvn = 1; }
  let meanvx = totalvx/totalvn;
  let meanvy = totalvy/totalvn;
  let meanvz = totalvz/totalvn;
  for (let vi in this.graph.vertices) {
    let v = this.graph.vertices[vi];
    v.x += (velocities[vi].vx - meanvx)*0.9;
    v.y += (velocities[vi].vy - meanvy)*0.9;
    v.z += (velocities[vi].vz - meanvz)*0.9;
  }
}