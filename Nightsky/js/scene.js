{
    // WebGL context.
    /** @type {WebGLRenderingContext} */
    let gl = getCanvas().getContext("webgl");
    // Most modern browsers should support webGL, but it is better
    // to be safe than sorry.
    if (!gl) {
        alert("webgl not supported \n trying experimental");
        gl = getCanvas().getContext("experimental-webgl");
    }
    if (!gl) {
        alert("the browser does not even support experimental-webgl");
    }

    // This camera allows the user to look around the scene.
    // the class ControllableCamera is defined in camera.js.
    let cam = new ControllableCamera(
        getCanvas(),
        [0, 200, -300],
        [0, 0, 100],
        [0, 1, 0],
        45 * Math.PI / 180
    );

    // The gaia-data. This will be defined at the start of the
    // scene through the function startScene(). For the scene to
    // work this should be an array of the form:
    // [
    //      positions: [number, number, number][] - Positions of the
    //                                              objects in the dataset
    //                                              in xyz-coordinates.
    //      colors: [number, number, number][] - Colors of the objects
    //                                           in the dataset in rgb.
    //      sizes:  number[] - Scaling of the objects in the dataset in
    //                         xyz-direction. Only 1 number, because the
    //                         scaling is the same in all directions.
    // ]
    let gaia;

    // Should the camera be updated?
    // If the camera is not updated, it can not be controlled.
    // Yes:     true
    // No:      false
    let camUpdate = true;
    // Should objects in the scene be clickable?
    // Yes:     true
    // No:      false
    let clickable = true;
    // Should connections between objects in the scene be visible?
    // Yes:     true
    // No:      false
    let showConnections = true;

    // Delta-time and variables to calculate delta-time.
    let dt = 0;
    let prevFrameTime = 0;
    let currFrameTime = 0;

    // A map with the star sign data. This will be defined at the start of
    // the scene through the function startScene(). For the scene to work this
    // should be an map of the form:
    //
    //      key     :   string - The name of the star sign.
    //
    //      value   :   number[] - A list of indices in the gaia list. The
    //                             length of this list should be a multiple
    //                             of 2. 2 of the indices each represent a
    //                             connection in the star sign.
    //
    let signs;
    // Key:     name of the star sign (string)
    // Value:   should this star sign be visible? (bool)
    let signsVisibility = new Map();

    // The sun of the current solar system. This should be of class Star.
    // The class Star is defined in celestial.js.
    let sun;
    // List of all the objects in the scene that should be rendered with
    // light and shadows. This list is also used to generate The
    // shadowMap-Cube (see renderShaded() and genShadowMap() in render.js).
    let shadedObjects = [];
    // List of all the objects in the background of the scene. These should
    // be of class BackgroundStar (see celestial.js) and represent the gaia
    // data (The stars around the scene).
    let backgroundObjects = [];
    // List of all the objects in the scene that should be selectable and
    // clickable. Objects in the scene are selected, if the mouse pointer
    // is on top of the object (for more information see genIdMap() in
    // render.js).
    let clickableObjects = [];
    // A map of all the connections. This includes connections that are not
    // visible in the current scene. The map has the form:
    //
    //      key     :   number - A index in the gaia list.
    //
    //      value   :   {number, [number, number, number]}[] -
    //                          A list of indices and colors. The length of the
    //                          list should be a multiple of 2. A combo of
    //                          index and color represent a connection between
    //                          the key and this index with the color.
    //
    let connectedObjects = new Map();
    // List of all the Connector objects in the scene (for a definition of
    // the class Connector see celestial.js). (except star sign connections)
    let connectors = [];
    // List of all the Connector objects in the scene, that make up the
    // visible star signs.
    let signsConnectors = [];
    // List of all the objects in the scene that build orbits. These are either
    // of class StaticOrbit or Connector (see celestial.js for more information
    // (especially OrbitingObject.addStaticOrbit() and
    // OrbitingObject.addDynamicOrbit())).
    let orbits = [];

    /**
     * @typedef {[number, number, number]} position - position in
     *      xyz-coordinates
     * @typedef {[number, number, number]} color - color values in rgb
     */
    /**
     *
     * @param {![position[], color[], number[]]} gaiaVal - gaia data for the
     *      gaia list
     * @param {!Map<string, number[]>} signsVal - star sign data for the signs map
     */
    function startScene(gaiaVal, signsVal) {
        gaia = gaiaVal;
        signs = signsVal;
        // All the star signs should be invisible on startup.
        signs.forEach((val, key) => {
            signsVisibility.set(key, false);
        });
        // This builds the scene to represent our solar system.
        sunSystem();
        // This swaps the two canvases from the loading screen to the
        // webGL canvas. The function swapCanvas is defined in render.js.
        swapCanvas();
        // Make the UI visible;
        changeUiVisibility();
        // Start the scene. draw() is the main render loop of the scene.
        requestAnimationFrame(draw);
    }

    /**
     * This function builds the scene to represent our solar system.
     * The used classes and class-methods are defined in celestial.js.
     * It creates the objects and sets the lists needed for the scene
     * to be rendered.
     */
function sunSystem() {
        // Empty the backgroundObjects list and the connectors list.
        backgroundObjects = [];
        connectors = [];
        //if realistic mode disabled, use "old" arbitrary values for creating planets
        if (!getRealistic()) {
            // First define our sun.
            sun = new Star(
                getModel("sphere"),
                getTexture("sun"),
                [60, 60, 60],
                [1,1,1],
                1,
                gaia[0].length-1    // Index in the gaia list.
            );

            // Mercury.
            sun.addObject(
                getModel("sphere"),
                getTexture("mercury"),
                [0, 0, 130],        // Relative position to the sun.
                [2.4, 2.4, 2.4],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0 , 1, 0],
                [0, 0, 0],
                1,
                2
            ).addStaticOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.142186,0,0);

            // Venus.
            sun.addObject(
                getModel("sphere"),
                getTexture("venus"),
                [0, 0, 170],
                [6, 6, 6],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1,
                1
            ).addStaticOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(6.237109,0,0);

            // Earth.
            sun.addObject(
                getModel("sphere"),
                getTexture("earth"),
                [0, 0, 210],
                [6.3, 6.3, 6.3],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1,
                1
            ).addStaticOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.550698,0,0);

            // Our moon (Earth.addObject).
            sun.objects[sun.objects.length-1].addObject(
                getModel("sphere"),
                getTexture("moon"),
                [0, 0, -10],
                [2, 2, 2],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0.1, 1, 0],
                1,
                0.5
            ).addDynamicOrbit();

            // Mars.
            sun.addObject(
                getModel("sphere"),
                getTexture("mars"),
                [0, 0, 250],
                [3.3, 3.3, 3.3],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1,
                1
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.581241,0,0);

            // Jupiter.
            sun.addObject(
                getModel("sphere"),
                getTexture("jupiter"),
                [0, 0, 310],
                [20, 20, 20],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                0.3,
                0.5
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.196221,0,0);

            // Saturn.
            sun.addObject(
                getModel("sphere"),
                getTexture("saturn"),
                [0, 0, 370],
                [18, 18, 18],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                0.5,
                0.5
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.608119,0,0);

            // Uranus.
            sun.addObject(
                getModel("sphere"),
                getTexture("uranus"),
                [0, 0, 410],
                [9, 9, 9],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1,
                1
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(4.848001,0,0);

            // Neptune.
            sun.addObject(
                getModel("sphere"),
                getTexture("neptune"),
                [0, 0, 450],
                [8.5, 8.5, 8.5],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1,
                1
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.63587,0,0);
        //if realistic mode enabled, use scaled values for sizes, distances, axial tilt, rotation- and orbit times
        } else{
            // First define our sun.
            sun = new Star(
                getModel("sphere"),
                getTexture("sun"),
                [14.25 , 14.25, 14.25],
                [1,1,1],
                1,
                gaia[0].length-1    // Index in the gaia list.
            );

            // Mercury.
            sun.addObject(
                getModel("sphere"),
                getTexture("mercury"),
                [0, 0, 34.3],        // Relative position to the sun.
                [0.5, 0.5, 0.5],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0 , 1, 0],
                [0, 0, 0],
                0.02,
                1.59
            ).addStaticOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.142186,0,0);

            // Venus.
            sun.addObject(
                getModel("sphere"),
                getTexture("venus"),
                [0, 0, 39.3],
                [1.24, 1.24, 1.24],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                0.01,
                1.18
            ).addStaticOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(6.237109,0,0);

            // Earth.
            sun.addObject(
                getModel("sphere"),
                getTexture("earth"),
                [0, 0, 43.4],
                [1.31, 1.31, 1.31],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1,
                1
            ).addStaticOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.550698,0,0);

            // Our moon (Earth.addObject).
            sun.objects[sun.objects.length-1].addObject(
                getModel("sphere"),
                getTexture("moon"),
                [0, 0, -2],
                [0.36, 0.36, 0.36],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0.1, 1, 0],
                1,
                0.01
            ).addDynamicOrbit();

            // Mars.
            sun.addObject(
                getModel("sphere"),
                getTexture("mars"),
                [0, 0, 51.3],
                [0.69, 0.69, 0.69],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                0.95,
                0.81
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.581241,0,0);

            // Jupiter.
            sun.addObject(
                getModel("sphere"),
                getTexture("jupiter"),
                [0, 0, 106.4],
                [14.33, 14.33, 14.33],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0], //[3, 1, -0.3]
                [0, 0, 0],
                2.5,
                0.44
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.196221,0,0);

            // Saturn.
            sun.addObject(
                getModel("sphere"),
                getTexture("saturn"),
                [0, 0, 171.5],
                [11.93, 11.93, 11.93],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                2.3,
                0.33
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.608119,0,0);

            // Uranus.
            sun.addObject(
                getModel("sphere"),
                getTexture("uranus"),
                [0, 0, 308.5],
                [5.2, 5.2, 5.2],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1.4,
                0.23
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(4.848001,0,0);

            // Neptune.
            sun.addObject(
                getModel("sphere"),
                getTexture("neptune"),
                [0, 0, 480],
                [5.01, 5.01, 5.01],
                basicMaterials.all,
                [1,1,1],
                [1,1,1],
                1,
                [0, 1, 0],
                [0, 0, 0],
                1.5,
                0.18
            ).addDynamicOrbit();

            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(3.63587,0,0);

        }

        // Get all the new objects and their orbits.
        const objects = sun.getObjects();
        // These new objects should be shaded with the sun as the light source.
        shadedObjects = [sun].concat(objects[0]);
        // Also fill the list of orbits.
        orbits = objects[1];
        
        // Fill the list of backgroundObjects with BackgroundStars
        // (celestial.js) representing the stars in the gaia dataset.
        let position;
        let velo_data;
        let direction;
        for (let i = 0; i < gaia[0].length-1; i++) {
            // Compute the new position relative to the sun.
            position = vec3.clone(gaia[0][i]);
            //Add velo_data
            velo_data = gaia[3][i];
            // Scale the position.
            vec3.scale(position, position, 20);
            // Add a constant distance in the direction of the
            // position vector to clear the area around the new sun.
            direction = vec3.clone(position);
            vec3.normalize(direction, direction);
            vec3.scale(direction, direction, 2000);
            vec3.add(position, position, direction);
            // Add the new BackgroundStar (celestial.js) to the
            // list of backgroundObjects.
            backgroundObjects.push(new BackgroundStar(
                gaia[4][i],
                cam,
                position,
                velo_data,
                [gaia[2][i], gaia[2][i], gaia[2][i]],
                gaia[1][i],
                1,
                i
            ));
        }
        // Temporary copy of the connectedObjects map.
        const conMap = new Map(connectedObjects);
        // Recalculate the connections and the connectedObjects map.
        // Connections to and from the current sun are not added as a
        // Connector, but are stored in the connectedObjects map.
        connectedObjects = new Map();
        for (let [star1, stars] of conMap.entries()) {
            for (let i = 0; i < stars.length; i = i + 2) {
                // If the current sun is not involved, add a new Connector
                // between the two objects with the color in the map entry.
                // Else, create a entry for star1.index or add star2.index
                // and the color to the existing entry.
                if (star1 != sun.index && stars[i] != sun.index) {
                    addConnector(star1, stars[i+1]);
                    addConnector(stars[i], stars[i+1]);
                } else if (connectedObjects.get(star1) === undefined) {
                    connectedObjects.set(star1, [stars[i], stars[i+1]]);
                } else {
                    connectedObjects.get(star1).push(stars[i], stars[i+1]);
                }
            }
        }
        // Recalculate the connections for the visible star signs.
        calcSignsConnections();
    }
    
    /**
     * This function is the main render loop of the scene.
     * All objects are updated and the needed lists are filled.
     * The render functions are then called.
     */
    function draw() {
        // Calculate delta-time.
        currFrameTime = performance.now();
        dt = currFrameTime - prevFrameTime;
        prevFrameTime = currFrameTime;

        // Update the camera.
        if (camUpdate) {
            cam.update(dt);
        }

        // Update the objects in the scene.
        if (!getPause()) {
            sun.update(dt, getSpeed() / 100); // GetSpeed is defined in ui.js.
        }

        // Update Background-Stars
        // (Done by Eric)
        if(!getPauseStars()) {
            updateMillennium(dt, getStarsSpeed());
            for(let i = 0; i < backgroundObjects.length; i++) {
                backgroundObjects[i].update(dt, getStarsSpeed());
                updateSignsConnections();
            }
        }
        
        // The sun and the orbits around it should be
        // rendered solid with ambient colors only.
        solidObjects = [sun].concat(orbits);
        // If the connections are visible, they should
        // also be rendered solid.
        if (showConnections) {
            solidObjects = solidObjects
                .concat(connectors)
                .concat(signsConnectors);
        }
        // Add all the BackgroundStars to the list of solidObjects, that
        // are currently visible to the camera.
        const position = vec3.create();
        for (let i = 0; i < backgroundObjects.length; i++) {
            // Vector from camera to the object.
            vec3.sub(
                position,
                backgroundObjects[i].position,
                cam.position
            );
            // If the angle between this vector and the viewing direction
            // of the camera is within the visible range, the object is added
            // to the list.
            if (vec3.angle(cam.z, position) < 45 * Math.PI / 180) {
                solidObjects.push(backgroundObjects[i]);
            }
        }

        // Generate the shadow cube map for the objects that
        // will be rendered shaded,
        if (shadedObjects.length > 0) {
            genShadowMap([sun].concat(sun.getObjects()[0]));
        }

        // All objects in the scene should be clickable.
        // Call selectObject in render.js.
        if (clickable) {
            clickableObjects = shadedObjects.concat(solidObjects);
            selectObject(clickableObjects, cam);
        }

        // Finally, render all the objects to the canvas.
        if (solidObjects.length + shadedObjects.length > 0) {
            render(solidObjects, shadedObjects, cam);
        }

        // Requests the next loop iteration.
        requestAnimationFrame(draw);
    }
    
    // Getter function for the map of the connected objects.
    function getConnectedObjects() {
        return connectedObjects;
    }
    
    // Helper variable for addConnector.
    let star1 = null;
    /**
     * This function adds a Connector object (celestial.js) between a given
     * backgroundObject and star1. If Star1 == null, the given object is set
     * as Star1 instead.
     * @param {!number} index - index of the object to be connected
     *      in the gaia list
     * @param {![number, number, number]} color - color of the connection
     *      that should be added in rgb [0,1]
     */
    function addConnector(index, color) {
        // Convert the gaia index to the index in the backgroundObjects list.
        // This is needed, because the current sun is not in the list of
        // backgroundObjects. Save the object in the backgroundObjects list
        // as s.
        let s;
        if (index > sun.index) {
            s = backgroundObjects[index-1];
        } else {
            s = backgroundObjects[index];
        }
        // If star1 is currently null, save the object s as star1 and return.
        // If the saved object is the same as s, also return, because a object
        // can not be connected to itself.
        // If there is already a connection between the two objects, reset
        // star1 and return.
        // Else, the function adds s.index and the color to the map entry of
        // star1.index and create the Connector between the two objects.
        if (star1 == null) {
            star1 = s;
            return;
        } else if (s == star1) {
            return;
        } else if (
            // If there is a index for s.index in the map entry of star1.index,
            // there already exists a connection between star1 and s.
            (
                connectedObjects.get(star1.index) !== undefined
                &&
                connectedObjects.get(star1.index).indexOf(s.index) != -1
            )
            ||
            // If there is a index for star1.index in the map entry of s.index,
            // there also already exists a connection between star1 and s.
            (
                connectedObjects.get(s.index) !== undefined
                &&
                connectedObjects.get(s.index).indexOf(star1.index) != -1
            )
        ) {
            star1 = null;
            return;
        } else if (connectedObjects.get(star1.index) !== undefined) {
            // Add to the entry, if a entry for star1.index exists.
            connectedObjects.get(star1.index).push(s.index, color);
        } else {
            // Create a new entry, if no entry for star1.index exists.
            connectedObjects.set(star1.index, [s.index, color]);
        }
        // Add the new Connector to the list of connectors.
        connectors.push(new Connector(
            star1, 
            s,
            15, 
            color,
            1
        ));
        // Reset star1.
        star1 = null;
    }
    
    /**
     * This function removes a given Connector object from the scene.
     * @param {!Connector} c - object to be removed
     */
    function removeConnector(c) {
        // If obj2.index is in the map entry of obj1.index, remove it and the
        // color of the connection.
        if (
            connectedObjects.get(c.obj1.index) !== undefined
            &&
            connectedObjects.get(c.obj1.index).indexOf(c.obj2.index) != -1
        ) {
            connectedObjects.get(c.obj1.index).splice(
                connectedObjects.get(c.obj1.index).indexOf(c.obj2.index),
                2
            );
        }
        // If obj1.index is in the map entry of obj2.index, remove it and the
        // color of the connection.
        if (
            connectedObjects.get(c.obj2.index) !== undefined
            &&
            connectedObjects.get(c.obj2.index).indexOf(c.obj1.index) != -1
        ) {
            connectedObjects.get(c.obj2.index).splice(
                connectedObjects.get(c.obj2.index).indexOf(c.obj1.index),
                2
            );
        }
        // Remove the Connector from the list of connectors.
        connectors.splice(connectors.indexOf(c),1);
    }
    
    /**
     * This function swaps the current solar system.
     * It uses a given index i to build a scene around the i-th object
     * in the gaia list.
     * @param {!number} index - index of the new sun in the gaia list
     */
    function swapStar(index){
        // Set the camera to not update anymore.
        camUpdate = false;
        // Set all objects so that they are neither clickable nor selectable.
        clickable = false;
        unselectObject(); // Make sure nothing is selected anymore.
        // Set all connections to be invisible.
        showConnections = false;

        swapStarAsync(index); // Call async version.
    }

    /**
     * Async function to skip a given amount of time.
     * @param {!number} milliseconds - time to skip in milisec
     * @returns {!Promise} returns a Promise that is resolved after
     *      the given amount of time
     */
    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
    /**
     * Async version of swapStar. This is called by swapStar.
     * The function uses a given index i to swap the current solar system
     * and build a scene around the i-th object in the gaia list.
     * It generates random objects that orbit the new sun.
     * It is async so it can use the async sleep function.
     * (Partly Done by Eric)
     * @param {!number} index - index of the new sun in the gaia list
     */
    async function swapStarAsync(index) {
        // Get the new sun in the current background by converting the
        // gaia list index to backgroundObjects index.
        let newSun;
        if (index > sun.index) {  
            newSun = backgroundObjects[index-1];
        } else {  
            newSun = backgroundObjects[index];
        }

        // Set a new texture for the new sun.
        let tex = getTexture("sun");
        // Apply the new texture to the new sun in the current background.
        newSun.updateTexture(tex);

        // Slowly rotate the camera towards the new sun:

        // Get the normal vector from the camera to the new sun.
        let relPosition = vec3.create();
        vec3.sub(relPosition, newSun.position, cam.position);
        vec3.normalize(relPosition, relPosition);
        // Get the angle between this vector and the direction
        // the camera is looking at.
        let angle = vec3.angle(relPosition, cam.z);
        // Get the axis to rotate the view direction of the camera around.
        const axis = vec3.create();
        vec3.cross(axis, cam.z, relPosition);
        // Rotation matrix gets calculated inside the while loop.
        const rotMat = mat4.create();
        // While the camera is not looking directly at the new sun,
        // rotate the view direction towards the new sun.
        while (angle > 0.001 * Math.PI / 180) {
            // Recalculate the new angle. This is done inside the loop for a
            // smoother animation (fast at the beginning, slower towards
            // the new sun).
            angle = vec3.angle(relPosition, cam.z)/5;
            // Recalculate the rotation matrix. This is done inside the loop,
            // because the angle changes.
            mat4.fromRotation(rotMat, angle, axis);
            // Transform the view direction of the camera.
            vec3.transformMat4(cam.z, cam.z, rotMat);
            // Sleep for 10 milliseconds.
            await sleep(10);
        }

        // Slowly zoom the camera into the new sun:

        // While the camera is not fully zoomed in.
        while (cam.angle > 0.001 * Math.PI / 180) {
            // The angle is multiplied for a smoother animation.
            cam.angle *= 0.85;
            // Sleep for 1 millisecond.
            await sleep(1);
        }

        // Finalize the current camera (removes the event listener) and
        // replace it with a new one.
        cam.finalize();
        cam = new ControllableCamera(
            getCanvas(),
            [0, 200, -200],
            [0, 0, 1],
            [0, 1, 0],
            0.001 * Math.PI / 180   // The camera will still be zoomed in.
        );

        // Build the new scene:
        // If the index belongs to our sun, call sunSystem.
        // Else build a randomized scene around the new sun.
        if (index == gaia[0].length-1) {
            sunSystem();
            // Make sure the texture matches.
            sun.updateTexture(tex);
        } else {
            // if realistic mode disabled, use "old" arbitrary values
            if(!getRealistic()) {
                // Create the new sun.
                        sun = new Star(
                            getModel("sphere"),
                            tex,
                            [60, 60, 60],
                            [1,1,1],    //newSun.ambColor
                            1,
                            index
                        );
                // The amount of objects to orbit the new sun.
                    let amount = Math.round(Math.random() * 5) + 3; // Min: 3 | Max: 8
                    // Minimal distance between the new objects.
                    let minDist = 130;
                    // Create the orbiting objects.
                    let dist;
                    let scale;
                    for (let i = 0; i < amount; i++) {
                        // Distance from the sun.
                        // Min: minDist * (i + 1) | Max: Min + 50
                        dist = Math.random() * 50 + minDist * (i + 1);
                        // Scale of the new object.
                        scale = Math.random() * 30 + 10; // Min: 10 | Max: 40
                        // Add the new orbiting object.
                        sun.addObject(
                            getModel("sphere"),
                            randTexture(),
                            [0, 0, dist],
                            [scale, scale, scale],
                            basicMaterials.all,
                            [0,0,0],
                            [0,0,0],
                            1,
                            [
                                // Angular momentum. Min: 0 | Max: 2
                                Math.random() * 2,
                                Math.random() * 2,
                                Math.random() * 2
                            ],
                            [
                                // Rotation amount. Min: 0 dec | Max: 5 dec
                                Math.random() * 5
                                *
                                // Rotation direction (1 or -1).
                                Math.pow(-1, Math.round(Math.random())),
                                Math.random() * 5
                                *
                                Math.pow(-1, Math.round(Math.random())),
                                Math.random() * 5
                                *
                                Math.pow(-1, Math.round(Math.random()))
                            ],
                            Math.random() * 1 + 0.5, // rotSpeed. Min: 0.5 | Max: 1.5
                            Math.random() * 2 + 1,   // orbitSpeed Min: 0.5 | Max: 2.5
                        ).addDynamicOrbit(); // Add the orbit.

                        // Decide randomly, if the new object should have a moon.
                        if (Math.round(Math.random()) == 1) {
                            sun.objects[sun.objects.length-1].addObject(
                                getModel("sphere"),
                                randTexture(),
                                // Match the relative position of the moon
                                // to the scaling of the object.
                                [0, 0, 1.5 * scale],
                                // Match the scaling of the moon to the
                                // scaling of the object.
                                [scale/10, scale/10, scale/10],
                                basicMaterials.all,
                                [Math.random(), Math.random(), Math.random()],
                                [Math.random(), Math.random(), Math.random()],
                                1,
                                [
                                    // Angular momentum. Min: 0 | Max: 2
                                    Math.random() * 2,
                                    Math.random() * 2,
                                    Math.random() * 2
                                ],
                                [
                                    // Rotation amount. Min: 0 dec | Max: 20 dec
                                    Math.random() * 20
                                    *
                                    // Rotation direction (1 or -1).
                                    Math.pow(-1, Math.round(Math.random())),
                                    Math.random() * 20
                                    *
                                    Math.pow(-1, Math.round(Math.random())),
                                    Math.random() * 20
                                    *
                                    Math.pow(-1, Math.round(Math.random()))
                                ],
                                // rotSpeed. Min: 0.5 | Max: 1.5
                                Math.random() * 1 + 0.5,
                                // orbitSpeed Min: 1 | Max: 3
                                Math.random() * 2 + 1
                            ).addDynamicOrbit(); // Add the orbit.
                        }
                    }
            /*
            * If realistic mode enabled, use more realistic values for creating the random planetary system
            * This includes:
            * randomizing star class
            * depending on that, randomize amount and type of possible planets
            */
            }else {
                //The sizes, planets and classes arrays are used to select the correct textures by name
                let sizes = ["large","medium","small"];
                let planets = ["gasBlack_","gasBlue_","gasOrange_","gasPink_","gasPurple_","stone_","ice_","iceWater_","waterLand_","lavaRock_"];
                let classes = ["O","B","A","F","G","K","M"];
                // randomize star class
                let classId = Math.round(Math.random() * 6);
                // randomize star size, this effects the texture chosen
                let starSize = Math.round(Math.random());
                // randomize the chosen texture
                let textureId = Math.round(Math.random()) + 1;
                // create a small star with "small texture"
                if (starSize == 0 ) {
                    let starTexture = getTexture("class" + classes[classId] + "Star_small_" + textureId);
                    sun = new Star(
                          getModel("sphere"),
                          starTexture,
                          [10, 10, 10],
                          [1,1,1],
                          1,
                          index
                          );
                // create a large star with "large texture"
                } else {
                    let starTexture = getTexture("class" + classes[classId] + "Star_large_" + textureId);
                    sun = new Star(
                          getModel("sphere"),
                          starTexture,
                          [15, 15, 15],
                          [1,1,1],
                          1,
                          index
                          );
                }
                    // The amount of objects to orbit the new sun.
                    // the "higher" the class and therefore larger the star (in reality) the less planets
                    let amount = Math.round(Math.random() * 2) + Math.round(classId / 2); // Min: 0 | Max: 8
                    // start value for the distance from the star that a planet is created at
                    let lastDistance = 20;

                    //create the planets
                    for (let i = 0; i < amount; i++) {
                        //high star classes only get gas giants
                        if (classId < 4) {
                            //increase distance by random factor
                            lastDistance = lastDistance * (1.5 + (Math.round(Math.random() * 10) / 20));
                            // chose random texture
                            let planetId = Math.round(Math.random() * 4);
                            // chose random planet size
                            let planetSize = Math.round(Math.random() * 2);
                            // select correct texture
                            let planetTexture = getTexture(planets[planetId] + sizes[planetSize]);
                            //add the object
                            sun.addObject(
                                getModel("sphere"),
                                //texture
                                planetTexture,
                                //position
                                [0,0,lastDistance],
                                //size, depending on size chosen for the planet
                                [3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1)],
                                basicMaterials.all,
                                [1,1,1],
                                [1,1,1],
                                1,
                                //rotate around Y-Axis
                                [0,1,0],
                                //orbital tilt, randomized
                                [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                // rotation speed, randomized
                                1 + Math.round(Math.random() * 2),
                                // orbital speed, randomized but slower the further away
                                1 + Math.random() - 0.2 * i
                            ).addDynamicOrbit();
                            //axial tilt, randomized
                            sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);

                            //create a moon
                            if (Math.round(Math.random()) == 1) {
                                // randomize texture
                                let moonTexVar = Math.round(Math.random() * 2) + 1;
                                // select "type" of texture, stone or ice
                                let moonTexId = Math.round(Math.random()) + 5;
                                // select correct texture
                                let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                // randomize size
                                let moonScale = Math.round(Math.random() * 2) + 1;

                                sun.objects[sun.objects.length-1].addObject(
                                    getModel("sphere"),
                                    //texture
                                    moonTexture,
                                    // position, using planet size to make sure planet doesnt "swallow" moon
                                    [0,0,3 + 6 * (planetSize + 1)],
                                    // size of the moon
                                    [moonScale, moonScale, moonScale],
                                    basicMaterials.all,
                                    [1,1,1],
                                    [1,1,1],
                                    1,
                                    //rotates around Y-Axis
                                    [0,1,0],
                                    // orbital tilt, randomized
                                    [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                    //rotation speed, randomized
                                    0.3 + Math.random(),
                                    //orbit speed, randomized
                                    0.1 + Math.random()
                                ).addDynamicOrbit();

                            }

                        // "lower" star classes can get all types of planet
                        }else {
                            lastDistance = lastDistance * (1.5 + (Math.round(Math.random() * 10) / 20));
                            //hot planet, distance smaller than 40
                            if (lastDistance < 40) {
                                // terrestrial planet
                                if (Math.random() < 0.4) {
                                    let planetSize = Math.round(Math.random() * 2);
                                    let planetVar = Math.round(Math.random()*2) + 1;
                                    // randomize texture type, stone or lavaRock
                                    let planetId = (Math.round(Math.random()) * 4) + 5;
                                    let planetTexture = getTexture(planets[planetId] + sizes[planetSize] + "_" + planetVar);
                                    sun.addObject(
                                        getModel("sphere"),
                                        planetTexture,
                                        [0,0,lastDistance],
                                        [1 + planetSize,1 + planetSize,1 + planetSize],
                                        basicMaterials.all,
                                        [1,1,1],
                                        [1,1,1],
                                        1,
                                        [0,1,0],
                                        [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                        0.5 + Math.random(),
                                        1.4 + Math.random()/2 - 0.15 * i
                                    ).addDynamicOrbit();
                                    sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);
                                    //create a moon
                                    if (Math.round(Math.random()*3) == 2) {
                                        let moonTexVar = Math.round(Math.random() * 2) + 1;
                                        let moonTexId = Math.round(Math.random()) + 5;
                                        let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                        let moonScale = Math.random()/2 + 0.5;
                                        sun.objects[sun.objects.length-1].addObject(
                                            getModel("sphere"),
                                            moonTexture,
                                            [0,0,3 + 4 * (planetSize + 1)],
                                            [moonScale, moonScale, moonScale],
                                            basicMaterials.all,
                                            [1,1,1],
                                            [1,1,1],
                                            1,
                                            [0,1,0],
                                            [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                            0.3 + Math.random(),
                                            0.1 + Math.random()
                                        ).addDynamicOrbit();

                                    }
                                // gas giant
                                }else {
                                    let planetId = Math.round(Math.random() * 4);
                                    let planetSize = Math.round(Math.random() * 2);

                                    let planetTexture = getTexture(planets[planetId] + sizes[planetSize]);
                                    sun.addObject(
                                        getModel("sphere"),
                                        planetTexture,
                                        [0,0,lastDistance],
                                        [3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1)],
                                        basicMaterials.all,
                                        [1,1,1],
                                        [1,1,1],
                                        1,
                                        [0,1,0],
                                        [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                        1 + Math.round(Math.random() * 2),
                                        1 + Math.random() - 0.2 * i
                                    ).addDynamicOrbit();
                                    sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);

                                    //create a moon
                                    if (Math.round(Math.random()) == 1) {
                                        let moonTexVar = Math.round(Math.random() * 2) + 1;
                                        let moonTexId = Math.round(Math.random()) + 5;
                                        let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                        let moonScale = Math.round(Math.random() * 2) + 1;

                                        sun.objects[sun.objects.length-1].addObject(
                                            getModel("sphere"),
                                            moonTexture,
                                            [0,0,2 + 5 * (planetSize + 1)],
                                            [moonScale, moonScale, moonScale],
                                            basicMaterials.all,
                                            [1,1,1],
                                            [1,1,1],
                                            1,
                                            [0,1,0],
                                            [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                            0.3 + Math.random(),
                                            0.1 + Math.random()
                                        ).addDynamicOrbit();

                                    }
                                }
                            // goldilocks zone, distance between 40 and 50
                            }else if (lastDistance < 50) {
                                // terrestrial planet
                                if (Math.random() < 0.4) {
                                    let planetSize = Math.round(Math.random() * 2);
                                    let planetVar = Math.round(Math.random()*2) + 1;
                                    //randomize texture type, stone, ice, iceWater, waterLand or lavaRock
                                    let planetId = (Math.round(Math.random()*4)) + 5;
                                    let planetTexture = getTexture(planets[planetId] + sizes[planetSize] + "_" + planetVar);
                                    sun.addObject(
                                        getModel("sphere"),
                                        planetTexture,
                                        [0,0,lastDistance],
                                        [1 + planetSize,1 + planetSize,1 + planetSize],
                                        basicMaterials.all,
                                        [1,1,1],
                                        [1,1,1],
                                        1,
                                        [0,1,0],
                                        [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                        0.5 + Math.random(),
                                        1.4 + Math.random()/2 - 0.15 * i
                                    ).addDynamicOrbit();
                                    sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);
                                    //create a moon
                                    if (Math.round(Math.random()*3) == 2) {
                                        let moonTexVar = Math.round(Math.random() * 2) + 1;
                                        let moonTexId = Math.round(Math.random()) + 5;
                                        let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                        let moonScale = Math.random()/2 + 0.5;
                                        sun.objects[sun.objects.length-1].addObject(
                                            getModel("sphere"),
                                            moonTexture,
                                            [0,0,3 + 4 * (planetSize + 1)],
                                            [moonScale, moonScale, moonScale],
                                            basicMaterials.all,
                                            [1,1,1],
                                            [1,1,1],
                                            1,
                                            [0,1,0],
                                            [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                            0.3 + Math.random(),
                                            0.1 + Math.random()
                                        ).addDynamicOrbit();

                                    }
                                //gas giant
                                }else {
                                    let planetId = Math.round(Math.random() * 4);
                                    let planetSize = Math.round(Math.random() * 2);

                                    let planetTexture = getTexture(planets[planetId] + sizes[planetSize]);
                                    sun.addObject(
                                        getModel("sphere"),
                                        planetTexture,
                                        [0,0,lastDistance],
                                        [3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1)],
                                        basicMaterials.all,
                                        [1,1,1],
                                        [1,1,1],
                                        1,
                                        [0,1,0],
                                        [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                        1 + Math.round(Math.random() * 2),
                                        1 + Math.random() - 0.2 * i
                                    ).addDynamicOrbit();
                                    sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);

                                    //create a moon
                                    if (Math.round(Math.random()) == 1) {
                                        let moonTexVar = Math.round(Math.random() * 2) + 1;
                                        //randomize moon texture type, stone, ice, iceWater, waterLand or lavaRock
                                        let moonTexId = Math.round(Math.random() * 4) + 5;
                                        let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                        let moonScale = Math.round(Math.random() * 2) + 1;

                                        sun.objects[sun.objects.length-1].addObject(
                                            getModel("sphere"),
                                            moonTexture,
                                            [0,0,2 + 5 * (planetSize + 1)],
                                            [moonScale, moonScale, moonScale],
                                            basicMaterials.all,
                                            [1,1,1],
                                            [1,1,1],
                                            1,
                                            [0,1,0],
                                            [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                            0.3 + Math.random(),
                                            0.1 + Math.random()
                                        ).addDynamicOrbit();

                                    }
                                }
                            // cold planet, distance larger than 50
                            }else {
                                // terrestrial planet
                                if (Math.random() < 0.2) {
                                    let planetSize = Math.round(Math.random() * 2);
                                    let planetVar = Math.round(Math.random()*2) + 1;
                                    //randomize planet texture type, stone or ice
                                    let planetId = (Math.round(Math.random())) + 5;
                                    let planetTexture = getTexture(planets[planetId] + sizes[planetSize] + "_" + planetVar);
                                    sun.addObject(
                                        getModel("sphere"),
                                        planetTexture,
                                        [0,0,lastDistance],
                                        [1 + planetSize,1 + planetSize,1 + planetSize],
                                        basicMaterials.all,
                                        [1,1,1],
                                        [1,1,1],
                                        1,
                                        [0,1,0],
                                        [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                        0.5 + Math.random(),
                                        1.4 + Math.random()/2 - 0.15 * i
                                    ).addDynamicOrbit();
                                    sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);
                                    //create a moon
                                    if (Math.round(Math.random()*3) == 2) {
                                        let moonTexVar = Math.round(Math.random() * 2) + 1;
                                        let moonTexId = Math.round(Math.random()) + 5;
                                        let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                        let moonScale = Math.random()/2 + 0.5;
                                        sun.objects[sun.objects.length-1].addObject(
                                            getModel("sphere"),
                                            moonTexture,
                                            [0,0,3 + 4 * (planetSize + 1)],
                                            [moonScale, moonScale, moonScale],
                                            basicMaterials.all,
                                            [1,1,1],
                                            [1,1,1],
                                            1,
                                            [0,1,0],
                                            [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                            0.3 + Math.random(),
                                            0.1 + Math.random()
                                        ).addDynamicOrbit();

                                    }
                                // gas giant
                                }else {
                                    let planetId = Math.round(Math.random() * 4);
                                    let planetSize = Math.round(Math.random() * 2);

                                    let planetTexture = getTexture(planets[planetId] + sizes[planetSize]);
                                    sun.addObject(
                                        getModel("sphere"),
                                        planetTexture,
                                        [0,0,lastDistance],
                                        [3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1),3 + 2 * (planetSize + 1)],
                                        basicMaterials.all,
                                        [1,1,1],
                                        [1,1,1],
                                        1,
                                        [0,1,0],
                                        [(-0.5 + Math.random())* 5, 0, (-0.5+Math.random()) * 5],
                                        1 + Math.round(Math.random() * 2),
                                        1 + Math.random() - 0.2 * i
                                    ).addDynamicOrbit();
                                    sun.objects[sun.objects.length-1].rotateObjectSpaceAxis(Math.random() * 3.14,0,0);

                                    //create a moon
                                    if (Math.round(Math.random()) == 1) {
                                        let moonTexVar = Math.round(Math.random() * 2) + 1;
                                        //randomize moon texture type, stone or ice
                                        let moonTexId = Math.round(Math.random()) + 5;
                                        let moonTexture = getTexture(planets[moonTexId]+ "small_" + moonTexVar);
                                        let moonScale = Math.round(Math.random() * 2) + 1;

                                        sun.objects[sun.objects.length-1].addObject(
                                            getModel("sphere"),
                                            moonTexture,
                                            [0,0,2 + 5 * (planetSize + 1)],
                                            [moonScale, moonScale, moonScale],
                                            basicMaterials.all,
                                            [1,1,1],
                                            [1,1,1],
                                            1,
                                            [0,1,0],
                                            [(-0.5 + Math.random())* 10, 0, (-0.5+Math.random()) * 10],
                                            0.3 + Math.random(),
                                            0.1 + Math.random()
                                        ).addDynamicOrbit();

                                    }
                                }
                            }
                        }

                    }
            }
            // Update the lists needed for rendering:

            // Get the shaded objects and their orbits.
            let objects = sun.getObjects();
            shadedObjects = [sun].concat(objects[0]);
            orbits = objects[1];
            // Reset the list of connectors.
            connectors = [];
            // Fill the list of backgroundObjects with BackgroundStars
            // (celestial.js) representing the stars in the gaia dataset
            // with the new sun as the origin.
            backgroundObjects = [];
            // Position of the new sun.
            const origin = vec3.clone(gaia[0][index]);
            let position;
            let velo_data;
            let direction;
            for (let i = 0; i < gaia[0].length; i++) {
                if(i != index) {
                    // Compute the new position relative to the sun.
                    position = vec3.clone(gaia[0][i]);
                    velo_data = gaia[3][i];
                    vec3.sub(position, position, origin);
                    // Scale the position.
                    vec3.scale(position, position, 20);
                    // Add a constant distance in the direction of the
                    // position vector to clear the area around the new sun.
                    direction = vec3.clone(position);
                    vec3.normalize(direction, direction);
                    vec3.scale(direction, direction, 2000);
                    vec3.add(position, position, direction);
                    // Add the new BackgroundStar (celestial.js) to the
                    // list of backgroundObjects.
                    backgroundObjects.push(new BackgroundStar(
                        gaia[4][i],
                        cam,
                        position,
                        velo_data,
                        [gaia[2][i], gaia[2][i], gaia[2][i]],
                        gaia[1][i],
                        1,
                        i
                    ));
                }
            }
            // Temporary copy of the connectedObjects map.
            const conMap = new Map(connectedObjects);
            // Recalculate the connections and the connectedObjects map.
            // Connections to and from the current sun are not added as a
            // Connector, but are stored in the connectedObjects map.
            connectedObjects = new Map();
            for (let [star1, stars] of conMap.entries()) {
                for (let i = 0; i < stars.length; i += 2) {
                    // If the current sun is not involved, add a new Connector
                    // between the two objects with the color in the map entry.
                    // Else, create a entry for star1.index or add star2.index
                    // and the color to the existing entry.
                    if (star1 != index && stars[i] != index) {
                        addConnector(star1, stars[i+1]);
                        addConnector(stars[i], stars[i+1]);
                    } else if (connectedObjects.get(star1) === undefined) {
                        connectedObjects.set(star1, [stars[i],stars[i+1]]);
                    } else {
                        connectedObjects.get(star1).push(stars[i], stars[i+1]);
                    }
                }
            }
        }
        // Recalculate the connections for the visible star signs.
        calcSignsConnections();

        // Zoom out the camera:

        // While the camera is not fully zoomed out.
        while (cam.angle < 45 * Math.PI / 180) {
            // The angle is multiplied for a smoother animation.
            cam.angle *= 1.15;
            // Sleep for 1 millisecond.
            await sleep(1);
        }
        // Correct the angle.
        cam.angle = 45 * Math.PI / 180;

        // Set the camera to update again.
        camUpdate = true;
        // Make the objects in the scene selectable / clickable again.
        clickable = true;
        // Turn the connections visible again.
        showConnections = true;
    }
    
    /**
     * Getter function for the sun of the current scene.
     * @returns {Star} returns the sun
     */
    function getSun() {
        return sun;
    }

    /**
     * Getter function for the gaia list.
     * @returns returns the gaia list
     */
    function getGaia() {
        return gaia;
    }

    function getCam() {
        return cam;
    }

    //Only updates Positions. Does NOT update selected Star Sign Connections
    function updateSignsConnections() {
        signsConnectors.forEach((connector) => {
            connector.updatePositions();
        });
    }

    /**
     * This function recalculates the connections between the visible
     * star signs. The function sets the signsConnectors list.
     * (Partly Done by Eric)
     */
    function calcSignsConnections() {
        // Reset signsConnectors.
        signsConnectors = [];
        // Foreach star sign that is visible.
        signsVisibility.forEach((val, key) => {
            if (val) {
                // Get all connections for the star sign with the name <key>.
                const list = signs.get(key);
                // Add a Connector for every connection that does not involve
                // the current sun.
                let index1;
                let index2;
                for (let i = 0; i < list.length; i += 2) {
                    // Get the indices for the Connector.
                    index1 = list[i];
                    index2 = list[i+1];
                    // Only add the Connector, if the indices do not match the
                    // index of the sun.
                    if (index1 != sun.index && index2 != sun.index) {
                        // Recalculate the indices in the
                        // backgroundObjects list.
                        if (index1 > sun.index) {
                            index1 -= 1;
                        }
                        if (index2 > sun.index) {
                            index2 -= 1;
                        }
                        // Add the Connector.
                        const newConnector = new Connector(
                            backgroundObjects[index1],
                            backgroundObjects[index2],
                            15,
                            [0.4, 0.1, 0.9],
                            1
                        );
                        // Make the Connector not clickable.
                        newConnector.keyClick = function () {};
                        // Change the selection function of the Connector.
                        newConnector.select = function () {
                            vec3.scale(this.scale, this.scale, 4);
                            this.scale[1] /= 4;
                        };
                        // Change the unselect function of the Connector.
                        newConnector.unselect = function () {
                            vec3.scale(this.scale, this.scale, 1/4);
                            this.scale[1] *= 4;
                        }
                        // Push the Connector to the signsConnector list.
                        signsConnectors.push(newConnector);

                        //ToDo: Check Connector Clickability
                    }
                }
            }
        });
    }

    /**
     * This function changes the visibility of a given star sign.
     * @param {!string} name - name of the star sign that should be changed
     */
    function changeSigns(name) {
        // Change the visibility.
        signsVisibility.set(name, !signsVisibility.get(name));
        // Recalculate the connections between the visible star signs.
        calcSignsConnections();
    }
}
