// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform float u_Size;
attribute vec3 a_Normal;
varying vec3 v_Normal;
varying vec4 v_VertPos;
void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  v_Normal = a_Normal;
  v_VertPos = u_ModelMatrix * a_Position;
}`;



// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform bool u_lightOn;
varying vec4 v_VertPos;
void main() {
  if(u_whichTexture == -5) {
    gl_FragColor = vec4((v_Normal+1.0) / 2.0, 1.0);
  } else if(u_whichTexture == -4) {
    gl_FragColor = texture2D(u_Sampler2, v_UV);
  } else if(u_whichTexture == -3) {
    gl_FragColor = texture2D(u_Sampler1, v_UV);
  } else if(u_whichTexture == -2) {
    gl_FragColor = u_FragColor;
  } else if(u_whichTexture == -1) {
    gl_FragColor = vec4(v_UV, 1.0, 1.0);
  } else if(u_whichTexture == 0) {
    gl_FragColor = texture2D(u_Sampler0, v_UV);
  } else {
    gl_FragColor = vec4(2,2,0,1);
  }

  vec3 lightVector = u_lightPos - vec3(v_VertPos);
  float r = length(lightVector);
  /* if(r < 1.0) {
    gl_FragColor = vec4(1,0,0,1);
  } else if(r < 2.0) {
    gl_FragColor = vec4(0,1,0,1);
  } */
  //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);

  vec3 L = normalize(lightVector);
  vec3 N = normalize(v_Normal);
  float nDotL = max(dot(N, L), 0.0);

  //reflection
  vec3 R = reflect(-L, N);

  //eye
  vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

  //specular
  float specular = pow(max(dot(E, R), 0.0), 10.0);

  vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
  vec3 ambient = vec3(gl_FragColor) * 0.3;
  if(u_lightOn) {
    if(u_whichTexture == 0) {
      gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
    } else {
      gl_FragColor = vec4(diffuse+ambient, 1.0);
    }
  }
  //gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
}`;

//global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
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

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
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
let g_globalAnglex = 55;
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
let g_camera = new Camera();
let g_normalOn=false;
let g_lightPos = [0,1,-2];
let g_lightOn = true;


function addActionsForHtmlUI() {

  document.getElementById('normalOn').onclick = function() {g_normalOn = true};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false};

  document.getElementById('lightOn').onclick = function() {g_lightOn = true};
  document.getElementById('lightOff').onclick = function() {g_lightOn = false};

  /* document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation = true};
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation = false};

  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation = true};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation = false}; */

  document.getElementById('walkAnimationOnButton').onclick = function() {g_excAnimation = false; g_walkAnimation = true; g_magentaAnimation = true; g_yellowAnimation = true; g_bodyAnimation = true; g_topLegAnimation = true;};
  document.getElementById('walkAnimationOffButton').onclick = function() {g_walkAnimation = false; g_magentaAnimation = false; g_yellowAnimation = false; g_bodyAnimation = false; g_topLegAnimation = false;};

  /* document.getElementById('excAnimationOnButton').onclick = function() {g_walkAnimation = false; g_excAnimation = true; g_magentaAnimation = true; g_yellowAnimation = true; g_bodyAnimation = true; g_topLegAnimation = true;};
  document.getElementById('excAnimationOffButton').onclick = function() {g_excAnimation = false; g_magentaAnimation = false; g_yellowAnimation = false; g_bodyAnimation = false; g_topLegAnimation = false;};

  document.getElementById('neckSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();}); */

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
  
  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAnglex = this.value; renderAllShapes();});
}

function initTextures(gl, n) {
  var image = new Image();
  if(!image) {
    console.log('Failed to create the image object');
    return false;
  }
  image.onload = function(){sendImageToTEXTURE0(image);};
  image.src = 'sky.jpg';

  var image2 = new Image();
  if(!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  image2.onload = function(){sendImageToTEXTURE1(image2);};
  image2.src = 'grass.JPG';

  var image3 = new Image();
  if(!image3) {
    console.log('Failed to create the image object');
    return false;
  }
  image3.onload = function(){sendImageToTEXTURE2(image3);};
  image3.src = 'stone.JPG';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished load texture');
}

function sendImageToTEXTURE1(image) {
  var texture1 = gl.createTexture();
  if(!texture1) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished load2 texture');
}

function sendImageToTEXTURE2(image) {
  var texture2 = gl.createTexture();
  if(!texture2) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);
  console.log('finished load2 texture');
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  initTextures(gl, 0);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};

  document.onkeydown = keydown;

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
    g_yellowAnimation = true;
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

  g_lightPos[0] = 2.3* Math.cos(g_seconds);
}

