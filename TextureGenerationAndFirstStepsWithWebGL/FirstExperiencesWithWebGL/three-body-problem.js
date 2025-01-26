import { initBuffers, updatePositionBuffer } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";

let timeSinceStart = 0.0;
let deltaTime = 0;

main();

//
// start here
//
function main() {
  const canvas = document.querySelector("#glcanvas");
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };

  //State Array stores the following values for each object:
  //mass: the objects mass
  //X: the X-coordinate of the objects center
  //Y: the Y-coordinate of the objects center
  //XVec: the X-Value of the current movement-vector of the object
  //YVec: the Y-Value of the current movement-vector of the object
  let state = [/*mass*/360000000.0,/*X*/ 1.0,/*Y*/ 1.0,/*XVec*/ 0.0,/*YVec*/ -0.1 /**/, 360000000.0, 1.0, 0.0, -0.1, 0.0 /**/, 360000000.0, -1.0, -1.0, 0.0, 0.1];

  //this variable stores the time value of the last calculation
  let then = 0;

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.

  let buffers = initBuffers(gl, getCenterPoints(deltaTime, state));

  // Draw the scene repeatedly
  function render(now) {

    now *= 0.001; // convert to seconds
    deltaTime = now - then;
    then = now;

    buffers = updatePositionBuffer(gl, getCenterPoints(deltaTime, state), buffers);


    drawScene(gl, programInfo, buffers);
    timeSinceStart += deltaTime;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//this function is used to calculate the new positions of the objects after every time step

function getCenterPoints(deltaTime, state) {
    const G = 6.674 * math.pow(10, -11);
    let accelerationVectors = [];
    //calculate the gravitational forces as vectors affecting each object
    for (let i = 0; i < 3; i++) {
        accelerationVectors.push(calculateAccelerationVectorX(G, state, i));
        accelerationVectors.push(calculateAccelerationVectorY(G, state, i));
    }
    //calculate the new position and movement vector
    for (let i = 0; i < 3; i++) {
        calculateNewPosition(state, i, deltaTime);
        calculateNewVelocity(state, i, deltaTime, accelerationVectors);
    }
    let centerPoints = [state[1], state[2], state[6], state[7], state[11], state[12]];
    return centerPoints;
}

//this function calculates the X value of the vector representing the gravitational forces affecting an object

function calculateAccelerationVectorX(G, state, i) {
    let sumX = 0;
    for (let j = 0; j < 3; j++) {
        if(i !== j) {
            sumX += state[j*5] * (state[j * 5 + 1] - state[i * 5 + 1]) / math.pow(calculateDistance(state, i ,j), 3);
        }
    }
    let Fx = sumX * G * state[i*5];
    return Fx;
}

//this function calculates the Y value of the vector representing the gravitational forces affecting an object

function calculateAccelerationVectorY(G, state, i) {
    let sumY = 0;
    for (let j = 0; j < 3; j++) {
        if(i !== j) {
            sumY += state[j*5] * (state[j * 5 + 2] - state[i * 5 + 2]) / math.pow(calculateDistance(state, i ,j), 3);
        }
    }
    let Fy = sumY * G * state[i*5];
    return Fy;
}

//this function calculates the current distance between two objects

function calculateDistance(state, i, j) {
    return 1000 * math.sqrt(math.pow(state[i*5 + 1] - state[j*5 + 1], 2) + math.pow(state[i*5 + 2] - state[j*5 + 2], 2));
}

//this function calculates the new position of an object using its movement vector

function calculateNewPosition(state, i, deltaTime) {
    let newX = state[i*5 + 1] + deltaTime * state[i*5 + 3];
    let newY = state[i*5 + 2] + deltaTime * state[i*5 + 4];
    state[i*5 + 1] = newX;
    state[i*5 + 2] = newY;
}

//this function calculates the new movement vector of an object using the old movement vector and the vector representing
//the gravitational forces affecting the object

function calculateNewVelocity(state, i, deltaTime, accelerationVectors) {
    let newDeltaX = state[i*5 + 3] + deltaTime * accelerationVectors[i*2];
    let newDeltaY = state[i*5 + 4] + deltaTime * accelerationVectors[i*2 + 1];
    state[i*5 + 3] = newDeltaX;
    state[i*5 + 4] = newDeltaY;
}
