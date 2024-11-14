import java.util.ArrayList;
import java.util.List;

public class Noise {
    private List<PointWithValue> points = new ArrayList<>();
    private int boundary;
    private int numberOfPoints;

    private double maxDistance;

    private PointStorageManager storageManager;

    public Noise(int boundary, int numberOfPoints, double maxDistance) {
        this.boundary = boundary;
        this.numberOfPoints = numberOfPoints;
        this.maxDistance = maxDistance;
        this.storageManager = new PointStorageManager(boundary, numberOfPoints, maxDistance);
        storageManager.setupPoints();
        //setupPoints();
    }
    private void setupPoints() {
        for(int i = 0; i < numberOfPoints; i++) {
            PointWithValue p = setupPoint();
            while(pointExistsAlready(p)) {
                p = setupPoint();
            }
            points.add(p);

        }
    }
    private PointWithValue setupPoint() {
        PointWithValue p = new PointWithValue();
        p.randomizeBetween(-boundary, boundary);
        p.randomizeValue();
        return p;
    }
    private boolean pointExistsAlready(PointWithValue p) {
        for(PointWithValue q : points) {
            if(p.equals(q)) {
                return true;
            }
        }
        return false;
    }

    public double getNoiseValueAt(Point p) {
        findClosestPoints(p);
        return interpolate(p);
    }

    private void findClosestPoints(Point p) {
        //points.sort((p1, p2) -> {return (int)Math.signum(p1.getDistanceTo(p) - p2.getDistanceTo(p));});
        points = storageManager.getImportantPointsForPoint(p);
    }
    private double interpolate2(Point p) {
        double value = 0;
        for(int i = 0; i < 6; i++) {
            value += points.get(i).getValue() * weight(p.getDistanceTo(points.get(i)));
        }
        value *= 2;
        value = (Math.sin(value) + 1) / 2;
        //System.out.println(value);
        return value;

    }

    private double interpolate(Point p) {
        double value = 0;
        int i = 0;
        /*while(p.getDistanceTo(points.get(i)) < maxDistance) {
            value += points.get(i).getValue() * (2 - p.getDistanceTo(points.get(i)));
            i++;
        }*/
        for(PointWithValue pi : points) {
            if (p.getDistanceTo(pi) < maxDistance) {
                value += pi.getValue() * Math.pow((maxDistance - p.getDistanceTo(pi)), 2);
            }
        }
        //value /= 6;
        value = (Math.sin(value) + 1) / 2;
        //System.out.println(value);
        /*if(value >= 1) {
            return 0;
        }*/
        return value;


    }

    private double weight(double distance) {
        return Math.pow(1 / (distance +1), 4);
    }
}
