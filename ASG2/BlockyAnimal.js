// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform float u_Size;
void main() {
  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
}`;


// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  gl_FragColor = u_FragColor;
}`;

//global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAnglex = 0;
let g_globalAngley = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_bodyAngle = 0;
let g_topLegAngle = 0;
let g_bottomLegAngle = 0;
let g_shake = 0;
let g_lean = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_bodyAnimation = false;
let g_topLegAnimation = false;
let g_walkAnimation = true;
let g_excAnimation = false;


function addActionsForHtmlUI() {
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation = true};
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation = false};

  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation = true};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation = false};

  document.getElementById('walkAnimationOnButton').onclick = function() {g_excAnimation = false; g_walkAnimation = true; g_magentaAnimation = true; g_yellowAnimation = true; g_bodyAnimation = true; g_topLegAnimation = true;};
  document.getElementById('walkAnimationOffButton').onclick = function() {g_walkAnimation = false; g_magentaAnimation = false; g_yellowAnimation = false; g_bodyAnimation = false; g_topLegAnimation = false;};

  document.getElementById('excAnimationOnButton').onclick = function() {g_walkAnimation = false; g_excAnimation = true; g_magentaAnimation = true; g_yellowAnimation = true; g_bodyAnimation = true; g_topLegAnimation = true;};
  document.getElementById('excAnimationOffButton').onclick = function() {g_excAnimation = false; g_magentaAnimation = false; g_yellowAnimation = false; g_bodyAnimation = false; g_topLegAnimation = false;};

  document.getElementById('neckSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});

  //document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
}
function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI()

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.7, 0.93, 1.0, 1.0);


  requestAnimationFrame(tick);
}


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  if(g_walkAnimation) {
    updateAnimationAngles();
    renderAllShapes();
  } else if(g_excAnimation) {
    updateAnimationAngles2();
    renderAllShapes2();
  }

  requestAnimationFrame(tick);
}
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];


