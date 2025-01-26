public class Point {

    //this class represents a point in 3-dimensional space
    //it stores the points coordinates and provides basic functions to work with these points

    // the points coordinat
    private double x = 0;
    private double y = 0;
    private double z = 0;

    //constructors

    public Point() {
    }
    public Point(double x_, double y_, double z_) {
        this.x = x_;
        this.y = y_;
        this.z = z_;
    }

    //Getters for the points coordinates
    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getZ() {
        return z;
    }

    //a function to fade the point, this is achieved by fading every coordinate using a function
    //this is used to make the resulting noise smoother and nicer to look at
    //it returns the result as a new point
    public Point fade() {
        return new Point(fadeValue(x), fadeValue(y), fadeValue(z));
    }

    // the function that fades a single coordinate using a polynomial
    private double fadeValue(double t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    //a function to multiply the point with a double d, this is achieved by multiplying each coordinate with d
    //it returns th result as a new point
    public Point times(double d) {return new Point(this.x * d, this.y * d, this.z *2);}



}
