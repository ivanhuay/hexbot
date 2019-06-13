function Brush() {
  this.colors = [];
  this.canvas = null;
  this.ctx = null;
  this.appWidth = null;
  this.appHeight = null;
  this.backgroundColor = '#f1f1f1';
  this.speed = 300;
  this.appWidth = window.innerWidth;
  this.appHeight = window.innerHeight;
  var self = this;
  this.getColors()
    .then(function() {
      self.setup();
      self.init();
    });
}

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
Brush.prototype.getColors = function() {
  const API_BASE = 'https://api.noopschallenge.com';
  var self = this;
  return fetch(`${API_BASE}/hexbot?count=1000&width=${this.appWidth}&height=${this.appHeight}&seed=FF7F50,FFD700,FF8C00,AA00FF`)
  // return fetch(`${API_BASE}/hexbot?count=1000&width=${this.appWidth}&height=${this.appHeight}`)
    .then(function(resp) {
      return resp.json();
    })
    .then(function(resp) {
      self.colors = resp.colors;
    });
}

Brush.prototype.setup = function() {
  this.canvas = document.getElementById('canvas');
  this.canvas.height = this.appHeight;
  this.canvas.width = this.appWidth;
  this.ctx = this.canvas.getContext('2d');
  this.ctx.fillStyle = this.backgroundColor;
  this.ctx.fillRect(0, 0, this.appWidth, this.appHeight);
}

Brush.prototype.newBrush = function() {
  var points = this.colors.splice(-2);
  var start = points[1];
  var end = points[0];
  if(Math.random()>0.7){
    this.colors.push(end)
  }else if(Math.random()<0.3){
    this.colors.push(start)
  }
  this.drawLine(start,end);
}
Brush.prototype.drawLine = function(start, end) {
  var steps = Math.abs(start.coordinates.x - end.coordinates.x);
  var points = [];
  var xSum = -(start.coordinates.x - end.coordinates.x) / Math.abs(start.coordinates.x - end.coordinates.x)
  var ySum = -(start.coordinates.y - end.coordinates.y) / steps
  var startColor = hexToRgb(start.value);
  var endColor = hexToRgb(end.value);
  var stepR = Math.round((endColor.r - startColor.r) / steps);
  var stepG = Math.round((endColor.g - startColor.g) / steps);
  var stepB = Math.round((endColor.b - startColor.b) / steps);
  this.drawPoint(start,1);
  var stepSize = 7/steps;
  for (var i = 1; i < steps +1; i++) {
    points[i] = JSON.parse(JSON.stringify(start));
    points[i].coordinates.x += xSum * i;
    points[i].coordinates.y += ySum * i;
    var color = hexToRgb(points[i].value);
    color.r += stepR * i;
    color.g += stepG * i;
    color.b += stepB * i;
    points[i].value = rgbToHex(color.r,color.g,color.b);
    this.drawPoint(points[i],1+stepSize*i);
  }
  this.drawPoint(end);
}
Brush.prototype.drawPoint = function(point, size) {
  this.ctx.fillStyle = point.value;
  let pointSize = size || 8;
  this.ctx.globalAlpha = 0.3;//Math.random();
  this.ctx.beginPath();
  this.ctx.arc(point.coordinates.x, point.coordinates.y, pointSize, 0, Math.PI * 2, true);
  this.ctx.fill();
}

Brush.prototype.init = function() {
  var self = this;
  this.ticker = setInterval(this.newBrush.bind(this), this.speed);
  this.newBrush();
}
window.onload = function() {
  new Brush();
}
