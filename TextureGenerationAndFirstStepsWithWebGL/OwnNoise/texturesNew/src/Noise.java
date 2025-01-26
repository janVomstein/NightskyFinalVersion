import java.util.ArrayList;
import java.util.List;

public class Noise {
    //this class represens the noise function

    //old method of storing points with value
    //now used to store important points for every calculation
    private List<PointWithValue> points = new ArrayList<>();

    //the size of the image space
    private int boundary;
    //the number of points with value
    private int numberOfPoints;
    //the maximum distance after which value points are no longer used when calculating the noise value
    private double maxDistance;

    //new method of storing points with value
    private PointStorageManager storageManager;

    //constructor
    public Noise(int boundary, int numberOfPoints, double maxDistance) {
        this.boundary = boundary;
        this.numberOfPoints = numberOfPoints;
        this.maxDistance = maxDistance;
        //creates storage manager
        this.storageManager = new PointStorageManager(boundary, numberOfPoints, maxDistance);
        //creates the points with value and stores them in the storage cubes
        storageManager.setupPoints();
        //old method of setting up points
        //setupPoints();
    }

    //this function was used with the old method to setup the points with value
    private void setupPoints() {
        for(int i = 0; i < numberOfPoints; i++) {
            PointWithValue p = setupPoint();
            while(pointExistsAlready(p)) {
                p = setupPoint();
            }
            points.add(p);

        }
    }

    //creates and randomizes the values of a point with value
    private PointWithValue setupPoint() {
        PointWithValue p = new PointWithValue();
        p.randomizeBetween(-boundary, boundary);
        p.randomizeValue();
        return p;
    }

    //test, whether a point already exists, done by checking whether the coordinates equal
    private boolean pointExistsAlready(PointWithValue p) {
        for(PointWithValue q : points) {
            if(p.equals(q)) {
                return true;
            }
        }
        return false;
    }

    //this function calculates and returns the noise value at a given point
    public double getNoiseValueAt(Point p) {
        //get needed points with value
        findClosestPoints(p);
        //calculate and return noise value
        return interpolate(p);
    }

    //this function is used to get the points with value needed to calculate the noise value
    private void findClosestPoints(Point p) {
        //old method, sort list of points by distance to pixel, too slow
        //points.sort((p1, p2) -> {return (int)Math.signum(p1.getDistanceTo(p) - p2.getDistanceTo(p));});

        //new method, use storageManager to get list of all important points
        points = storageManager.getImportantPointsForPoint(p);
    }

    //old method of calculating the noise, using just the 6 closest points
    private double interpolate_old(Point p) {
        double value = 0;
        for(int i = 0; i < 6; i++) {
            value += points.get(i).getValue() * weight(p.getDistanceTo(points.get(i)));
        }
        //using sine to bring sum to [0;1]
        value *= 2;
        value = (Math.sin(value) + 1) / 2;
        return value;

    }

    //new method of calculating the noise, using all points closer than maxDistance
    private double interpolate(Point p) {
        double value = 0;
        int i = 0;
        //for every important point
        for(PointWithValue pi : points) {
            //close enough?
            if (p.getDistanceTo(pi) < maxDistance) {
                //add value*weight to noise value, weight approaching 0 with distance approaching maxDistance
                value += pi.getValue() * Math.pow((maxDistance - p.getDistanceTo(pi)), 2);
            }
        }
        //use sine to bring value back to [0;1]
        value = (Math.sin(value) + 1) / 2;
        return value;


    }

    //function used to calculate the weight corresponding to a point with value, used in the old method
    private double weight(double distance) {
        return Math.pow(1 / (distance +1), 4);
    }
}
