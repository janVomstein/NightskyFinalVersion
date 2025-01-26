import java.util.ArrayList;
import java.util.List;

public class StorageCube {

    //this class stores the value points and provides basic functions to work with them
    //it represents a cube in the image space and stores all points within that cube

    //the list of points within this cube
    private List<PointWithValue> points = new ArrayList<>();

    //add a new point
    public void add(PointWithValue p) {
        points.add(p);
    }

    //test, whether a point already exists in the list of points.
    //This is done by checking whether the coordinates are equal
    public boolean pointExistsAlready(PointWithValue p) {
        for(PointWithValue q : points) {
            if(p.equals(q)) {
                return true;
            }
        }
        return false;
    }

    //a Getter function for the list of points
    public List<PointWithValue> getAllPoints() {
        return points;
    }
}
