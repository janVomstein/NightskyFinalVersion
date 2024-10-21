//Global Data
let gaia;
let starSigns;

/**
* This initial function is called on startup.
* It loads needed text and image files and calls the function main()
* afterwards.
*/
function init() {
    // The list of needed text files.
    // New files can be added here if needed.
    let neededTextFiles = [
        './shader/idTexVS.glsl',
        './shader/idTexFS.glsl',
        './shader/shadowMapVS.glsl',
        './shader/shadowMapFS.glsl',
        './shader/renderSolidVS.glsl',
        './shader/renderSolidFS.glsl',
        './shader/renderShadedVS.glsl',
        './shader/renderShadedFS.glsl',
        './models/sphere.obj',
        './models/circle.obj',
        './models/cylinder.obj',
        './models/orbit.obj',
        './starData/GAIA_refined.csv',     //'./starData/TOP 10000 bright.csv with coordinates.csv.csv',
        './starData/conns_HIP.csv',
        './starData/stars(1).csv',
        './textures/textureData.csv'
    ];
    // The list of needed image files.
    // New files can be added here if needed.
    const neededImageFiles = [
        "./textures/2k_mercury.jpg",
        "./textures/2k_venus_atmosphere.jpg",
        "./textures/2k_earth_daymap.jpg",
        "./textures/2k_mars.jpg",
        "./textures/2k_jupiter.jpg",
        "./textures/2k_saturn.jpg",
        "./textures/2k_uranus.jpg",
        "./textures/2k_neptune.jpg",
        "./textures/2k_sun.jpg",
        "./textures/2k_moon.jpg",
        "./textures/ice_large_1.png",
        "./textures/ice_large_2.png",
        "./textures/ice_large_3.png",
        "./textures/ice_medium_1.png",
        "./textures/ice_medium_2.png",
        "./textures/ice_medium_3.png",
        "./textures/ice_small_1.png",
        "./textures/ice_small_2.png",
        "./textures/ice_small_3.png",
        "./textures/iceWater_large_1.png",
        "./textures/iceWater_large_2.png",
        "./textures/iceWater_large_3.png",
        "./textures/iceWater_medium_1.png",
        "./textures/iceWater_medium_2.png",
        "./textures/iceWater_medium_3.png",
        "./textures/iceWater_small_1.png",
        "./textures/iceWater_small_2.png",
        "./textures/iceWater_small_3.png",
        "./textures/lavaRock_large_1.png",
        "./textures/lavaRock_large_2.png",
        "./textures/lavaRock_large_3.png",
        "./textures/lavaRock_medium_1.png",
        "./textures/lavaRock_medium_2.png",
        "./textures/lavaRock_medium_3.png",
        "./textures/lavaRock_small_1.png",
        "./textures/lavaRock_small_2.png",
        "./textures/lavaRock_small_3.png",
        "./textures/stone_large_1.png",
        "./textures/stone_large_2.png",
        "./textures/stone_large_3.png",
        "./textures/stone_medium_1.png",
        "./textures/stone_medium_2.png",
        "./textures/stone_medium_3.png",
        "./textures/stone_small_1.png",
        "./textures/stone_small_2.png",
        "./textures/stone_small_3.png",
        "./textures/waterLand_large_1.png",
        "./textures/waterLand_large_2.png",
        "./textures/waterLand_large_3.png",
        "./textures/waterLand_medium_1.png",
        "./textures/waterLand_medium_2.png",
        "./textures/waterLand_medium_3.png",
        "./textures/waterLand_small_1.png",
        "./textures/waterLand_small_2.png",
        "./textures/waterLand_small_3.png",
        "./textures/gasBlack_large.png",
        "./textures/gasBlack_medium.png",
        "./textures/gasBlack_small.png",
        "./textures/gasBlue_large.png",
        "./textures/gasBlue_medium.png",
        "./textures/gasBlue_small.png",
        "./textures/gasOrange_large.png",
        "./textures/gasOrange_medium.png",
        "./textures/gasOrange_small.png",
        "./textures/gasPurple_large.png",
        "./textures/gasPurple_medium.png",
        "./textures/gasPurple_small.png",
        "./textures/gasPink_large.png",
        "./textures/gasPink_medium.png",
        "./textures/gasPink_small.png",
        "./textures/classOStar_large_1.png",
        "./textures/classOStar_large_2.png",
        "./textures/classOStar_small_1.png",
        "./textures/classOStar_small_2.png",
        "./textures/classBStar_large_1.png",
        "./textures/classBStar_large_2.png",
        "./textures/classBStar_small_1.png",
        "./textures/classBStar_small_2.png",
        "./textures/classAStar_large_1.png",
        "./textures/classAStar_large_2.png",
        "./textures/classAStar_small_1.png",
        "./textures/classAStar_small_2.png",
        "./textures/classFStar_large_1.png",
        "./textures/classFStar_large_2.png",
        "./textures/classFStar_small_1.png",
        "./textures/classFStar_small_2.png",
        "./textures/classGStar_large_1.png",
        "./textures/classGStar_large_2.png",
        "./textures/classGStar_small_1.png",
        "./textures/classGStar_small_2.png",
        "./textures/classKStar_large_1.png",
        "./textures/classKStar_large_2.png",
        "./textures/classKStar_small_1.png",
        "./textures/classKStar_small_2.png",
        "./textures/classMStar_large_1.png",
        "./textures/classMStar_large_2.png",
        "./textures/classMStar_small_1.png",
        "./textures/classMStar_small_2.png"

    ];
    // This function is defined in load.js. It loads the files specified by
    // the lists of needed text and image files. After loading the files,
    // this function calls the function main().
    loadResources(neededTextFiles, neededImageFiles, main);
}
/**
 * This function loads the shader programs, models, textures, gaia and star
 * sign data from the loaded text and image files. It also calls startScene()
 * in scene.js. This will build the scene and start rendering.
 */
