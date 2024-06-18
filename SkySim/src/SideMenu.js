//ReactJS
import React, {useState} from "react";

//UI
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "./components/ui/sheet";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./components/ui/table";
import {Popover, PopoverContent, PopoverTrigger} from "./components/ui/popover";
import {Button} from "./components/ui/button";
import {Label} from "./components/ui/label";
import {Input} from "./components/ui/input";
import {Pencil2Icon, ReloadIcon} from "@radix-ui/react-icons";

//Simulation/Rendering
import {Simulator} from "./Simulator/Simulator";
import {Renderer} from "./Rendering/Renderer";

//Utils
import {isNumeric, useEventListener} from "./utils/uiUtils";

/**
 * Component which represents one Object in the data-table in the SideMenu
 *
 * @param data
 * @param mutateData
 * @returns {Element}
 * @constructor
 */
export function ObjectRepresentator({data, mutateData}) {
  //State which represents if the Popover used to edit an Object's Parameters is opened
  const [popoverOpen, setPopoverOpen] = useState(false);

  //State which represents the Object's Parameters before they get submitted to the SideMenu when the Popover is closed
  const [tempData, setTempData] = useState(data);

  /**
   * Checks if the data inputted to the Popover (id, mass, pos, vel) is numeric and casts it to Number
   *
   * @param data
   * @returns {{pos: number[], mass: number, id: number, vel: number[]}|boolean}
   */
  function validateData(data) {
    if(!isNumeric(data.pos[0]) || !isNumeric(data.pos[1]) || !isNumeric(data.pos[2])) {
      return false;
    }
    if(!isNumeric(data.vel[0]) || !isNumeric(data.vel[1]) || !isNumeric(data.vel[2])) {
      return false;
    }
    if(!isNumeric(data.mass)) {   //Can be simplified but wouldn't fit context
      return false
    }
    return {
      "id": parseFloat(tempData.id),
      "mass": parseFloat(tempData.mass),
      "pos": [parseFloat(tempData.pos[0]), parseFloat(tempData.pos[1]), parseFloat(tempData.pos[2])],
      "vel": [parseFloat(tempData.vel[0]), parseFloat(tempData.vel[1]), parseFloat(tempData.vel[2])]
    }
  }

  /**
   * Function which gets called when the Popover is toggled
   */
  function handlePopoverToggle() {
    if(!popoverOpen) {
      setTempData(data);
    }
    else {
      let validatedData = validateData(tempData);
      if(validatedData !== false) {
        mutateData(validatedData, data.id);
      }
    }
    setPopoverOpen(!popoverOpen);
  }

  return (
    <TableRow>
      <TableCell className="w-[10px] text-center">{data.id}</TableCell>
      <TableCell className="w-[150px] text-center">{`[${data.pos[0]}, ${data.pos[1]}, ${data.pos[2]}] m`}</TableCell>
      <TableCell className="w-[150px] text-center">{`[${data.vel[0]}, ${data.vel[1]}, ${data.vel[2]}] m/s`}</TableCell>
      <TableCell className="w-[100px] text-center">{`${data.mass} kg`}</TableCell>
      <TableCell className="w-[100px] text-center">
        <Popover open={popoverOpen} onOpenChange={handlePopoverToggle}>
          <PopoverTrigger asChild>
            <Button variant="outline"><Pencil2Icon/></Button>
          </PopoverTrigger>
          <PopoverContent className="w-200">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Edit Object</h4>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-4 items-center gap-x-2">
                  <Label htmlFor="posx">Position</Label>
                  <Input
                    id="posx"
                    value={tempData.pos[0]}
                    onChange={(e) => {setTempData({...tempData, "pos": tempData.pos.with(0, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Input
                    id="posy"
                    value={tempData.pos[1]}
                    onChange={(e) => {setTempData({...tempData, "pos": tempData.pos.with(1, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Input
                    id="posz"
                    value={tempData.pos[2]}
                    onChange={(e) => {setTempData({...tempData, "pos": tempData.pos.with(2, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-x-2">
                  <Label htmlFor="velx">Velocity</Label>
                  <Input
                    id="velx"
                    value={tempData.vel[0]}
                    onChange={(e) => {setTempData({...tempData, "vel": tempData.pos.with(0, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Input
                    id="vely"
                    value={tempData.vel[1]}
                    onChange={(e) => {setTempData({...tempData, "vel": tempData.pos.with(1, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Input
                    id="velz"
                    value={tempData.vel[2]}
                    onChange={(e) => {setTempData({...tempData, "vel": tempData.pos.with(2, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-x-2">
                  <Label htmlFor="mass">Mass</Label>
                  <Input
                    id="mass"
                    value={tempData.mass}
                    onChange={(e) => {setTempData({...tempData, "mass": e.target.value})}}
                    className="col-span-3 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  );
}

/**
 * Component which represents the SideMenu-Sheet used to set Data and control Simulation/Animation
 *
 * @param gl
 * @returns {Element}
 * @constructor
 */
export function SideMenu({getGL}) {
  //Parameters which get set through the corresponding ObjectRepresentator
  //These Parameters are per Object
  const initData = [
    {
      "id": 0,
      "mass": 1000,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 1,
      "mass": 1,
      "pos": [0, 10, 0],
      "vel": [10, 0, 0]
    },
    {
      "id": 2,
      "mass": 15,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 3,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 4,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 5,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 6,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 7,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 8,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    },
    {
      "id": 9,
      "mass": 0,
      "pos": [0, 0, 0],
      "vel": [0, 0, 0]
    }
  ]
  const [data, setData] = useState(initData);

  //Parameters that get set directly in the SideMenu
  //These Parameters are per Simulation
  const [g, setG] = useState(1);
  const [steps, setSteps] = useState(10);
  const [t, setT] = useState(1);
  const [iterations, setIterations] = useState(1000);

  //States which represent if the SideMenu is opened and whether the Simulation/Animation is running/paused
  const [open, setOpen] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animationPaused, setAnimationPaused] = useState(true);

  //States which represent the current Simulator/Renderer
  const [simulator, setSimulator] = useState(null);
  const [renderer, setRenderer] = useState(null);

  //State which represents the current Result of the last Simulation
  const [results, setResults] = useState([]);

  //Toggle the SideMenu whenever the CTRL-Key is pressed
  useEventListener("keydown", (e) => {if(e.ctrlKey) setOpen(!open)});

  /**
   * Mutates the data stored in the App-Component
   *
   * @param {Array} newDataPart   The Data which should be copied to the App-Component
   * @param {number} id           The object-ID of the newDataPart
   */
  function mutateData(newDataPart, id) {
    let updatedData = data.map((elem, idx) => idx === id ? {...data[id], ...newDataPart} : data[idx])
    setData(updatedData);
  }

  //Fill in ObjectRepresentators to represent Objects in the Simulation/Animation
  let elements = [];
  for(let i = 0; i < data.filter(elem => elem.mass !== 0).length; i++) {
    elements.push(<ObjectRepresentator key={i} data={data[i]} mutateData={mutateData}/>);
  }

  /**
   * Checks if the data inputted directly to the SideMenu (g, steps, t, iterations) is numeric and casts it to Number
   *
   * @param {number} g
   * @param {number} steps
   * @param {number} t
   * @param {number} iterations
   */
  function validateData(g, steps, t, iterations) {
    if(!isNumeric(g)) {
      return false;
    }
    if(!isNumeric(steps) || steps < 1 || steps % 1 !== 0) {
      return false;
    }
    if(!isNumeric(t) || t < 0) {
      return false
    }
    if(!isNumeric(iterations) || iterations < 1 || iterations % 1 !== 0) {
      return false
    }
    return {
      "g": parseFloat(g),
      "steps": parseInt(steps),
      "t": parseFloat(t),
      "iterations": parseInt(iterations)
    }
  }

  /**
   * Function that gets called whenever the Start-Simulation-Button is clicked
   */
  function handleSimulate() {
    if(animating) {
      return;
    }
    setSimulating(true);
    let parameters = validateData(g, steps, t, iterations);
    if(parameters === false) {  //must be "===" instead of "=="
      setSimulating(false);
      return;
    }
    let sim = new Simulator(getGL());

    for(let i = 0; i < sim.max_objs; i++) {
      sim.pos[3 * i] = data[i].pos[0];
      sim.pos[3 * i + 1] = data[i].pos[1];
      sim.pos[3 * i + 2] = data[i].pos[2];

      sim.vel[3 * i] = data[i].vel[0];
      sim.vel[3 * i + 1] = data[i].vel[1];
      sim.vel[3 * i + 2] = data[i].vel[2];

      sim.mass[i] = data[i].mass;
    }

    sim.g = g;
    sim.steps = steps;
    sim.t = t;

    sim.updateUniforms();

    setResults(sim.simulateMultiple(iterations));
    setSimulator(sim);
    setSimulating(false);
  }

  /**
   * Function that gets called whenever the Start-Stop-Animation-Button is clicked
   */
  function handleAnimate() {
    if(simulating) {
      return;
    }
    let ren = new Renderer(getGL());
    if(animating) {
      //Stop Animation
      setRenderer(ren);
      setAnimating(false);
    }
    else {
      //Start Animation
      ren.setPositionalData(results, [5, 2, 5, 5, 5, 5, 5, 5, 5, 5], t);
      ren.startRender();
      ren.doAnimation = !animationPaused;
      setRenderer(ren);
      setAnimating(true);
    }
  }

  /**
   * Pauses/Unpauses the Animation
   */
  function setPauseAnimation(paused) {
    renderer.doAnimation = !paused;
    setAnimationPaused(paused);
  }

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Simulation Parameters</SheetTitle>
          </SheetHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10px] text-center">#</TableHead>
                <TableHead className="w-[150px] text-center">Position</TableHead>
                <TableHead className="w-[150px] text-center">Velocity</TableHead>
                <TableHead className="w-[100px] text-center">Mass</TableHead>
                <TableHead className="w-[100px] text-center">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elements.length === 0 ? <TableRow><TableCell className="text-center">No Items</TableCell></TableRow> : elements}
            </TableBody>
          </Table>

          <br/>

          <div className="grid gap-2 items-center grid-cols-2">
            <div className="grid gap-2 items-center grid-cols-2">
              <Label className="text-center" htmlFor="g">G</Label>
              <Input
                id="g"
                value={g}
                onChange={(e) => {setG(e.target.value)}}
                className="col-span-1 h-8 w-30"
              />

              <Label className="text-center" htmlFor="iterations">Iterations</Label>
              <Input
                id="iterations"
                value={iterations}
                onChange={(e) => {setIterations(e.target.value)}}
                className="col-span-1 h-8 w-30"
              />
            </div>
            <div className="grid gap-2 items-center grid-cols-2">
              <Label className="text-center" htmlFor="t">t</Label>
              <Input
                id="t"
                value={t}
                onChange={(e) => {setT(e.target.value)}}
                className="col-span-1 h-8 w-30"
              />

              <Label className="text-center" htmlFor="steps">Steps</Label>
              <Input
                id="steps"
                value={steps}
                onChange={(e) => {setSteps(e.target.value)}}
                className="col-span-1 h-8 w-30"
              />
            </div>
          </div>

          <br/>

          <div className="grid gap-2 items-center grid-cols-3">
            <Button disabled={simulating} onClick={handleSimulate}>{simulating ? <><ReloadIcon className="animate-spin"/> &nbsp; Please Wait</> : "Start Simulation"}</Button>
            <Button variant={animating ? "destructive" : ""} onClick={handleAnimate}>{animating ? "Abort Animation" : "Start Animation"}</Button>
            <Button variant={animationPaused ? "" : "destructive"} onClick={() => {setPauseAnimation(!animationPaused)}}>{animationPaused ? "Start" : "Pause"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}