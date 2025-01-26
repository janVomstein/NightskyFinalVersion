public class UnitPoint {

    //this class is used to represent points in 3-dimensional space. Each coordinate can only be an integer
    //it is used for the "value points" when calculating the perlin noise as well as
    //when working with colors to round the calculated RGB values

    //the points coordinates
    private int x = 0;
    private int y = 0;
    private int z = 0;

    //constructors
    public UnitPoint() {
    }
    public UnitPoint(double x_, double y_, double z_) {
        this.x = (int)x_;
        this.y = (int)y_;
        this.z = (int)z_;
    }
    public UnitPoint(Point p) {
        this.x = (int)p.getX();
        this.y = (int)p.getY();
        this.z = (int)p.getZ();

    }

    //Getters for the points coordinates

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getZ() {
        return z;
    }
}
