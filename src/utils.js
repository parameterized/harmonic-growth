
function orDefault(x, d) {
  if (typeof(x) === 'undefined' || x === null) {
    return d;
  } else {
    return x;
  }
}

var ease = {
  inQuad: function (t) { return t*t },
  outQuad: function (t) { return t*(2-t) },
  inOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  inCubic: function (t) { return t*t*t },
  outCubic: function (t) { return (--t)*t*t+1 },
  inOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  inQuart: function (t) { return t*t*t*t },
  outQuart: function (t) { return 1-(--t)*t*t*t },
  inOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  inQuint: function (t) { return t*t*t*t*t },
  outQuint: function (t) { return 1+(--t)*t*t*t*t },
  inOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

var lume = {
  randomchoice: function(t) {
    return t[floor(random(t.length))];
  },
  shuffle: function(t) {
    let rtn = [];
    for (let i=1; i <= t.length; i++) {
      let r = floor(random(i)) + 1;
      if (r !== i) {
        rtn[i-1] = rtn[r-1];
      }
      rtn[r-1] = t[i-1];
    }
    return rtn;
  },
  clone: function(t) {
    let rtn = {};
    for (k in t) {
      rtn[k] = t[k];
    }
    return rtn;
  }
};