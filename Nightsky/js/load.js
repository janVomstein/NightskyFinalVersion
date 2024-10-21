{
    let greekLettersMap = new Map([
        ["tau", "\u03C4"],
        ["the", "\u03B8"],
        ["zet", "\u03B6"],
        ["alf", "\u03B1"],
        ["bet", "\u03B2"],
        ["kap", "\u03BA"],
        ["eps", "\u03B5"],
        ["gam", "\u03B3"],
        ["chi", "\u03C7"],
        ["sig", "\u03C3"],
        ["iot", "\u03B9"],
        ["pi.", "\u03C0"],
        ["rho", "\u03C1"],
        ["eta", "\u03B7"],
        ["lam", "\u03BB"],
        ["del", "\u03B4"],
        ["mu.", "\u03BC"],
        ["ksi", "\u03BE"],
        ["phi", "\u03C6"],
        ["omi", "\u03BF"],
        ["nu.", "\u03BD"],
        ["ups", "\u03C5"],
        ["ome", "\u03C9"],
        ["psi", "\u03C8"]
    ])

    // Load a text resource from a file over the network (stolen :3)
    function loadTextResource(url, callback) {
        let request = new XMLHttpRequest();
	    request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
	    request.onload = function () {
		    if (request.status < 200 || request.status > 299) {
			    callback(
                    'Error: HTTP Status ' 
                    + request.status 
                    + ' on resource ' 
                    + url
                );
		    } else {
			    callback(null, request.responseText);
		    }
	    };
	    request.send();
    }

    function loadImageResource(url, callback) {
        let request = new Image();
        request.onload = function () {
            callback(null, request);
        };
        request.src = url;
    }

    // These are used for the function loadResources(). The function loads
    // multiple files at once (also text and image files at the same time).
    // dataMap saves all the loaded results, where the key is the path and
    // the value is the result. count is the amount of files that should be
    // loaded, so the callback function of loadResources() gets called only
    // after all files have been loaded.
    const dataMap = new Map();
    let count = 0;
    /**
     * This function allows for multiple text and image files to be loaded at
     * once. The data gets saved to the dataMap via setDataMap(). The data can
     * be accessed through the function getDataMap(). After loading all files,
     * a callback function is called through setDataMap().
     * @param {!string[]} textFiles - a list of paths for all text files
     * @param {!string[]} imageFiles - a list of paths for all image files
     * @param {!function} callback  - callback function to be called
     */
    function loadResources(textFiles, imageFiles, callback) {
        // The amount of files that should be loaded.
        count = textFiles.length + imageFiles.length;
        // Load all text files and use setDataMap() to
        // insert the data into the map.
        textFiles.forEach(filename => {
            loadTextResource(filename, function (err, data) {
                if (err) {
                    alert('ERROR getting data of file ' + filename);
                    console.error(err);
                }
                setDataMap(filename, data, callback);
            });
        });
        // Load all image files and use setDataMap() to
        // insert the images into the map.
        imageFiles.forEach(filename => {
            loadImageResource(filename, function (err, data) {
                if (err) {
                    alert('ERROR getting data of file ' + filename);
                    console.error(err);
                }
                setDataMap(filename, data, callback);
            });
        });
    }

    /**
     * This is a helper-function for the function loadResources(). This
     * function inserts the loaded data into the dataMap with a given key.
     * This function also gets the callback function from loadResources.
     * Every time the data of a file is inserted, this function counts down
     * the count. When the count hits 0 all files have been loaded and the
     * callback function is called.
     * @param {!string} key - key for the dataMap
     * @param {!(string | HTMLImageElement)} value - value for the dataMap
     * @param {!function} callback - callback function to be called
     */
    function setDataMap(key, value, callback) {
        // Set the dataMap.
        dataMap.set(key, value);
        // Countdown count.
        count--;
        // Call callback, if all files have been loaded.
        if (count == 0) {
            callback();
        }
    }

    /**
     * This is a getter-function for the dataMap.
     * @param {!string} key - key of the needed entry
     * @returns {!(string | HTMLImageElement)} returns the value
     */
    function getDataMap(key) {
        return dataMap.get(key);
    }

    /**
     * This function parses a .obj file given as a string and returns
     * a Float32Array with the vertex positions, normals and texture
     * coordinates from the file. The array has the form:
     * [
     *      position-x, position-y, position-z,     | vertex 1
     *      normal-x, normal-y, normal-z,           | vertex 1
     *      texture-x, texture-y,                   | vertex 1
     *      ...,                                    | vertex 2
     *      ...                                     | ...
     * ]
     * @param {!string} data - .obj file as a string
     * @returns {!Float32Array} returns the vertices array
     */
    function parseModelData(data) {
        // Array for all the vertex positions.
	    let positions = [];
        // Array for all vertex normals.
	    let normals = [];
        // Array for all vertex texture coordinates.
        let texCoords = [];
        // Array to be returned at the end.
	    let vertices = [];
        // Split the file into lines.
	    let lines = data.split("\n");
        // For every line in the file.
	    for (let i = 0; i < lines.length; i++) {
            // Split the line into individual words / numbers.
		    let parts = lines[i].trim().split(" ");
            // If the line starts with v, the line has vertex positions.
            // Else if the line starts with vn, the line has vertex normals.
            // Else if the line starts with vt, the line has vertex
            // texture coordinates.
            // Every line represents a vertex, but these are not sorted over
            // position, normal and texture coordinate.
            // Else if the line starts with f, the line has indices for the
            // positions, normals and texCoords arrays. These are sorted by
            // vertex.
		    if (parts[0] === "v") {
                // Add the position values of the line to the positions array.
			    positions.push(
				    parseFloat(parts[1]),
				    parseFloat(parts[2]),
				    parseFloat(parts[3])
			    );
		    } else if (parts[0] === "vn") {
                // Add the normal values of the line to the normals array.
			    normals.push(
				    parseFloat(parts[1]),
				    parseFloat(parts[2]),
				    parseFloat(parts[3])
			    );
            } else if (parts[0] === "vt") {
                // Add the texture coordinate values of the line to the
                // texCoords array.
                texCoords.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2])
                );
		    } else if (parts[0] === "f") {
                // For all parts of the line. Every part represents a vertex.
			    for (let j = 1; j < parts.length; j++) {
                    // Split the part into separate indices.
				    let indexParts = parts[j].split("/");
                    // index - 1 because the arrays start at 0 but the .obj
                    // file starts at 1.
				    let positionIndex = parseInt(indexParts[0]) - 1;
                    let texCoordIndex = parseInt(indexParts[1]) - 1;
                    let normalIndex = parseInt(indexParts[2]) - 1;
                    // Add the position of the vertex to the vertices array.
				    vertices.push(
					    positions[positionIndex * 3], 
					    positions[positionIndex * 3 + 1], 
					    positions[positionIndex * 3 + 2]
				    );
                    // Add the normal of the vertex to the vertices array.
                    vertices.push(
					    normals[normalIndex * 3], 
					    normals[normalIndex * 3 + 1], 
					    normals[normalIndex * 3 + 2]
				    );
                    // Add the texture coordinates of the vertex to the array.
                    vertices.push(
                        texCoords[texCoordIndex * 2],
                        texCoords[texCoordIndex * 2 + 1]
                    );
			    }
		    }
	    }
        // return the array of all vertices.
	    return new Float32Array(vertices);
    }

    /**
     * @typedef {![number,[number,number,number]][]} stars
     */
    /**
     * This function parses the data for the star signs. For this it needs
     * to files as strings: a list of all the stars needed for the star signs
     * and a list of all the connections between those stars.
     * The list of stars should be of form:
     *      HIP | RAJ2000 | DEJ2000 | distance | x | y | z | Vmag_viz
     *      ---------------------------------------------------------
     * The list of connections should be of form:
     *      number | From_HIP | To_HIP | Cst
     *      --------------------------------
     * This function returns the data of the stars and connections with an
     * array and 2 maps. They are returned in an array:
     * [
     *      star data:      [HIP, [position-x, position-y, position-z]]
     *      star sign map:  key  :  Name of the star sign.
     *                      value:  List of HIPs, where 2 of them should be
     *                              connected respectively.
     *      star map:       key  :  HIP of the star.
     *                      value:  List of star sign names, where the star is
     *                              a part of.
     * ]
     * @param {!string} data - list of stars
     * @param {!string} connectionData - list of connections
     * @returns {[stars, Map<string, number[]>, Map<number, string[]>]} returns
     *      the star and connection data
     */
    function parseStarSignData(data, connectionData) {
        const stars = [];   //List of all stars containing [HIP, [x, y, z], [v_x, v_y, v_z]]
        const sings = new Map();    //Map of all star signs to conns between stars Map<Cst, List<(HIP, HIP)>>
        const starMap = new Map();  //Map of all stars Map<HIP, Cst> e.g. (14135 -> Cet)
        // Split the list of connections into lines.
        let lines = connectionData.split("\n");
        // For every line of the list of connections.
        for (let i = 1; i < lines.length; i++) {
            // Split the line into its parts.
            let parts = lines[i].trim().split(",");
            // If both HIPs are not empty (there are
            // empty spots in the data that should be
            // skiped).
            if (parts[1] != "" && parts[2] != "") {
                // If this star sign is not in the star sign map yet, create
                // a new entry. Else, add the HIPs to the entry of the sign.
                if (sings.get(parts[3]) === undefined) {
                    sings.set(
                        parts[3], 
                        [parseFloat(parts[1]), parseFloat(parts[2])]
                    );
                } else {
                    sings.get(parts[3]).push(
                        parseFloat(parts[1]), parseFloat(parts[2])
                    );
                }
                // If the first HIP is not part of any sign yet, create a new
                // entry in the star map. Else add the sign to the entry.
                if (starMap.get(parseFloat(parts[1])) === undefined) {
                    starMap.set(parseFloat(parts[1]), [parts[3]]);
                } else {
                    starMap.get(parseFloat(parts[1])).push(parts[3]);
                }
                // If the second HIP is not part of any sign yet, create a new
                // entry in the star map. Else add the sign to the entry.
                if (starMap.get(parseFloat(parts[2])) === undefined) {
                    starMap.set(parseFloat(parts[2]), [parts[3]]);
                } else {
                    starMap.get(parseFloat(parts[2])).push(parts[3]);
                }
            }
        }
        lines = data.split('\n');
        for (let i = 1; i < lines.length; i++) {
            // Split the line into its parts.
            let parts = lines[i].trim().split(",");
            // If there is any sign, which this star is a part of, add it
            // to the array of stars. If there is no such sign, this star
            // is not needed and does not get added to the list of stars.
            if (starMap.get(parseFloat(parts[0])) !== undefined) {
                stars.push([
                    parseFloat(parts[0]),
                    //Push [x, y, z] (Positions)
                    [
                        parseFloat(parts[27]), 
                        parseFloat(parts[28]), 
                        parseFloat(parts[29])
                    ],
                    //Push [radius, DE, RA, RV, pmDE, pmRA] (Proper Motion Velocities in milli-arcsec, DE & RA in degrees)
                    //(Done by Eric)
                    [
                        parseFloat(parts[26]),
                        parseFloat(parts[7]),
                        parseFloat(parts[6]),
                        0.0,
                        parseFloat(parts[20]),
                        parseFloat(parts[19])
                    ],
                    //Push name_info [Trivial Name, Cst, Bayer Name]
                    //(Done by Eric)
                    [
                      parts[30],
                      parts[11],
                      bulkReplace(parts[10], greekLettersMap)
                    ]
                ]);
            }
        }
        // Return the data.
        return [stars, sings, starMap];
    }

    /**
    * This function parses the data for loading the textures.
    * @ToDo
    */

    function parseTextureData(data) {
        let names = [];
        let paths = [];
        let lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
            let parts = lines[i].trim().split(",");
            if (parts.length == 2) {
                names.push(parts[0]);
                paths.push(parts[1]);
            }
        }
        return [names, paths];
    }

    /**
     * @typedef {[number, number, number][]} positions
     * @typedef {[number, number, number][]} colors
     */
    /**
     * This function parses the gaia data given as a string.
     * The data should be of form:
     *      source_id | ra | dec | pseudocolour | bp_rp
     *      -------------------------------------------
     *      dist | gmag | x | y | z
     *      -----------------------
     * The function returns an array of all the position, color and
     * size values. The resulting array has the form:
     * [
     *      positions: [number, number, number][] - Positions of the
     *                                              objects in the dataset
     *                                              in xyz-coordinates.
     *      colors: [number, number, number][] - Colors of the objects
     *                                           in the dataset in rgb.
     *      sizes:  number[] - Scaling of the objects in the dataset in
     *                         xyz-direction. Only 1 number, because the
     *                         scaling is the same in all directions.
     * ]
     * @param {!string} data - gaia data as string
     * @returns {![positions, colors, number[]]} returns the values in an array
     */
    function parseStarData(data) {
        // Array of all positions.
	    let positions = [];
        // Array of all color values.
	    let colors = [];
      let sizes = [];
      let velo_info = [];
      let name_info = [];
	    let lines = data.split('\n');
	    for (let i = 1; i < lines.length; i++) {
		    let parts = lines[i].trim().split(',');
            let mag = parseFloat(parts[8]);
            let bp = parseFloat(parts[6]);
            let rp = parseFloat(parts[5]);
            let bp_rp = bp - rp;    //bp_rp is difference of bp and rp
            let r = Math.fround(
                mag
                +0.10979647*Math.pow(bp_rp, 1)
                -0.14579334*Math.pow(bp_rp, 2)
                +0.10747392*Math.pow(bp_rp, 3)
                -0.10635920*Math.pow(bp_rp, 4)
                +0.08494556*Math.pow(bp_rp, 5)
                -0.01368962*Math.pow(bp_rp, 6)
                );
            let g = Math.fround(
                mag
                -0.02330159*Math.pow(bp_rp, 1)
                +0.12884074*Math.pow(bp_rp, 2)
                +0.22149167*Math.pow(bp_rp, 3)
                -0.14550480*Math.pow(bp_rp, 4)
                +0.10635149*Math.pow(bp_rp, 5)
                -0.02363990*Math.pow(bp_rp, 6)
            );
            let b = Math.fround(
                mag
                -0.13748689*Math.pow(bp_rp, 1)
                +0.44265552*Math.pow(bp_rp, 2)
                +0.37878846*Math.pow(bp_rp, 3)
                -0.14923841*Math.pow(bp_rp, 4)
                +0.09172474*Math.pow(bp_rp, 5)
                -0.02594726*Math.pow(bp_rp, 6)

            );
            // Add position values for the object, if there is information
            // about its position in the gaia data. Missing position data
            // should be marked as "N/A" in the gaia data. If the data is
            // missing, we ignore the object. Else, we also add color and
            // size values.
            if (
                parts.length == 15
                && parts[7] != "N/A"
                && parts[8] != "N/A"
                && parts[9] != "N/A"
            ) {
                positions.push([
                    parseFloat(parts[12]),
                    parseFloat(parts[13]),
                    parseFloat(parts[14])
                ]);
                /**
                 * @todo This function does not compute RGB values in the
                 * range [0,1]. It only computes the RGB-magnitudes. Missing
                 * here is a way to get values in the range [0,1] from the
                 * magnitudes. Currently all objects are pretty bright,
                 * because nearly all magnitudes are larger than 5.
                 */
                colors.push([r/5, g/5, b/5]);
                // In its current version, this function assigns the same
                // size to all objects. One could for example change this
                // to size objects smaller the further they are away from
                // the center.
                sizes.push(5);

                //(Done by Eric)
                let radius = parseFloat(parts[7]);   //Radius / Distance of object
                let de = parseFloat(parts[3]);       //declination of object in deg
                let ra = parseFloat(parts[2]);       //right ascension of object in deg

                let rv = parseFloat(parts[11]);       //radial velocity of object in mas/yr
                let pmra = parseFloat(parts[9]);     //proper motion right ascension in mas/yr
                let pmde = parseFloat(parts[10]);     //proper motion declination in mas/yr

                velo_info.push([radius, de, ra, rv, pmde, pmra])   //[radius, DE, RA, RV, pmDE, pmRA]
                name_info.push(["", "", ""]);                       //[Trivial Name, Cst, Bayer Name]
            }
        
	    }
        // Return the array of position, color, size, velo_info and name_info values.
        return [positions, colors, sizes, velo_info, name_info];
    }

  /**
   * Replaces all char-sequences in map's keys by map's values
   * inp_str is String which is a primitive and is thus copied
   * (Done by Eric)
   *
   * @param inp_str
   * @param map
   * @returns String
   */
    function bulkReplace(inp_str, map) {
      map.forEach((val, key) => {
        inp_str = inp_str.replace(key, val);
      });

      return inp_str;
    }
}