function keydown(ev) {
  if(ev.keyCode == 39) {
    g_eye[0] += 0.2;
  } else if(ev.keyCode == 37) {
    g_eye[0] -= 0.2;
  } else if(ev.keyCode == 38) {
    g_eye[1] += 0.2;
  } else if(ev.keyCode == 40) {
    g_eye[1] -= 0.2;
  } else if(ev.keyCode == 87) { //w
    g_camera.forward();
  } else if(ev.keyCode == 83) { //s
    g_camera.back();
  } else if(ev.keyCode == 65) { //a
    g_camera.right();
  } else if(ev.keyCode == 68) {
    g_camera.left();
  } else if(ev.keyCode == 81) {
    g_camera.panLeft();
  } else if(ev.keyCode == 69) {
    g_camera.panRight();
  } else if(ev.keyCode == 84) { //t
    var m = new Cube();
    m.textureNum = -2;
    m.color = [1,1,1,1];
    //m.matrix.translate(0, -0.75, 0);
    m.matrix.scale(2.3, 2.3, 2.3);
    //m.matrix.translate(g_camera.at.elements[0], g_camera.at.elements[2], g_camera.at.elements[1]);
    m.render();
    //renderAllShapes();
    console.log("cube");
  }
  renderAllShapes();
}
var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

var g_map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
];

function drawMap() {
  for(x = 0; x < 8; x++) {
    for(y = 0; y < 8; y++) {
      if(g_map[x][y]==1) {
        for(z = 0; z < 3; z++) {
          var m = new Cube();
          m.textureNum = -4;
          m.color = [1,1,1,1];
          m.matrix.translate(0, -0.75, 0);
          m.matrix.scale(0.3, 0.3, 0.3);
          m.matrix.translate(x-16, z*1, y-16);
          m.render();
        }
      }
    }
  }
}


