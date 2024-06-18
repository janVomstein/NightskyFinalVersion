import {canvasIdleColor, createShader, makeBuffer, makeBufferAndSetAttribute, updateBuffer} from "../utils/glUtils";


export class Simulator {
  constructor(gl) {
    this.vs = `#version 300 es

      in float a;
      
      uniform float mass[10];
      uniform vec3 pos[10];
      uniform vec3 vel[10];
      
      uniform float G;
      uniform int steps;
      uniform float t;
      
      
      out vec3 solutions;
      out vec3 velocities;

      void main() {
        const int max_objs = 10;    //Remember to also change in uniform-Array-sizes
        float dt = t / float(steps);
        
        vec3 act_pos[max_objs] = pos;
        vec3 act_vel[max_objs] = vel;
        vec3 next_pos[max_objs] = pos;
        
        vec3 F = vec3(0.0, 0.0, 0.0);
        
        for(int step = 0; step < steps; step++) {
          //Calculate affecting Force on every object
          for(int i = 0; i < max_objs; i++) {
            //Calculate outgoing Force from every object
            F = vec3(0.0, 0.0, 0.0);
            for(int j = 0; j < max_objs; j++) {
              vec3 connection = act_pos[j] - act_pos[i];
              float discriminant = length(connection);
              if(discriminant != 0.0 && mass[i] != 0.0 && mass[j] != 0.0) {
                F += G * mass[j] * (connection) / pow(discriminant, 3.0);
              }
            }
            act_vel[i] += F * dt;
            next_pos[i] = act_pos[i] + act_vel[i] * dt;
          }
          
          act_pos = next_pos;
        }
        solutions = act_pos[int(a)];
        velocities = act_vel[int(a)];
      }
      `;

    this.fs = `#version 300 es
      precision highp float;
      void main() {
      }
      `;

    this.gl = gl;
    canvasIdleColor(this.gl);

    this.max_objs = 10;

    this.setupProgram();
    this.setupInputBuffers();
    this.setupOutputBuffers();
    this.assembleProgram();
    this.setupUniforms();
  }

