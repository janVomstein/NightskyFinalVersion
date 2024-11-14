import java.util.ArrayList;
import java.util.List;

public class StorageCube {
    private List<PointWithValue> points = new ArrayList<>();

    public void add(PointWithValue p) {
        points.add(p);
    }

    public boolean pointExistsAlready(PointWithValue p) {
        for(PointWithValue q : points) {
            if(p.equals(q)) {
                return true;
            }
        }
        return false;
    }

    public List<PointWithValue> getAllPoints() {
        return points;
    }
}
