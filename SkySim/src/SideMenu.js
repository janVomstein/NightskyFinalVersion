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
import {Pencil2Icon, ReloadIcon, PlusCircledIcon, TrashIcon} from "@radix-ui/react-icons";

//Simulation/Rendering
import {Simulator} from "./Simulator/Simulator";
import {SolarSystemSimulator} from "./Simulator/SolarSystemSimulator";
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
  const [data, setData] = useState([]);

  //Parameters that get set directly in the SideMenu
  //These Parameters are for the Simulation
  const [g, setG] = useState(1);

  //States which represent if the SideMenu is opened and whether the Animation is running/paused
  const [open, setOpen] = useState(true);
  const [animating, setAnimating] = useState(false);

  //States which represent the current Simulator/Renderer
  let sim = new SolarSystemSimulator(1.0);
  let ren = new Renderer(getGL, sim);
  const [simulator, setSimulator] = useState(sim);
  const [renderer, setRenderer] = useState(ren);

  //Toggle the SideMenu whenever the CTRL-Key is pressed
  useEventListener("keydown", (e) => {if(e.ctrlKey) setOpen(!open)});

  function setAttributes() {
    simulator.gamma = g;
  }

  /**
   * Mutates the data stored in the App-Component
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
      /*let ren = new Renderer(getGL(), null);
      setRenderer(ren);*/
      renderer.stopRender();
      setAnimating(false);
    }
    else {
      setAttributes();
      //Start Animation
      renderer.startRender();
      setAnimating(true);
    }
  }

  const tags = Array.from({ length: 50 }).map(
      (_, i, a) => `v1.2.0-beta.${a.length - i}`
  )

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
                <TableHead className="w-[160px] text-center">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elements.length === 0 ? <TableRow><TableCell className="text-center">No Items</TableCell></TableRow> : elements}
              <TableRow>
                <TableCell className="w-[10px] text-center"/>
                <TableCell className="w-[150px] text-center"/>
                <TableCell className="w-[150px] text-center"/>
                <TableCell className="w-[100px] text-center"/>
                <TableCell className="w-[160px] text-center">
                  <Button variant="outline" onClick={addNewObject}><PlusCircledIcon/></Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <Label className="text-center" htmlFor="g">Gamma</Label>
            <Input
                id="g"
                type="number"
                value={g}
                onChange={(e) => {
                  setG(e.target.value)
                }}
                className="col-span-2 h-8 w-30"
            />
            <div className="col-span-4 h-8 w-30"/>
            <Button variant={animating ? "destructive" : ""} className="col-span-3 h-8 w-30"
                    onClick={handleAnimate}>{animating ? "Abort Animation" : "Start Animation"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}