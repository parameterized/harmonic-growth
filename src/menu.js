
var menu = {};

menu.load = function() {
  menu.w = 300;
  menu.open = false;
  menu.openX = ssx - menu.w;
  menu.closedX = ssx;
  menu.x = menu.closedX;
  menu.timer = 0;

  menu.text = [];
  menu.toggles = [];

  menu.addText({text: 'Menu', y: 60, textSize: 48});
  menu.addText({text: 'Modes', y: 150, textSize: 24});

  menu.dimToggle = menu.addToggle({x: 150 - 60, y: 200, imgA: gfx.dim2, imgB: gfx.dim3, action: function(v) {
    let dim = v === 1 ? '3d' : '2d';
    if (dim === '2d') {
      for (let i in graph.vertices) {
        let vert = graph.vertices[i];
        vert.z = random(-0.1, 0.1);
      }
    }
    sim = new Sim({graph: graph, dim: dim});
  }});
  menu.editToggle = menu.addToggle({x: 150 + 60, y: 200, imgA: gfx.play, imgB: gfx.edit, action: function(v) {
    if (v === 0) {
      baseGraph = graph.clone();
      doGraphStep = true;
    } else if (v === 1) {
      doGraphStep = false;
    }
    loadGraph();
  }});
}

menu.addText = function(t) {
  t = orDefault(t, {});
  t.text = orDefault(t.text, 'Text');
  t.x = orDefault(t.x, 150);
  t.y = orDefault(t.y, ssy/2);
  t.textSize = orDefault(t.textSize, 24);
  menu.text.push(t);
  return t;
}

menu.addToggle = function(t) {
  t = orDefault(t, {});
  t.x = orDefault(t.x, 150);
  t.y = orDefault(t.y, ssy/2);
  t.imgA = orDefault(t.imgA, gfx.play);
  t.imgB = orDefault(t.imgB, gfx.edit);
  t.selected = 0;
  t.timer = 0;
  menu.toggles.push(t);
  return t;
}

menu.update = function(dt) {
  if (menu.open) {
    menu.timer = constrain(menu.timer + 3*dt, 0, 1);
  } else {
    menu.timer = constrain(menu.timer - 3*dt, 0, 1);
  }
  let t = ease.inOutCubic(menu.timer);
  menu.x = lerp(menu.closedX, menu.openX, t);

  for (let i in menu.toggles) {
    let v = menu.toggles[i];
    if (v.selected === 1) {
      v.timer = constrain(v.timer + 5*dt, 0, 1);
    } else if (v.selected === 0) {
      v.timer = constrain(v.timer - 5*dt, 0, 1);
    }
  }
}

menu.keyPressed = function() {
  if (keyCode === 9) { // tab
    menu.open = !menu.open;
  }
}

menu.mousePressed = function() {
  let x = mouseX, y = mouseY;
  x -= menu.x;
  for (let i in menu.toggles) {
    let v = menu.toggles[i];
    if (y > v.y - 25 && y < v.y + 25) {
      if (x > v.x - 50 && x <= v.x && v.selected !== 0) {
        v.selected = 0;
        if (v.action) { v.action(v.selected); }
      } else if (x > v.x && x < v.x + 50 && v.selected !== 1) {
        v.selected = 1;
        if (v.action) { v.action(v.selected); }
      }
    }
  }
}

menu.draw = function() {
  push();
  translate(round(menu.x), 0);

  noStroke();
  fill(255, 200);
  rect(0, 0, menu.w, ssy);

  for (let i in menu.toggles) {
    let v = menu.toggles[i];
    image(gfx.toggleBG, round(v.x - 50), round(v.y - 25));
    let t = ease.inOutCubic(v.timer);
    image(gfx.toggleSelector, round(v.x - 50 + t*50), round(v.y - 25));
    image(v.imgA, round(v.x - 50), round(v.y - 25));
    image(v.imgB, round(v.x), round(v.y - 25));
  }

  fill(50);
  textAlign(CENTER, CENTER);
  for (let i in menu.text) {
    let v = menu.text[i];
    textSize(v.textSize);
    text(v.text, round(v.x), round(v.y));
  }

  pop();
}