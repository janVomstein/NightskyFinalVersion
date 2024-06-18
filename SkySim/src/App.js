//ReactJS
import './App.css';
import React, {useEffect, useRef} from "react";

//UI
import { SideMenu } from "./SideMenu";

//Utils
import {canvasFullscreen, canvasIdleColor} from "./utils/glUtils";


function App() {
  const canvasRef = useRef(null);
  let canvas = null;
  let gl = null;

  function onCanvasLoaded() {
    canvas = canvasRef.current;
    gl = canvas.getContext("webgl2");
    canvasFullscreen(gl);
    canvasIdleColor(gl);
  }

  function getGL() {
    return gl;
  }

  useEffect(onCanvasLoaded);

  return (
    <>
      <SideMenu getGL={getGL}></SideMenu>
      <canvas id="canvas" ref={canvasRef}></canvas>
    </>
  );
}

export default App;