function main() {
    // Load the shader programs. This function is defined in render.js.
    loadPrograms(
        getDataMap("./shader/idTexVS.glsl"),
        getDataMap("./shader/shadowMapVS.glsl"),
        getDataMap("./shader/renderSolidVS.glsl"),
        getDataMap("./shader/renderShadedVS.glsl"), // getDataMap() is defined
                                                    // in load.js.
        getDataMap("./shader/idTexFS.glsl"),
        getDataMap("./shader/shadowMapFS.glsl"),
        getDataMap("./shader/renderSolidFS.glsl"),
        getDataMap("./shader/renderShadedFS.glsl")
    );
    // Load the models. addModelFromPath() is defined in model.js.
    addModelFromPath("sphere", "./models/sphere.obj");
    addModelFromPath("circle", "./models/circle.obj");
    addModelFromPath("cylinder", "./models/cylinder.obj");
    addModelFromPath("orbit", "./models/orbit.obj");
    // Load the textures. addTextureFromPath() is defined in texture.js.
    // @ToDo
    const textureData = parseTextureData(getDataMap("./textures/textureData.csv"));
    for (let i = 0; i < textureData[0].length; i++) {
        addTextureFromPath(textureData[0][i],textureData[1][i]);
    }
    // Get gaia data. parseStarData() is defined in load.js. It returns the
    // gaia data in form of an array [positions, colors, sizes], where
    // positions, colors and sizes are arrays as well.
    gaia = parseStarData(getDataMap(
        "./starData/GAIA_refined.csv"
    ));
    // Get star sign data. parseStarSignData() is defined in load.js.
    // It returns the star sign data in form of an array
    // [stars, sings, sizes]. stars is an array. Each entry consists
    // of a HIP and the position of a star. sings is a map. The keys
    // are the abbreviation of the different star signs and the values
    //  are the HIPs of the stars in the star sign.
    const starSigns = parseStarSignData(
        getDataMap("./starData/stars(1).csv"),  // Data of the stars .
        getDataMap("./starData/conns_HIP.csv")  // Data of the connections.
    );
    const stars = starSigns[0];
    const signs = starSigns[1];
    const starMap = starSigns[2];

    for (let i = 0; i < stars.length; i++) {
        // The new index to be swapped with the HIP.
        const index = gaia[0].length;
        // Add the i-th star to the gaia data.
        gaia[0].push(stars[i][1]);          //Push position
        gaia[1].push([0.4, 0.1, 0.9]);    //Push color
        gaia[2].push(5);                    //Push scale for radius
        gaia[3].push(stars[i][2]);          //Push velocity
        gaia[4].push(stars[i][3]);          //Push names
        // Get all the star signs with the i-th star.
        const signsList = starMap.get(stars[i][0]);
        for (let j = 0; j < signsList.length; j++) {
            // Get the list of HIPs in the j-th star sign.
            const indexList = signs.get(signsList[j]);
            // Swap the HIP of the i-th star to the index.
            for (let k = 0; k < indexList.length; k++) {
                if (indexList[k] == stars[i][0]) {
                    indexList[k] = index;
                }
            }
        }
    }
    // Add our sun to the gaia data.
    gaia[0].push([0, 0, 0]);
    gaia[1].push([1,.5, 1, 1]);
    gaia[2].push(5);
    gaia[3].push([0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    gaia[4].push(["", "", ""]);
    // this function builds the scene and starts the render. It is defined
    // in scene.js.
    startScene(gaia, signs);
    initUI();
    // List of all the star sign abbreviations.
    const nameList = [];
    // Add the abbreviations.
    signs.forEach((val, key) => {
        nameList.push(key);
    });
    // Use the list of abbreviations to set the list of star signs in the ui.
    // starSignList() is defined in ui.js.
    starSignList(nameList);
}