  setupProgram() {
    this.vShader = createShader(this.gl, this.gl.VERTEX_SHADER, this.vs);
    this.fShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, this.fs);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vShader);
    this.gl.attachShader(this.program, this.fShader);
    this.gl.transformFeedbackVaryings(
      this.program,
      ["solutions", "velocities"],
      this.gl.SEPARATE_ATTRIBS
    );
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramParameter(this.program));
    }
  }

  setupUniforms() {
    this.massLocation = this.gl.getUniformLocation(this.program, "mass");
    this.gLocation = this.gl.getUniformLocation(this.program, "G");

    this.stepsLocation = this.gl.getUniformLocation(this.program, "steps");
    this.tLocation = this.gl.getUniformLocation(this.program, "t");

    this.posLocation = this.gl.getUniformLocation(this.program, "pos");
    this.velLocation = this.gl.getUniformLocation(this.program, "vel");

    this.mass = [1000.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];   //Length of this.max_objs
    this.g = 1.0;

    this.steps = 1;
    this.t = 0.03;

    this.pos = [  //Length of this.max_objs
      0.0, 0.0, 0.0,
      10.0, 0.0, 0.0,
      2.0, 2.0, 2.0,
      3.0, 3.0, 3.0,
      4.0, 4.0, 4.0,
      5.0, 5.0, 5.0,
      6.0, 6.0, 6.0,
      7.0, 7.0, 7.0,
      8.0, 8.0, 8.0,
      9.0, 9.0, 9.0,
    ];

    this.vel = [  //Length of this.max_objs
      0.0, 0.0, 0.0,
      0.0, 10.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
    ];

    this.gl.uniform1fv(this.massLocation, this.mass);
    this.gl.uniform1f(this.gLocation, this.g);

    this.gl.uniform1i(this.stepsLocation, this.steps);
    this.gl.uniform1f(this.tLocation, this.t);

    this.gl.uniform3fv(this.posLocation, this.pos);
    this.gl.uniform3fv(this.velLocation, this.vel);
  }

  updateUniforms() {
    this.gl.uniform1fv(this.massLocation, this.mass);
    this.gl.uniform1f(this.gLocation, this.g);

    this.gl.uniform1i(this.stepsLocation, this.steps);
    this.gl.uniform1f(this.tLocation, this.t);

    this.gl.uniform3fv(this.posLocation, this.pos);
    this.gl.uniform3fv(this.velLocation, this.vel);
  }

  setupInputBuffers() {
    this.aLoc = this.gl.getAttribLocation(this.program, 'a');
    //this.bLoc = this.gl.getAttribLocation(this.program, 'b');
    //this.cLoc = this.gl.getAttribLocation(this.program, 'c');

    // Create a vertex array object (attribute state)
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    this.a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];  //Length of this.max_objs
    //this.b = [2];
    //this.c = [3];

    // put data in buffers
    this.aBuffer = makeBufferAndSetAttribute(this.gl, new Float32Array(this.a), this.aLoc);
    //this.bBuffer = makeBufferAndSetAttribute(this.gl, new Float32Array(this.b), this.bLoc);
    //this.cBuffer = makeBufferAndSetAttribute(this.gl, new Float32Array(this.c), this.cLoc);
  }

  updateInputBuffers() {
    updateBuffer(this.gl, this.aBuffer, new Float32Array(this.a));
    //updateBuffer(this.gl, this.bBuffer, new Float32Array(this.b));
    //updateBuffer(this.gl, this.cBuffer, new Float32Array(this.c));

    //Set the size of the output-buffers to match size of new input
    this.setupOutputBuffers();
  }

  setupOutputBuffers() {
    // Create and fill out a transform feedback
    this.tf = this.gl.createTransformFeedback();
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.tf);

    // make buffers for output
    this.solutionsBuffer = makeBuffer(this.gl, this.max_objs * 3 * 4);    //sizeOrData is length of output-buffer * 4 (4 because float -> 32bit or 4 byte) (3 because 3D)
    this.velocitiesBuffer = makeBuffer(this.gl, this.max_objs * 3 * 4);
    //this.productBuffer = makeBuffer(this.gl, this.a.length * 4);

    // bind the buffers to the transform feedback
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.solutionsBuffer);
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.velocitiesBuffer);
    //this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.productBuffer);

    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);

    // buffers we are writing to can not be bound else where
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);  // last buffer of input-buffers was still bound to ARRAY_BUFFER so unbind it
  }

  assembleProgram() {
    this.gl.useProgram(this.program);

    // bind our input attribute state for the a and b buffers
    this.gl.bindVertexArray(this.vao);
  }

  simulate() {
    //this.assembleProgram();
    // no need to call the fragment shader
    this.gl.enable(this.gl.RASTERIZER_DISCARD);

    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.tf);
    this.gl.beginTransformFeedback(this.gl.POINTS);
    this.gl.drawArrays(this.gl.POINTS, 0, this.max_objs);
    this.gl.endTransformFeedback();
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);

    // turn on using fragment shaders again
    this.gl.disable(this.gl.RASTERIZER_DISCARD);
  }

  simulateMultiple(iterations) {
    let positions = [];
    for(let i = 0; i < iterations; i++) {
      this.simulate();
      let solutions = this.getResults(this.solutionsBuffer, this.max_objs * 3);
      let velocities = this.getResults(this.velocitiesBuffer, this.max_objs * 3);
      positions.push(solutions);
      this.pos = solutions;
      this.vel = velocities;
      this.updateUniforms();
    }
    return positions;
  }

  getResults(buffer, outLen) {
    const results = new Float32Array(outLen);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.getBufferSubData(
      this.gl.ARRAY_BUFFER,
      0,    // byte offset into GPU buffer,
      results,
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    return results;
  }
}


