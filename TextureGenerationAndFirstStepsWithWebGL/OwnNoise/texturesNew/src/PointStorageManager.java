import java.util.ArrayList;
import java.util.List;

public class PointStorageManager {

    //this class manages the point storage
    //it stores the storage cubes in a 3-dimensional array and provides utility functions
    //to access storage cubes and setup the storage in the beginning

    //the size of the image space
    private int boundary;
    //the amount of points with value used
    private int numberOfPoints;
    //the distance after which points are no longer included when calculating the noise
    //also used as edge length for the storage cubes
    private double maxDistance;

    //3-dimensional list of Storage cubes
    private List<List<List<StorageCube>>> storageCubes = new ArrayList<>();

    //constructor, sets the values for boundary, numberOfPoints and maxDistance
    //creates the Storage cubes and fill the list of cubes
    public PointStorageManager(int boundary, int numberOfPoints, double maxDistance) {
        this.boundary = boundary;
        this.numberOfPoints = numberOfPoints;
        this.maxDistance = maxDistance;
        setupStorageCubes();
    }

    //this function is used to create the storage cubes and fill the list of cubes
    private void setupStorageCubes() {
        //calculate number of cubes needed, boundary+1 in each direction from (0;0;0)
        //to avoid errors when trying to access neighbouring cubes
        int cubeNumber =(int) ((boundary * 2) / maxDistance) + 1;
        //create the cubes and "place" them in the cube list
        for (int i = 0; i < cubeNumber; i++) {
            List<List<StorageCube>> cubesY = new ArrayList<>();
            for (int j = 0; j < cubeNumber; j++) {
                List<StorageCube> cubesZ = new ArrayList<>();
                for (int k = 0; k < cubeNumber; k++) {
                    cubesZ.add(new StorageCube());
                }
                cubesY.add(cubesZ);
            }
            storageCubes.add(cubesY);
        }

    }

    //this functions returns the storage cube that corresponds to the position of a point
    private StorageCube getStorageCubeForPoint(PointWithValue p) {
        int x = (int) ((p.getX() + (double)boundary) / maxDistance);
        int y = (int) ((p.getY() + (double)boundary) / maxDistance);
        int z = (int) ((p.getZ() + (double)boundary) / maxDistance);
        return storageCubes.get(x).get(y).get(z);
    }

    //this function is used to setup the points with value in the beginning
    public void setupPoints() {
        //for every point needed
        for(int i = 0; i < numberOfPoints; i++) {
            //create the point
            PointWithValue p = setupPoint();
            //get the corresponding storage cube
            StorageCube cube = getStorageCubeForPoint(p);
            //test whether a point at these coordinates already exists, if yes, create another point
            while(cube.pointExistsAlready(p)) {
                p = setupPoint();
                cube = getStorageCubeForPoint(p);
            }
            //add the point to its storage cube
            cube.add(p);

        }
    }

    //this function is used to create a random point with value
    //it returns the created point
    private PointWithValue setupPoint() {
        //create point with value
        PointWithValue p = new PointWithValue();
        //randomize coordinates within image space
        p.randomizeBetween(-boundary, boundary);
        //randomize the points value
        p.randomizeValue();
        return p;
    }

    //this function is used to get all points within the 3x3x3 cube of storage cubes
    //with the cube containing the pixel in the center
    //it returns a list of these points
    //these are the only points that could influence the calculation of the noise value
    public List<PointWithValue> getImportantPointsForPoint(Point p) {
        //get 3x3x3 cube of storage cubes
        List<StorageCube> importantCubes = getImportantCubesForPoint(p);
        List<PointWithValue> importantPoints = new ArrayList<>();
        //merge points within these cubes into a single list
        for(StorageCube cube : importantCubes) {
            importantPoints.addAll(cube.getAllPoints());
        }
        return importantPoints;
    }

    //This function is used to get the 3x3x3 cube of storage cubes
    // with the cube containing the pixel in the center
    //it returns a list of these storage cubes
    private List<StorageCube> getImportantCubesForPoint(Point p) {
        //calculate internal position of center storage cube
        int x = (int) ((p.getX() + (double)boundary) / maxDistance);
        int y = (int) ((p.getY() + (double)boundary) / maxDistance);
        int z = (int) ((p.getZ() + (double)boundary) / maxDistance);
        List<StorageCube> importantCubes = new ArrayList<>();
        //select cubes around center cube and put them in a list
        for(int xi = (x-1); xi <= x+1; xi++) {
            for(int yi = (y-1); yi <= y+1; yi++) {
                for(int zi = (z-1); zi <= z+1; zi++) {
                    importantCubes.add(storageCubes.get(xi).get(yi).get(zi));
                }
            }
        }
        return importantCubes;
    }
}
