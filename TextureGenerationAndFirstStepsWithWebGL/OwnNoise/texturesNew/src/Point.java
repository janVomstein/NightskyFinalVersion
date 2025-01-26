import java.util.concurrent.ThreadLocalRandom;

public class Point {

        //this class represents a point in 3-dimensional space and provides utility functions to work with points

        //the points coordinates
        private double x;
        private double y;
        private double z;

        //constructors
        public Point(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        public Point() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }

        //this function is used to round the coordinates of the point to integers
        public void round() {
            int xn = (int)this.x;
            this.x = xn;
            int yn = (int)this.y;
            this.y = yn;
            int zn = (int)this.z;
            this.z = zn;
        }

    //Getters for the coordinates
    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getZ() {
        return z;
    }

    //this function calculates the point of the next step when calculating the turbulence value
    public Point getNextPoint() {
            double newX = Math.pow(this.x, 2) / (Math.abs(this.x) + 1) ;
            double newY = Math.pow(this.y, 2) / (Math.abs(this.y) + 1) ;
            double newZ = Math.pow(this.z, 2) / (Math.abs(this.z) + 1) ;
            return new Point(newX, newY, newZ);
    }

    //this function checks, whether the point equals another point
    //this is done by checking whether the coordinates are equal
    public boolean equals(Point other) {
            return this.x == other.getX() && this.y == other.getY() && this.z == other.getZ();
    }

    //this function randomizes the points coordinates within a given boundary
    public void randomizeBetween(int start, int end) {
            int range = (end - start) * 10;
            this.x = (Math.abs(ThreadLocalRandom.current().nextInt() % range) / 10.0) + start;
            this.y = (Math.abs(ThreadLocalRandom.current().nextInt() % range) / 10.0) + start;
            this.z = (Math.abs(ThreadLocalRandom.current().nextInt() % range) / 10.0) + start;
        }

        //this function calculates the distance between the point and another point
        public double getDistanceTo(Point other) {
            return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2) + Math.pow(other.z - this.z, 2));
        }

        //a debug function that prints the points informations to the console
        public void print() {
            System.out.println("Point (" + x + ", " + y + ", " + z + ")");
        }
    }


