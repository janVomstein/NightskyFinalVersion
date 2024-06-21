//ReactJS
import React, {useState} from "react";

//UI
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "./components/ui/sheet";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./components/ui/table";
import {Popover, PopoverContent, PopoverTrigger} from "./components/ui/popover";
import {Button} from "./components/ui/button";
import {Label} from "./components/ui/label";
import {Input} from "./components/ui/input";
import {ScrollArea} from "./components/ui/scroll-area";
import {Slider} from "./components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./components/ui/select";
import {Badge} from "./components/ui/badge";

import {Pencil2Icon, ReloadIcon, PlusCircledIcon, TrashIcon} from "@radix-ui/react-icons";


//Simulation/Rendering
import {SolarSystemSimulator} from "./Simulator/SolarSystemSimulator";
import {Renderer} from "./Rendering/Renderer";

//Utils
import {floatToBaseExp, idToColor, isNumeric, useEventListener} from "./utils/uiUtils";

let simulator = new SolarSystemSimulator(1);
let renderer = new Renderer(null, simulator);

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
  let prepared_data = {...data, "massBase": data.mass / Math.pow(10, Math.floor(Math.log10(data.mass))), "massExp": Math.floor(Math.log10(data.mass))}
  const [tempData, setTempData] = useState(prepared_data);

  /**
   * Checks if the data_to_validate inputted to the Popover (id, mass, pos, vel) is numeric and casts it to Number
   *
   * @param {{}} data_to_validate - Data to validate
   * @returns {{pos: number[], mass: number, name: string, id: number, vel: number[]}|boolean}
   */
  function validateData(data_to_validate) {
    if(!isNumeric(data_to_validate.pos[0]) || !isNumeric(data_to_validate.pos[1]) || !isNumeric(data_to_validate.pos[2])) {
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false;
    }
    if(!isNumeric(data_to_validate.vel[0]) || !isNumeric(data_to_validate.vel[1]) || !isNumeric(data_to_validate.vel[2])) {
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false;
    }
    if(!isNumeric(data_to_validate.mass) || !isNumeric(data_to_validate.massBase) || !isNumeric(data_to_validate.massExp)) {   //Can be simplified but wouldn't fit context
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false
    }

    return {
      "id": parseFloat(data_to_validate.id),
      "mass": parseFloat(data_to_validate.massBase) * Math.pow(10, parseFloat(data_to_validate.massExp)),
      "name": data_to_validate.name,
      "pos": [parseFloat(data_to_validate.pos[0]), parseFloat(data_to_validate.pos[1]), parseFloat(data_to_validate.pos[2])],
      "vel": [parseFloat(data_to_validate.vel[0]), parseFloat(data_to_validate.vel[1]), parseFloat(data_to_validate.vel[2])]
    }
  }

  /**
   * Function which gets called when the Popover is toggled
   */
  function handlePopoverToggle() {
    if(popoverOpen) {
      let validatedData = validateData(tempData);
      if(validatedData !== false) {
        mutateData(validatedData, data.id);
      }
      else {
        //ToDo: Open Toast
        console.log("Error")
      }
    }
    setPopoverOpen(!popoverOpen);
  }

  return (
    <TableRow>
      <TableCell className="w-[10px] text-center"><div className="box" style={{backgroundColor: idToColor(data.id)}}>{data.id}</div></TableCell>
      <TableCell className="w-[200px] text-center"><Badge>{data.name}</Badge></TableCell>
      <TableCell className="w-[100px] text-center">{`${floatToBaseExp(data.mass)[0]}`} <br/> {`x 10^${floatToBaseExp(data.mass)[1]}`} </TableCell>
      <TableCell className="w-[160px] text-center">
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={tempData.name}
                    onChange={(e) => {setTempData({...tempData, "name": e.target.value})}}
                    className="col-span-3 h-8"
                  />
                </div>
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
                    onChange={(e) => {setTempData({...tempData, "vel": tempData.vel.with(0, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Input
                    id="vely"
                    value={tempData.vel[1]}
                    onChange={(e) => {setTempData({...tempData, "vel": tempData.vel.with(1, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Input
                    id="velz"
                    value={tempData.vel[2]}
                    onChange={(e) => {setTempData({...tempData, "vel": tempData.vel.with(2, e.target.value)})}}
                    className="col-span-1 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-x-2">
                  <Label htmlFor="massBase">Mass</Label>
                  <Input
                    id="massBase"
                    value={tempData.massBase}
                    onChange={(e) => {setTempData({
                      ...tempData,
                      "massBase": e.target.value
                    })}}
                    className="col-span-1 h-8 w-20"
                  />
                  <Label htmlFor="massExp">x 10^</Label>
                  <Input
                      id="massExp"
                      value={tempData.massExp}
                      onChange={(e) => {setTempData({
                        ...tempData,
                        "massExp": e.target.value
                      })}}
                      className="col-span-1 h-8 w-20"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {" "}
        <Button variant="outline" onClick={() => {mutateData(new Map(), tempData.id)}}><TrashIcon></TrashIcon></Button>
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
  const [data, setData] = useState([
    {
      "id": 0,
      "name": "Sun",
      "pos": [0, 0, 0],
      "vel": [0, 0, 0],
      "mass": 1.989 * Math.pow(10, 30)
    },
    {
      "id": 1,
      "name": "Merkur",
      "pos": [0.387098, 0, 0],
      "vel": [0, 47360, 0],
      "mass": 3.301 * Math.pow(10, 23)
    },
    {
      "id": 2,
      "name": "Venus",
      "pos": [0.7233, 0, 0],
      "vel": [0, 35020, 0],
      "mass": 4.8673 * Math.pow(10, 24)
    },
    {
      "id": 3,
      "name": "Earth",
      "pos": [1, 0, 0],
      "vel": [0, 29780, 0],
      "mass": 5.972 * Math.pow(10, 24)
    },
    {
      "id": 4,
      "name": "Mars",
      "pos": [1.524, 0, 0],
      "vel": [0, 24070, 0],
      "mass": 6.417 * Math.pow(10, 23)
    },
    {
      "id": 5,
      "name": "Jupiter",
      "pos": [5.204, 0, 0],
      "vel": [0, 13060, 0],
      "mass": 1.89813 * Math.pow(10, 27)
    },
    {
      "id": 6,
      "name": "Saturn",
      "pos": [9.582, 0, 0],
      "vel": [0, 9680, 0],
      "mass": 5.683 * Math.pow(10, 26)
    },
    {
      "id": 7,
      "name": "Uranus",
      "pos": [19.201, 0, 0],
      "vel": [0, 6810, 0],
      "mass": 8.681 * Math.pow(10, 25)
    },
    {
      "id": 8,
      "name": "Neptun",
      "pos": [30.178, 0, 0],
      "vel": [0, 5455, 0],
      "mass": 1.024 * Math.pow(10, 26)
    },
  ]);

  //Parameters that get set directly in the SideMenu
  //These Parameters are for the Simulation
  const [gBase, setGBase] = useState(6.674);
  const [gExp, setGExp] = useState(-11);
  const [timeSliderValue, setTimeSliderValue] = useState([1]);
  const [timeFactor, setTimeFactor] = useState("1")

  //States which represent if the SideMenu is opened and whether the Animation is running/paused
  const [open, setOpen] = useState(true);
  const [animating, setAnimating] = useState(false);

  const [datetime, setDatetime] = useState(new Date("June 2, 2024 15:49:00"));

  //States which represent the current Simulator/Renderer
  //let sim = new SolarSystemSimulator(gBase * Math.pow(10, gExp));
  //let ren = new Renderer(getGL, sim);
  //const [simulator, setSimulator] = useState(sim);
  //const [renderer, setRenderer] = useState(ren);

  //Pass the getGL-Function to the Renderer
  renderer.getGL = getGL;
  //Pass Getter and Setter of the Datetime to Renderer
  renderer.getDatetime = () => datetime;
  renderer.setDatetime = setDatetime;
  //Pass Gamma aka Universal Gravitational Constant to Renderer
  simulator.gamma = gBase * Math.pow(10, gExp);

  //Toggle the SideMenu whenever the CTRL-Key is pressed
  useEventListener("keydown", (e) => {if(e.ctrlKey) setOpen(!open)});

  /**
   * Mutates the data on GravitationalObjects stored in the App-Component and updates the Data in the Simulator.
   *
   * @param {Array} newDataPart   The Data which should be copied to the App-Component
   * @param {number} id           The object-ID of the newDataPart
   */
  function mutateData(newDataPart, id) {
    //Copy the Contents of the Data prop (for re-render to trigger)
    let updatedData = [...data];

    //If newDataPart == {}, then this id should be deleted
    if (newDataPart.size === 0) {
      updatedData.splice(id, 1);    //Delete object from List
      updatedData.map((elem, idx) => {elem.id = idx});    //Update the indices of other elements in list
    }
    //Else, just data update
    else {
      updatedData = updatedData.map((elem, idx) => idx === id ? newDataPart : data[idx]);
    }
    setData(updatedData);
    simulator.applyDataUpdate(updatedData);
  }

  /**
   * Uploads all Simulation-Data to the Simulator.
   */
  function uploadSimulationData(gBase, gExp) {
    simulator.gamma = gBase * Math.pow(10, gExp);
  }

  function uploadRendererData(timeFactor, timeSliderValue) {
    renderer.timestep = parseFloat(timeFactor) * timeSliderValue[0];
  }

  //Fill in ObjectRepresentators to represent Objects in the Simulation/Animation
  let elements = [];
  for(let i = 0; i < data.length; i++) {
    elements.push(<ObjectRepresentator key={i} data={data[i]} mutateData={mutateData}/>);
  }

  function addNewObject() {
    let updatedData = [...data];
    updatedData.push({
      "id": updatedData.length,
      "name": "UFO",
      "pos": [0, 0, 0],
      "vel": [0, 0, 0],
      "mass": 0
    })
    setData(updatedData);
  }

  /**
   * Function that gets called whenever the Start-Stop-Animation-Button is clicked
   */
  function handleAnimate() {
    if(animating) {
      //Stop Animation
      renderer.stopRender();
      setAnimating(false);
    }
    else {
      //Start Animation
      simulator.applyDataUpdate(data);
      uploadRendererData(timeFactor, timeSliderValue);
      uploadSimulationData(gBase, gExp);
      renderer.startRender();
      setAnimating(true);
    }
  }

  function gBaseChange(e) {
    setGBase(e.target.value);
    uploadSimulationData(e.target.value, gExp);
  }

  function gExpChange(e) {
    setGExp(e.target.value);
    uploadSimulationData(gBase, e.target.value);
  }

  function timeSliderValueChange(newValue) {
    setTimeSliderValue(newValue);
    uploadRendererData(timeFactor, newValue);
  }

  function timeFactorChange(newValue) {
    setTimeFactor(newValue);
    uploadRendererData(newValue, timeSliderValue);
  }

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Badge>
            {datetime.getDate()}.
            {datetime.getMonth()}.
            {datetime.getFullYear()}
            {" - "}
            {datetime.getHours() < 10 ? "0" + datetime.getHours().toString() : datetime.getHours()}:
            {datetime.getMinutes() < 10 ? "0" + datetime.getMinutes().toString() : datetime.getMinutes()}:
            {datetime.getSeconds() < 10 ? "0" + datetime.getSeconds().toString() : datetime.getSeconds()}
          </Badge>
          <SheetHeader>
            <SheetTitle>Edit Simulation Parameters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-96 rounded-md border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10px] text-center">#</TableHead>
                  <TableHead className="w-[200px] text-center">Name</TableHead>
                  <TableHead className="w-[100px] text-center">Mass</TableHead>
                  <TableHead className="w-[160px] text-center">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elements.length === 0 ?
                    <TableRow><TableCell className="text-center">No Items</TableCell></TableRow> : elements}
                <TableRow>
                  <TableCell className="w-[10px] text-center"/>
                  <TableCell className="w-[200px] text-center"/>
                  <TableCell className="w-[100px] text-center"/>
                  <TableCell className="w-[160px] text-center">
                    <Button variant="outline" onClick={addNewObject}><PlusCircledIcon/></Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ScrollArea>
          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <Label className="col-span-2 w-30" htmlFor="timeFactor"><Badge>Time</Badge></Label>
            <Slider className="col-span-3 h-8 w-30" value={timeSliderValue} min={1} max={25}
                    onValueChange={timeSliderValueChange}></Slider>
            <Label>{timeSliderValue}</Label>
            <Select className="col-span-3 h-8 w-30" value={timeFactor} onValueChange={timeFactorChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="unit"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">s per s</SelectItem>
                <SelectItem value="86400">days per s</SelectItem>
                <SelectItem value="2678400">months per s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <Label className="col-span-2 w-30" htmlFor="g"><Badge>Gamma</Badge></Label>
            <Input
                id="gBase"
                type="number"
                value={gBase}
                onChange={gBaseChange}
                className="col-span-2 h-8 w-30"
            />
            <Label className="col-span-2 w-30 text-center" htmlFor="gExp">x 10^</Label>
            <Input
                id="gExp"
                type="number"
                value={gExp}
                onChange={gExpChange}
                className="col-span-2 h-8 w-30"
            />
          </div>
          <br/>
          <div className="grid gap-2 items-center grid-cols-10">
            <div className="col-span-7 h-8 w-30"/>
            <Button variant={animating ? "destructive" : ""} className="col-span-3 h-8 w-30"
                    onClick={handleAnimate}>{animating ? "Abort Animation" : "Start Animation"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
);
}