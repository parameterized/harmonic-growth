
function Cam(t) {
  t = orDefault(t, {});
  this.x = orDefault(t.x, 0);
  this.y = orDefault(t.y, 0);
  this.scale = orDefault(t.scale, 1);
  this.rotation = orDefault(t.rotation, 0);
  this.ssx = orDefault(t.ssx, orDefault(ssx, 800));
  this.ssy = orDefault(t.ssy, orDefault(ssy, 600));
}

Cam.prototype.set = function() {
  push();
  translate(round(this.ssx/2), round(this.ssy/2));
  scale(this.scale);
  rotate(this.rotation);
  translate(-this.x, -this.y);
}

Cam.prototype.reset = function() {
  pop();
}

let rot2d = function(x, y, a) {
  let s = sin(a);
  let c = cos(a);
  let x2 = x*c + y*s;
  let y2 = y*c - x*s;
  return [x2, y2];
}

Cam.prototype.screen2world = function(x, y) {
  x -= round(this.ssx/2);
  y -= round(this.ssy/2);
  x /= this.scale;
  y /= this.scale;
  [x, y] = rot2d(x, y, this.rotation);
  x += this.x;
  y += this.y;
  return [x, y];
}