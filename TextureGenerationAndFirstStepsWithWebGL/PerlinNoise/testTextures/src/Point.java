public class Point {
    private double x = 0;
    private double y = 0;
    private double z = 0;

    public Point() {
    }
    public Point(double x_, double y_, double z_) {
        this.x = x_;
        this.y = y_;
        this.z = z_;
    }
    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getZ() {
        return z;
    }

    public Point fade() {
        return new Point(fadeValue(x), fadeValue(y), fadeValue(z));
    }

    private double fadeValue(double t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    public Point times(double d) {return new Point(this.x * d, this.y * d, this.z *2);}



}
