import java.util.ArrayList;
import java.util.List;

public class PointStorageManager {
    private int boundary;
    private int numberOfPoints;
    private double maxDistance;

    private List<List<List<StorageCube>>> storageCubes = new ArrayList<>();

    public PointStorageManager(int boundary, int numberOfPoints, double maxDistance) {
        this.boundary = boundary;
        this.numberOfPoints = numberOfPoints;
        this.maxDistance = maxDistance;
        setupStorageCubes();
    }

    private void setupStorageCubes() {
        int cubeNumber =(int) ((boundary * 2) / maxDistance) + 1;
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

    private StorageCube getStorageCubeForPoint(PointWithValue p) {
        int x = (int) ((p.getX() + (double)boundary) / maxDistance);
        int y = (int) ((p.getY() + (double)boundary) / maxDistance);
        int z = (int) ((p.getZ() + (double)boundary) / maxDistance);
        return storageCubes.get(x).get(y).get(z);
    }

    public void setupPoints() {
        for(int i = 0; i < numberOfPoints; i++) {
            PointWithValue p = setupPoint();
            StorageCube cube = getStorageCubeForPoint(p);
            while(cube.pointExistsAlready(p)) {
                p = setupPoint();
                cube = getStorageCubeForPoint(p);
            }
            cube.add(p);

        }
    }

    private PointWithValue setupPoint() {
        PointWithValue p = new PointWithValue();
        p.randomizeBetween(-boundary, boundary);
        p.randomizeValue();
        return p;
    }

    public List<PointWithValue> getImportantPointsForPoint(Point p) {
        List<StorageCube> importantCubes = getImportantCubesForPoint(p);
        List<PointWithValue> importantPoints = new ArrayList<>();
        for(StorageCube cube : importantCubes) {
            importantPoints.addAll(cube.getAllPoints());
        }
        return importantPoints;
    }

    private List<StorageCube> getImportantCubesForPoint(Point p) {
        int x = (int) ((p.getX() + (double)boundary) / maxDistance);
        int y = (int) ((p.getY() + (double)boundary) / maxDistance);
        int z = (int) ((p.getZ() + (double)boundary) / maxDistance);
        List<StorageCube> importantCubes = new ArrayList<>();
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
