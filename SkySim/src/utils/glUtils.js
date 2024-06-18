export function createShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export function makeBuffer(gl, sizeOrData) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, gl.STATIC_DRAW);
  return buf;
}

export function makeBufferAndSetAttribute(gl, data, loc) {
  const buf = makeBuffer(gl, data);
  // setup our attributes to tell WebGL how to pull
  // the data from the buffer above to the attribute
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(
    loc,
    1,         // size (num components)
    gl.FLOAT,  // type of data in buffer
    false,     // normalize
    0,         // stride (0 = auto)
    0,         // offset
  );
  return buf;
}

export function makeBufferAndSetAttributeNum(gl, data, loc, num_components) {  //num_components -> How many Components of specified Type (e.g. gl.FLOAT) does one item of attr buffer have?
  const buf = makeBuffer(gl, data);
  // setup our attributes to tell WebGL how to pull
  // the data from the buffer above to the attribute
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(
    loc,
    num_components,         // size (num components)
    gl.FLOAT,  // type of data in buffer
    false,     // normalize
    0,         // stride (0 = auto)
    0,         // offset
  );
  return buf;
}

export function updateBuffer(gl, buffer, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}


//For Visualization Program
export function loadTextResource (url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
  request.onload = function () {
    if (request.status < 200 || request.status > 299) {
      callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
    } else {
      callback(null, request.responseText);
    }
  };
  request.send();
}

export function createProgram(gl, vertexShader, fragmentShader) {
  //creating webgl program
  var program = gl.createProgram();

  //compile the shaders
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR: compile vertex shader!", gl.getShaderInfoLog(vertexShader));
    return;
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR: compile fragment shader!", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  //attach the shaders to the program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  //link program
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(program));
    return;
  }
  //validate program
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program!', gl.getProgramInfoLog(program));
    return;
  }
  return program;
}

export function canvasFullscreen(gl) {
  let html = document.querySelector("html");

  const width = html.clientWidth;
  const height = html.clientHeight;

  gl.canvas.width = width;
  gl.canvas.height = height;


  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export function canvasIdleColor(gl) {
  gl.clearColor(128/255, 147/255, 241/255, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}