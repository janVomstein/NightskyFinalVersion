import { createShader, makeBuffer, makeBufferAndSetAttributeNum, updateBuffer } from "../utils/glUtils";
import { Triangle, Circle, Sphere } from "../Geometry/Geometry.ts";
import { Camera } from "../utils/Camera";
import {glMatrix, mat4, vec3} from "gl-matrix";


export class Renderer {
  constructor(gl) {
    this.vs = `#version 300 es

      in vec3 a;
      
      out vec3 v_pos;
      
      uniform mat4 u_projmat;
      uniform mat4 u_viewmat;
      uniform mat4 u_worldmat;
      
      void main() {
        mat4 test = mat4(1.0);
        vec4 pos = u_projmat * u_viewmat * u_worldmat * vec4(a, 1.0);
        //vec4 pos = u_a * u_b * u_c * vec4(a, 1.0);
        v_pos = a;
        gl_Position = pos / pos.w;
      }
      `;

    this.fs = `#version 300 es
      precision highp float;
      
      in vec3 v_pos;
      
      out vec4 outColor;
      
      void main() {
        outColor = vec4((v_pos + vec3(0.3, 0.3, 0.3)) / length(v_pos + vec3(0.3, 0.3, 0.3)), 1.0);
      }
      `;

    this.gl = gl;

    this.animationTimeMultiplicator = 1;
    this.animationTime = 0;
    this.doAnimation = false;

    this.cam = new Camera(
      this.gl.canvas,
      [0, 0, 10],
      [-1, 0, 0],
      [0, 1, 0]
    );

    this.cam.update(0.0);

    this.setupProgram();
    this.setupInputBuffers(3);
    this.assembleProgram();
    this.setupUniforms();


    this.clearCanvas();
  }

  setupProgram() {
    this.vShader = createShader(this.gl, this.gl.VERTEX_SHADER, this.vs);
    this.fShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, this.fs);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vShader);
    this.gl.attachShader(this.program, this.fShader);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramParameter(this.program));
    }
  }

  setupInputBuffers(vertexDimensionality) {
    this.vertexDimensionality = vertexDimensionality;

    this.aLoc = this.gl.getAttribLocation(this.program, 'a');

    // Create a vertex array object (attribute state)
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    let sphere = new Sphere(1, 8, 16);

    this.a = sphere.getArrayBufferContent();

    this.aBuffer = makeBufferAndSetAttributeNum(this.gl, this.a, this.aLoc, this.vertexDimensionality);
  }

  setupUniforms() {
    this.projMatLocation = this.gl.getUniformLocation(this.program, "u_projmat");
    this.viewMatLocation = this.gl.getUniformLocation(this.program, "u_viewmat");
    this.worldMatLocation = this.gl.getUniformLocation(this.program, "u_worldmat");

    this.projMat = mat4.create();
    mat4.perspective(this.projMat, glMatrix.toRadian(90), this.gl.canvas.width / this.gl.canvas.height, 0.00001, 1000.0);

    this.viewMat = this.cam.getViewMat();

    this.worldMat = mat4.create();
    mat4.fromTranslation(this.worldMat, vec3.fromValues(0.0, 0.0, 0.0));

    this.updateUniforms();
  }

  updateUniforms() {
    this.gl.uniformMatrix4fv(this.projMatLocation, this.gl.FALSE, this.projMat);
    this.gl.uniformMatrix4fv(this.viewMatLocation, this.gl.FALSE, this.viewMat);
    this.gl.uniformMatrix4fv(this.worldMatLocation, this.gl.FALSE, this.worldMat);
  }

  updateInputBuffers() {
    updateBuffer(this.gl, this.aBuffer, this.a);
  }

  assembleProgram() {
    this.gl.useProgram(this.program);

    // bind our input attribute state for the a and b buffers
    this.gl.bindVertexArray(this.vao);

    //Setup Culling and Depth Testing
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.FRONT);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  setPositionalData(positions, radiuses, stepWidth) {
    // positions = [[x0, y0, z0, x1, y1, z1, ...], [x0, y0, z0, x1, y1, z1, ...]] = [[Data at t_0], [Data at t_1]]
    this.positionalData = positions;
    this.radiuses = radiuses;
    this.stepWidth = stepWidth;       //How many seconds lie between two timepoints (stepWidth = t_1 - t_0)
  }

  fillArrayBuffer() {
    let n_theta = 16;
    let n_phi = 32;
    let sphere = new Sphere(1, n_theta, n_phi);
    let bufContent = sphere.getArrayBufferContent();

    this.numSpheres = Math.floor(this.positionalData[0].length / this.vertexDimensionality);
    this.numVerticesPerSphere = bufContent.length;

    this.a = new Float32Array(this.numSpheres * this.numVerticesPerSphere);
    for(let i = 0; i < this.numSpheres; i++) {
      sphere = new Sphere(this.radiuses[i], n_theta, n_phi);
      bufContent = sphere.getArrayBufferContent();
      this.a.set(bufContent, i * bufContent.length);
    }

    this.updateInputBuffers();
  }

  setTranslation(t, i) {
    let x = this.positionalData[t][3 * i];
    let y = this.positionalData[t][3 * i + 1];
    let z = this.positionalData[t][3 * i + 2];

    mat4.fromTranslation(this.worldMat, vec3.fromValues(x, y, z));
    this.updateUniforms();
  }

  clearCanvas() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  draw(dt) {
    if (this.doAnimation) {
      this.animationTime += this.animationTimeMultiplicator * dt;
    }
    let closestTimeStep = Math.floor(this.animationTime / (1000 * this.stepWidth));
    if (closestTimeStep >= this.positionalData.length - 1) {
      closestTimeStep = this.positionalData.length - 1;
      this.doAnimation = false;
    }
    //this.fillArrayBuffer();
    this.clearCanvas();
    for(let i = 0; i < this.numSpheres; i++) {
      this.setTranslation(closestTimeStep, i);
      this.gl.drawArrays(this.gl.TRIANGLES, Math.floor(i * this.numVerticesPerSphere / 3), Math.floor(this.numVerticesPerSphere / 3));
    }
  }

  renderFirst(time) {
    this.animationTime = 0;
    this.time = time;
    this.viewMat = this.cam.getViewMat();
    this.fillArrayBuffer();
    this.updateUniforms();
    this.draw(0.0);
    requestAnimationFrame(this.render.bind(this));
  }

  render(time) {
    let dt = time - this.time;  //dt is in milliseconds
    this.time = time;
    this.cam.update(dt);
    this.viewMat = this.cam.getViewMat();
    this.updateUniforms();
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.draw(dt);
    requestAnimationFrame(this.render.bind(this));
  }

  startRender() {
    requestAnimationFrame(this.renderFirst.bind(this));
  }
}