var g_shapesList = [];
function click(ev) { 

  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if(g_selectedType==POINT) {
    point = new Point();
  } else if(g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_segments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  //console.log(x);
  g_globalAnglex = -x*360;
  g_globalAngley = -y*360;  
  //renderAllShapes();
  if(ev.shiftKey) {
    g_walkAnimation = false;
    g_excAnimation = true;
    g_yellowAnimation = true;
    g_magentaAnimation = true;
    g_bodyAnimation = true;
    g_topLegAnimation = true;
    updateAnimationAngles2();
    renderAllShapes2();
    //console.log("HELLOO");
  } else {
    g_walkAnimation = true;
    g_excAnimation = false;
    _yellowAnimation = true;
    g_magentaAnimation = true;
    g_bodyAnimation = true;
    g_topLegAnimation = true;

    updateAnimationAngles2();
    renderAllShapes2();
  }

  
  if(g_walkAnimation) {
    updateAnimationAngles();
    renderAllShapes();
  } else if(g_excAnimation) {
    updateAnimationAngles2();
    renderAllShapes2();
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}


function updateAnimationAngles() {
  if(g_yellowAnimation) {
    g_yellowAngle = 5*Math.sin(3*g_seconds);
  }

  if(g_magentaAnimation) {
    g_magentaAngle = 4*Math.sin(3*g_seconds);
  }
  if(g_bodyAnimation) {
    g_bodyAngle = 3*Math.sin(3*g_seconds);
  }
  if(g_topLegAnimation) {
    g_topLegAngle = 6*Math.sin(3*g_seconds);
    g_bottomLegAngle = -6*Math.sin(3*g_seconds);
  }
}

function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //BODY
  var body = new Cube();
  body.color = [1, 0.6, 0.6, 1.0];
  var bodyCoord = new Matrix4(body.matrix);
  body.matrix.rotate(g_bodyAngle,0,0);
  body.matrix.translate(-.3, -.45, -0.02);
  body.matrix.scale(0.5, .5, 0.8);
  body.render();

  //NECK
  var yellow = new Cube();
  yellow.color = [1, 0.55, 0.55, 1.0];
  yellow.matrix.setTranslate(0,-.6,0);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate(g_yellowAngle,0,0,1);
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, 0.8, 0.3);
  yellow.matrix.translate(-0.7,0.55,0);
  yellow.render();

  //HEAD
  var magenta = new Cube();
  magenta.color = [1, 0.7, 0.7, 1.0];
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(-0.06, 0.9, 0);
  magenta.matrix.rotate(g_magentaAngle,0,0,1);
  magenta.matrix.scale(0.4,0.4,0.4);
  magenta.matrix.translate(-.5,0,-0.1);
  magenta.render();

  //LEG1
  var leg1 = new Cube();
  leg1.color = [1, 0.7, 0.8, 1.0];
  leg1.matrix = bodyCoord;
  leg1.matrix.translate(-.25, -.45, 0.0);
  leg1.matrix.scale(0.4, .4, 0.7);
  leg1.matrix.translate(0, 0.2, -0.001);
  leg1.matrix.scale(0.25,-0.7,0.15);
  leg1.matrix.rotate(g_topLegAngle,1,0,0);
  leg1.render();
  leg1.matrix.rotate(-g_topLegAngle,1,0,0);

  //LEG1 PART2
  var leg1_2 = new Cube();
  leg1_2.color = [1, 0.7, 0.8, 1.0];
  leg1_2.matrix = bodyCoord;
  leg1_2.matrix.translate(0, 0.7, 0.001);
  leg1_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg1_2.render();
  leg1_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg1_2.matrix.translate(0, 0.3, 0.001);

  //LEG2
  var leg2 = new Cube();
  leg2.color = [1, 0.7, 0.8, 1.0];
  leg2.matrix = bodyCoord;
  leg2.matrix.translate(3, -1, 0.001);
  leg2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg2.render();
  leg2.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG2 PART2
  var leg2_2 = new Cube();
  leg2_2.color = [1, 0.7, 0.8, 1.0];
  leg2_2.matrix = bodyCoord;
  leg2_2.matrix.translate(0, 0.7, 0.001);
  leg2_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg2_2.render();
  leg2_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg2_2.matrix.translate(0, 0.3, -0.001);

  //LEG3
  var leg3 = new Cube();
  leg3.color = [1, 0.7, 0.8, 1.0];
  leg3.matrix = bodyCoord;
  leg3.matrix.translate(-0.0, -1, 5.7);
  leg3.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3.render();
  leg3.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG3 PART2
  var leg3_2 = new Cube();
  leg3_2.color = [1, 0.7, 0.8, 1.0];
  leg3_2.matrix = bodyCoord;
  leg3_2.matrix.translate(0, 0.7, 0.001);
  leg3_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg3_2.render();
  leg3_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3_2.matrix.translate(0, 0.3, 0.001);

  //LEG4
  var leg4 = new Cube();
  leg4.color = [1, 0.7, 0.8, 1.0];
  leg4.matrix = bodyCoord;
  leg4.matrix.translate(-3, -1, 0);
  leg4.matrix.rotate(g_topLegAngle,1,0,0);
  leg4.render();
  leg4.matrix.rotate(-g_topLegAngle,1,0,0);

  //LEG4 PART2
  var leg4_2 = new Cube();
  leg4_2.color = [1, 0.7, 0.8, 1.0];
  leg4_2.matrix = bodyCoord;
  leg4_2.matrix.translate(0, 0.7, 0.001);
  leg4_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg4_2.render();
  leg4_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg4_2.matrix.translate(0, 0.3, 0.001);

  //TAIL
  var tail = new Cube();
  tail.color = [1,1,1, 1.0];
  tail.matrix.scale(0.1, 0.1, 0.1);
  tail.matrix.translate(-2, -2.3, 7);
  tail.matrix.translate(1,1,0);
  tail.render();

  //EYE1
  var eye1 = new Cube();
  eye1.matrix = magenta.matrix;
  eye1.color = [0,0,0,1];
  eye1.matrix.scale(0.2, 0.2, 0.2);
  eye1.matrix.translate(3.3,2.5,-0.3);
  eye1.render();

  //EYE2
  var eye2 = new Cube();
  eye2.matrix = magenta.matrix;
  eye2.color = [0,0,0,1];
  eye2.matrix.translate(-2.8,-0.03,0);
  eye2.render();

  //INNER EYE1
  var ineye1 = new Cube();
  ineye1.matrix = eye1.matrix;
  ineye1.color = [1,1,1,1];
  ineye1.matrix.scale(0.5, 0.5, 0.5);
  ineye1.matrix.translate(0.63,0.65,-0.3);
  ineye1.render();

  //INNER EYE2
  var ineye2 = new Cube();
  ineye2.matrix = eye2.matrix;
  ineye2.color = [1,1,1,1];
  ineye2.matrix.translate(5.5,0,-0.3);
  ineye2.render();

  //EAR1
  var ear1 = new Cube();
  ear1.matrix = magenta.matrix;
  ear1.color = [1, 0.55, 0.55, 1.0];
  eye2.matrix.scale(1.3, 1.3, 1.3);
  ear1.matrix.translate(-6,-0.03,5);
  ear1.render();

  //EAR2
  var ear2 = new Cube();
  ear2.matrix = magenta.matrix;
  ear2.color = [1, 0.55, 0.55, 1.0];
  ear2.matrix.translate(7.65,0,0);
  ear2.render();

  //NOSE
  var mouth = new Cube();
  mouth.matrix = magenta.matrix;
  mouth.color = [1, 0.55, 0.55, 1.0];
  mouth.matrix.translate(-3.8,-2,-5);
  mouth.render();

  //grass
  var grass = new Cube();
  grass.color = [0.141, 0.56, 0.141, 1];
  grass.matrix.translate(-1.2, -2.35, -0.2);
  grass.matrix.scale(2.2, 1.5, 1.5);
  grass.render();

  var duration = performance.now() - startTime;
}