function drawSheep() {
  //BODY
  var body = new Cube();
  if(g_normalOn == true) {
    body.textureNum = -5
  } else {
    body.textureNum = -2;
  }
  body.color = [1, 0.6, 0.6, 1.0];
  var bodyCoord = new Matrix4(body.matrix);
  body.matrix.rotate(g_bodyAngle,0,0);
  body.matrix.translate(-.3, -.45, -0.02);
  body.matrix.scale(0.5, .5, 0.8);
  body.render();

  //NECK
  var yellow = new Cube();
  if(g_normalOn == true) {
    yellow.textureNum = -5
  } else {
    yellow.textureNum = -2;
  }
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
  if(g_normalOn == true) {
    magenta.textureNum = -5
  } else {
    magenta.textureNum = -2;
  }
  magenta.color = [1, 0.7, 0.7, 1.0];
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(-0.06, 0.9, 0);
  magenta.matrix.rotate(g_magentaAngle,0,0,1);
  magenta.matrix.scale(0.4,0.4,0.4);
  magenta.matrix.translate(-.5,0,-0.1);
  magenta.render();

  //LEG1
  var leg1 = new Cube();
  if(g_normalOn == true) {
    leg1.textureNum = -5
  } else {
    leg1.textureNum = -2;
  }
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
  if(g_normalOn == true) {
    leg1_2.textureNum = -5
  } else {
    leg1_2.textureNum = -2;
  }
  leg1_2.color = [1, 0.7, 0.8, 1.0];
  leg1_2.matrix = bodyCoord;
  leg1_2.matrix.translate(0, 0.7, 0.001);
  leg1_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg1_2.render();
  leg1_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg1_2.matrix.translate(0, 0.3, 0.001);

  //LEG2
  var leg2 = new Cube();
  if(g_normalOn == true) {
    leg2.textureNum = -5
  } else {
    leg2.textureNum = -2;
  }
  leg2.color = [1, 0.7, 0.8, 1.0];
  leg2.matrix = bodyCoord;
  leg2.matrix.translate(3, -1, 0.001);
  leg2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg2.render();
  leg2.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG2 PART2
  var leg2_2 = new Cube();
  if(g_normalOn == true) {
    leg2_2.textureNum = -5
  } else {
    leg2_2.textureNum = -2;
  }
  leg2_2.color = [1, 0.7, 0.8, 1.0];
  leg2_2.matrix = bodyCoord;
  leg2_2.matrix.translate(0, 0.7, 0.001);
  leg2_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg2_2.render();
  leg2_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg2_2.matrix.translate(0, 0.3, -0.001);

  //LEG3
  var leg3 = new Cube();
  if(g_normalOn == true) {
    leg3.textureNum = -5
  } else {
    leg3.textureNum = -2;
  }
  leg3.color = [1, 0.7, 0.8, 1.0];
  leg3.matrix = bodyCoord;
  leg3.matrix.translate(-0.0, -1, 5.7);
  leg3.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3.render();
  leg3.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG3 PART2
  var leg3_2 = new Cube();
  if(g_normalOn == true) {
    leg3_2.textureNum = -5
  } else {
    leg3_2.textureNum = -2;
  }
  leg3_2.color = [1, 0.7, 0.8, 1.0];
  leg3_2.matrix = bodyCoord;
  leg3_2.matrix.translate(0, 0.7, 0.001);
  leg3_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg3_2.render();
  leg3_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3_2.matrix.translate(0, 0.3, 0.001);

  //LEG4
  var leg4 = new Cube();
  if(g_normalOn == true) {
    leg4.textureNum = -5
  } else {
    leg4.textureNum = -2;
  }
  leg4.color = [1, 0.7, 0.8, 1.0];
  leg4.matrix = bodyCoord;
  leg4.matrix.translate(-3, -1, 0);
  leg4.matrix.rotate(g_topLegAngle,1,0,0);
  leg4.render();
  leg4.matrix.rotate(-g_topLegAngle,1,0,0);

  //LEG4 PART2
  var leg4_2 = new Cube();
  if(g_normalOn == true) {
    leg4_2.textureNum = -5
  } else {
    leg4_2.textureNum = -2;
  }
  leg4_2.color = [1, 0.7, 0.8, 1.0];
  leg4_2.matrix = bodyCoord;
  leg4_2.matrix.translate(0, 0.7, 0.001);
  leg4_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg4_2.render();
  leg4_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg4_2.matrix.translate(0, 0.3, 0.001);

  //TAIL
  var tail = new Cube();
  if(g_normalOn == true) {
    tail.textureNum = -5
  } else {
    tail.textureNum = -2;
  }
  tail.color = [1,1,1, 1.0];
  tail.matrix.scale(0.1, 0.1, 0.1);
  tail.matrix.translate(-2, -2.3, 7);
  tail.matrix.translate(1,1,0);
  tail.render();

  //EYE1
  var eye1 = new Cube();
  if(g_normalOn == true) {
    eye1.textureNum = -5
  } else {
    eye1.textureNum = -2;
  }
  eye1.matrix = magenta.matrix;
  eye1.color = [0,0,0,1];
  eye1.matrix.scale(0.2, 0.2, 0.2);
  eye1.matrix.translate(3.3,2.5,-0.3);
  eye1.render();

  //EYE2
  var eye2 = new Cube();
  if(g_normalOn == true) {
    eye2.textureNum = -5
  } else {
    eye2.textureNum = -2;
  }
  eye2.matrix = magenta.matrix;
  eye2.color = [0,0,0,1];
  eye2.matrix.translate(-2.8,-0.03,0);
  eye2.render();

  //INNER EYE1
  var ineye1 = new Cube();
  if(g_normalOn == true) {
    ineye1.textureNum = -5
  } else {
    ineye1.textureNum = -2;
  }
  ineye1.matrix = eye1.matrix;
  ineye1.color = [1,1,1,1];
  ineye1.matrix.scale(0.5, 0.5, 0.5);
  ineye1.matrix.translate(0.63,0.65,-0.3);
  ineye1.render();

  //INNER EYE2
  var ineye2 = new Cube();
  if(g_normalOn == true) {
    ineye2.textureNum = -5
  } else {
    ineye2.textureNum = -2;
  }
  ineye2.matrix = eye2.matrix;
  ineye2.color = [1,1,1,1];
  ineye2.matrix.translate(5.5,0,-0.3);
  ineye2.render();

  //EAR1
  var ear1 = new Cube();
  if(g_normalOn == true) {
    ear1.textureNum = -5
  } else {
    ear1.textureNum = -2;
  }
  ear1.matrix = magenta.matrix;
  ear1.color = [1, 0.55, 0.55, 1.0];
  eye2.matrix.scale(1.3, 1.3, 1.3);
  ear1.matrix.translate(-6,-0.03,5);
  ear1.render();

  //EAR2
  var ear2 = new Cube();
  if(g_normalOn == true) {
    ear2.textureNum = -5
  } else {
    ear2.textureNum = -2;
  }
  ear2.matrix = magenta.matrix;
  ear2.color = [1, 0.55, 0.55, 1.0];
  ear2.matrix.translate(7.65,0,0);
  ear2.render();

  //NOSE
  var mouth = new Cube();
  if(g_normalOn == true) {
    mouth.textureNum = -5
  } else {
    mouth.textureNum = -2;
  }
  mouth.matrix = magenta.matrix;
  mouth.color = [1, 0.55, 0.55, 1.0];
  mouth.matrix.translate(-3.8,-2,-5);
  mouth.render();
}

