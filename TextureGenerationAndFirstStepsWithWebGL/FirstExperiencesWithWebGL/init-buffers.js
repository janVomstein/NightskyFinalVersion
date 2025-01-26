
//this function is used to initialize the color- and position-buffers at the start

function initBuffers(gl, centerPoints) {
  let positionBuffer = initPositionBuffer(gl, centerPoints);

  const colorBuffer = initColorBuffer(gl);


  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

//this function is used to update the position-buffer after every calculation while keeping the color buffer

function updatePositionBuffer(gl, centerPoints, buffers) {
    let positionBuffer = initPositionBuffer(gl, centerPoints);
    return {
        position: positionBuffer,
        color: buffers.color,
      };
}


function initPositionBuffer(gl, centerPoints) {
  // Create a buffer for the objects positions.
  let positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the circles.
  let max = 64;
  //circle 1
  const object1 = [];
    for (let i = 0; i < max; i++) {
      object1.push(centerPoints[0] + 0.1 * math.cos((i+1) * 2 * math.PI / max));
      object1.push(centerPoints[1] + 0.1 * math.sin((i+1) * 2 * math.PI / max));
    }
  //circle 2
  const object2 = [];
    for (let i = 0; i < max; i++) {
      object2.push(centerPoints[2] + 0.1 * math.cos(i * 2 * math.PI / max));
      object2.push(centerPoints[3] + 0.1 * math.sin(i * 2 * math.PI / max));
    }
  //circle 3
  const object3 = [];
  for (let i = 0; i < max; i++) {
    object3.push(centerPoints[4] + 0.1 * math.cos(i * 2 * math.PI / max));
    object3.push(centerPoints[5] + 0.1 * math.sin(i * 2 * math.PI / max));
  }

  //merge object arrays
  const positions = object1.concat(object2).concat(object3);

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

//this function is used to set the colors for each object

function initColorBuffer(gl) {
  let colors1 = [];
    for (let i = 0; i < 64; i++) {
        colors1.push(0.0, 1.0, 1.0, 1.0);
    }

  let colors2 = [];
    for (let i = 0; i < 64; i++) {
        colors2.push(1.0, 0.0, 1.0, 1.0);
    }

  let colors3 = [];
    for (let i = 0; i < 64; i++) {
        colors3.push(1.0, 1.0, 0.0, 1.0);
    }




  const colors = colors1.concat(colors2).concat(colors3);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}

export { initBuffers, updatePositionBuffer };