function updateAnimationAngles2() {
  if(g_yellowAnimation) {
    g_yellowAngle = 5*Math.sin(5*g_seconds);
  }

  if(g_magentaAnimation) {
    g_magentaAngle = 4*Math.sin(5*g_seconds);
  }
  if(g_bodyAnimation) {
    g_bodyAngle = 3*Math.sin(5*g_seconds);
  }
  if(g_topLegAnimation) {
    g_topLegAngle = 6*Math.sin(5*g_seconds);
    g_bottomLegAngle = -6*Math.sin(5*g_seconds);
  }
  g_shake = 50*Math.sin(5*g_seconds);
  g_lean = -0.15*Math.sin(g_seconds);
}

function renderAllShapes2() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //BODY
  var body = new Cube();
  body.color = [1, 0.6, 0.6, 1.0];
  var bodyCoord = new Matrix4(body.matrix);
  body.matrix.rotate(g_bodyAngle,0,g_shake, 1);
  body.matrix.translate(-.3, g_lean-0.55, -0.02);
  //body.matrix.rotate(0, g_lean, 0, 1);
  body.matrix.scale(0.5, .5, 0.8);
  body.render();

  //NECK
  var yellow = new Cube();
  yellow.color = [1, 0.55, 0.55, 1.0];
  yellow.matrix.setTranslate(0,g_lean-0.55,0);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate(g_yellowAngle,0,0,1);
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, 0.8, 0.3);
  yellow.matrix.translate(-0.7,0.55,0);
  yellow.render();

  //HEAD
  var magenta = new Cube();
  magenta.color = [1, 0.7, 0.7, 1.0];
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(-0.06, 0.9, 0);
  magenta.matrix.rotate(g_magentaAngle,0,0,1);
  magenta.matrix.scale(0.4,0.4,0.4);
  magenta.matrix.translate(-.5,0,-0.1);
  magenta.render();

  //LEG1
  var leg1 = new Cube();
  leg1.color = [1, 0.7, 0.8, 1.0];
  leg1.matrix = bodyCoord;
  leg1.matrix.translate(-.25, -.45, 0.0);
  leg1.matrix.scale(0.4, .4, 0.7);
  leg1.matrix.translate(0, 0.2, -0.001);
  leg1.matrix.scale(0.25,-0.7,0.15);
  leg1.matrix.rotate(g_topLegAngle,1,0,0);
  leg1.render();
  leg1.matrix.rotate(-g_topLegAngle,1,0,0);

  //LEG1 PART2
  var leg1_2 = new Cube();
  leg1_2.color = [1, 0.7, 0.8, 1.0];
  leg1_2.matrix = bodyCoord;
  leg1_2.matrix.translate(0, 0.7, 0.001);
  leg1_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg1_2.render();
  leg1_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg1_2.matrix.translate(0, 0.3, 0.001);

  //LEG2
  var leg2 = new Cube();
  leg2.color = [1, 0.7, 0.8, 1.0];
  leg2.matrix = bodyCoord;
  leg2.matrix.translate(3, -1, 0.001);
  leg2.matrix.rotate(g_topLegAngle,1,0,0);
  leg2.render();
  leg2.matrix.rotate(-g_topLegAngle,1,0,0);

  //LEG2 PART2
  var leg2_2 = new Cube();
  leg2_2.color = [1, 0.7, 0.8, 1.0];
  leg2_2.matrix = bodyCoord;
  leg2_2.matrix.translate(0, 0.7, 0.001);
  leg2_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg2_2.render();
  leg2_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg2_2.matrix.translate(0, 0.3, -0.001);

  //LEG3
  var leg3 = new Cube();
  leg3.color = [1, 0.7, 0.8, 1.0];
  leg3.matrix = bodyCoord;
  leg3.matrix.translate(-0.0, -1, 5.7);
  leg3.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3.render();
  leg3.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG3 PART2
  var leg3_2 = new Cube();
  leg3_2.color = [1, 0.7, 0.8, 1.0];
  leg3_2.matrix = bodyCoord;
  leg3_2.matrix.translate(0, 0.7, 0.001);
  leg3_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg3_2.render();
  leg3_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3_2.matrix.translate(0, 0.3, 0.001);

  //LEG4
  var leg4 = new Cube();
  leg4.color = [1, 0.7, 0.8, 1.0];
  leg4.matrix = bodyCoord;
  leg4.matrix.translate(-3, -1, 0);
  leg4.matrix.rotate(-g_topLegAngle,1,0,0);
  leg4.render();
  leg4.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG4 PART2
  var leg4_2 = new Cube();
  leg4_2.color = [1, 0.7, 0.8, 1.0];
  leg4_2.matrix = bodyCoord;
  leg4_2.matrix.translate(0, 0.7, 0.001);
  leg4_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg4_2.render();
  leg4_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg4_2.matrix.translate(0, 0.3, 0.001);

  //TAIL
  var tail = new Cube();
  tail.matrix = body.matrix;
  tail.color = [1,1,1, 1.0];
  tail.matrix.scale(0.2, 0.2, 0.2);
  tail.matrix.translate(2, 2.5, 4.5);
  tail.matrix.translate(1,1,0);
  tail.render();

  //EYE1
  var eye1 = new Cube();
  eye1.matrix = magenta.matrix;
  eye1.color = [0,0,0,1];
  eye1.matrix.scale(0.2, 0.2, 0.2);
  eye1.matrix.translate(3.3,2.5,-0.3);
  eye1.render();

  //EYE2
  var eye2 = new Cube();
  eye2.matrix = magenta.matrix;
  eye2.color = [0,0,0,1];
  eye2.matrix.translate(-2.8,-0.03,0);
  eye2.render();

  //INNER EYE1
  var ineye1 = new Cube();
  ineye1.matrix = eye1.matrix;
  ineye1.color = [1,1,1,1];
  ineye1.matrix.scale(0.5, 0.5, 0.5);
  ineye1.matrix.translate(0.63,0.65,-0.3);
  ineye1.render();

  //INNER EYE2
  var ineye2 = new Cube();
  ineye2.matrix = eye2.matrix;
  ineye2.color = [1,1,1,1];
  ineye2.matrix.translate(5.5,0,-0.3);
  ineye2.render();

  //EAR1
  var ear1 = new Cube();
  ear1.matrix = magenta.matrix;
  ear1.color = [1, 0.55, 0.55, 1.0];
  eye2.matrix.scale(1.3, 1.3, 1.3);
  ear1.matrix.translate(-6,-0.03,5);
  ear1.render();

  //EAR2
  var ear2 = new Cube();
  ear2.matrix = magenta.matrix;
  ear2.color = [1, 0.55, 0.55, 1.0];
  ear2.matrix.translate(7.65,0,0);
  ear2.render();

  //NOSE
  var mouth = new Cube();
  mouth.matrix = magenta.matrix;
  mouth.color = [1, 0.55, 0.55, 1.0];
  mouth.matrix.translate(-3.8,-2,-5);
  mouth.render();

  //grass
  var grass = new Cube();
  grass.color = [0.141, 0.56, 0.141, 1];
  grass.matrix.translate(-1.2, -2.35, -0.2);
  grass.matrix.scale(2.2, 1.5, 1.5);
  grass.render();

  var duration = performance.now() - startTime;
}