function renderAllShapes() {
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(g_camera.fov, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);

  //light
  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1, -.1, -.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  //ball
  var ball = new Sphere();
  if(g_normalOn == true) {
    ball.textureNum = -5;
  } else {
    ball.textureNum = -2;
  }
  ball.matrix.translate(-1, 0, 1.5);
  ball.render();

  //drawMap();
  var sky = new Cube();
  sky.color = [1,0,0,1];
  if(g_normalOn == true) {
    sky.textureNum = -5;
  } else {
    sky.textureNum = 0;
  }
  sky.matrix.scale(-5, -5, -5);
  sky.matrix.translate(-0.5, -0.7, -0.5);
  sky.render();


  drawSheep();

  //grass
  var grass = new Cube();
  grass.color = [0.141, 0.56, 0.141, 1];
  grass.textureNum = -3;
  grass.matrix.translate(0, -0.75, 0);
  grass.matrix.scale(10, 0, 10);
  grass.matrix.translate(-0.5, 0, -0.5);
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

function drawSheep2() {
  //BODY
  var body = new Cube();
  body.textureNum = -2;
  body.color = [1, 0.6, 0.6, 1.0];
  var bodyCoord = new Matrix4(body.matrix);
  body.matrix.rotate(g_bodyAngle,0,g_shake, 1);
  body.matrix.translate(-.3, g_lean-0.55, -0.02);
  //body.matrix.rotate(0, g_lean, 0, 1);
  body.matrix.scale(0.5, .5, 0.8);
  body.render();

  //NECK
  var yellow = new Cube();
  yellow.textureNum = -2;
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
  magenta.textureNum = -2;
  magenta.color = [1, 0.7, 0.7, 1.0];
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(-0.06, 0.9, 0);
  magenta.matrix.rotate(g_magentaAngle,0,0,1);
  magenta.matrix.scale(0.4,0.4,0.4);
  magenta.matrix.translate(-.5,0,-0.1);
  magenta.render();

  //LEG1
  var leg1 = new Cube();
  leg1.textureNum = -2;
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
  leg1_2.textureNum = -2;
  leg1_2.color = [1, 0.7, 0.8, 1.0];
  leg1_2.matrix = bodyCoord;
  leg1_2.matrix.translate(0, 0.7, 0.001);
  leg1_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg1_2.render();
  leg1_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg1_2.matrix.translate(0, 0.3, 0.001);

  //LEG2
  var leg2 = new Cube();
  leg2.textureNum = -2;
  leg2.color = [1, 0.7, 0.8, 1.0];
  leg2.matrix = bodyCoord;
  leg2.matrix.translate(3, -1, 0.001);
  leg2.matrix.rotate(g_topLegAngle,1,0,0);
  leg2.render();
  leg2.matrix.rotate(-g_topLegAngle,1,0,0);

  //LEG2 PART2
  var leg2_2 = new Cube();
  leg2_2.textureNum = -2;
  leg2_2.color = [1, 0.7, 0.8, 1.0];
  leg2_2.matrix = bodyCoord;
  leg2_2.matrix.translate(0, 0.7, 0.001);
  leg2_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg2_2.render();
  leg2_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg2_2.matrix.translate(0, 0.3, -0.001);

  //LEG3
  var leg3 = new Cube();
  leg3.textureNum = -2;
  leg3.color = [1, 0.7, 0.8, 1.0];
  leg3.matrix = bodyCoord;
  leg3.matrix.translate(-0.0, -1, 5.7);
  leg3.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3.render();
  leg3.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG3 PART2
  var leg3_2 = new Cube();
  leg3_2.textureNum = -2;
  leg3_2.color = [1, 0.7, 0.8, 1.0];
  leg3_2.matrix = bodyCoord;
  leg3_2.matrix.translate(0, 0.7, 0.001);
  leg3_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg3_2.render();
  leg3_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg3_2.matrix.translate(0, 0.3, 0.001);

  //LEG4
  var leg4 = new Cube();
  leg4.textureNum = -2;
  leg4.color = [1, 0.7, 0.8, 1.0];
  leg4.matrix = bodyCoord;
  leg4.matrix.translate(-3, -1, 0);
  leg4.matrix.rotate(-g_topLegAngle,1,0,0);
  leg4.render();
  leg4.matrix.rotate(g_topLegAngle,1,0,0);

  //LEG4 PART2
  var leg4_2 = new Cube();
  leg4_2.textureNum = -2;
  leg4_2.color = [1, 0.7, 0.8, 1.0];
  leg4_2.matrix = bodyCoord;
  leg4_2.matrix.translate(0, 0.7, 0.001);
  leg4_2.matrix.rotate(g_topLegAngle,1,0,0);
  leg4_2.render();
  leg4_2.matrix.rotate(-g_topLegAngle,1,0,0);
  leg4_2.matrix.translate(0, 0.3, 0.001);

  //TAIL
  var tail = new Cube();
  tail.textureNum = -2;
  tail.matrix = body.matrix;
  tail.color = [1,1,1, 1.0];
  tail.matrix.scale(0.2, 0.2, 0.2);
  tail.matrix.translate(2, 2.5, 4.5);
  tail.matrix.translate(1,1,0);
  tail.render();

  //EYE1
  var eye1 = new Cube();
  eye1.textureNum = -2;
  eye1.matrix = magenta.matrix;
  eye1.color = [0,0,0,1];
  eye1.matrix.scale(0.2, 0.2, 0.2);
  eye1.matrix.translate(3.3,2.5,-0.3);
  eye1.render();

  //EYE2
  var eye2 = new Cube();
  eye2.textureNum = -2;
  eye2.matrix = magenta.matrix;
  eye2.color = [0,0,0,1];
  eye2.matrix.translate(-2.8,-0.03,0);
  eye2.render();

  //INNER EYE1
  var ineye1 = new Cube();
  ineye1.textureNum = -2;
  ineye1.matrix = eye1.matrix;
  ineye1.color = [1,1,1,1];
  ineye1.matrix.scale(0.5, 0.5, 0.5);
  ineye1.matrix.translate(0.63,0.65,-0.3);
  ineye1.render();

  //INNER EYE2
  var ineye2 = new Cube();
  ineye2.textureNum = -2;
  ineye2.matrix = eye2.matrix;
  ineye2.color = [1,1,1,1];
  ineye2.matrix.translate(5.5,0,-0.3);
  ineye2.render();

  //EAR1
  var ear1 = new Cube();
  ear1.textureNum = -2;
  ear1.matrix = magenta.matrix;
  ear1.color = [1, 0.55, 0.55, 1.0];
  eye2.matrix.scale(1.3, 1.3, 1.3);
  ear1.matrix.translate(-6,-0.03,5);
  ear1.render();

  //EAR2
  var ear2 = new Cube();
  ear2.textureNum = -2;
  ear2.matrix = magenta.matrix;
  ear2.color = [1, 0.55, 0.55, 1.0];
  ear2.matrix.translate(7.65,0,0);
  ear2.render();

  //NOSE
  var mouth = new Cube();
  mouth.textureNum = -2;
  mouth.matrix = magenta.matrix;
  mouth.color = [1, 0.55, 0.55, 1.0];
  mouth.matrix.translate(-3.8,-2,-5);
  mouth.render();
}

function renderAllShapes2() {
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(g_camera.fov, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //drawMap();
  var sky = new Cube();
  sky.color = [1,0,0,1];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  drawSheep2();

  //grass
  var grass = new Cube();
  grass.color = [0.141, 0.56, 0.141, 1];
  grass.textureNum = -3;
  grass.matrix.translate(0, -0.75, 0);
  grass.matrix.scale(10, 0, 10);
  grass.matrix.translate(-0.5, 0, -0.5);
  grass.render();

  var duration = performance.now() - startTime;
}
