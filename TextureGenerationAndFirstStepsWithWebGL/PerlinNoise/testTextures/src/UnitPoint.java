public class UnitPoint {
    private int x = 0;
    private int y = 0;
    private int z = 0;

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
