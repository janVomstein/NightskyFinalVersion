/**
 * Create a new Shader.
 * @param gl - The WebGL-Context
 * @param type - Type of the Buffer. Either "gl.VERTEX_SHADER" or "gl.FRAGMENT_SHADER"
 * @param src - Source Code of the Shader
 * @returns {WebGLShader}
 */
export function createShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

/**
 * Creates a new Buffer and fills it up.
 * @param gl - The WebGL-Context-Object
 * @param {number|Float32Array} sizeOrData - If Number, the size is specified. If Float32Array, the content is specified
 * @returns {WebGLBuffer}
 */
export function makeBuffer(gl, sizeOrData) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, gl.STATIC_DRAW);
  return buf;
}

/**
 * Creates a new Buffer and sets the VertexAttribPointer.
 * @param gl - The WebGL-Context-Object
 * @param data - Data to fill the Buffer with
 * @param loc - Location of the Attribute in the Shader-Program that the Buffer stores data for
 * @returns {WebGLBuffer}
 */
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

/**
 * Creates a new Buffer and sets the VertexAttribPointer.
 * @param gl - The WebGL-Context-Object
 * @param data - Data to fill the Buffer with
 * @param loc - Location of the Attribute in the Shader-Program that the Buffer stores data for
 * @param num_components - Number of Components of one Object. (Example Vertex-Buffer: 1 Vertex in 3D -> 3)
 * @returns {WebGLBuffer}
 */
export function makeBufferAndSetAttributeNum(gl, data, loc, num_components) {
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

/**
 * Load Data into a Buffer.
 * @param gl - The WebGL-Context-Object
 * @param buffer - The Buffer to copy to
 * @param data - The Data to copy to the Buffer
 */
export function updateBuffer(gl, buffer, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

/**
 * Sets the Canvas to Fullscreen. Used when Browser-Window is resized.
 * @param gl - The WebGL-Context-Object
 */
export function canvasFullscreen(gl) {
  let html = document.querySelector("html");

  const width = html.clientWidth;
  const height = html.clientHeight;

  gl.canvas.width = width;
  gl.canvas.height = height;


  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

/**
 * Fills the Canvas with the Idle-Color.
 * @param gl - The WebGL-Context-Object
 */
export function canvasIdleColor(gl) {
  gl.clearColor(128/255, 147/255, 241/255, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}