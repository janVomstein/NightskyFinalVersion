import java.util.concurrent.ThreadLocalRandom;

public class Point {
        private double x;
        private double y;
        private double z;

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

        public void round() {
            int xn = (int)this.x;
            this.x = xn;
            int yn = (int)this.y;
            this.y = yn;
            int zn = (int)this.z;
            this.z = zn;
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

    public Point getNextPoint() {
            double newX = Math.pow(this.x, 2) / (Math.abs(this.x) + 1) ;
            double newY = Math.pow(this.y, 2) / (Math.abs(this.y) + 1) ;
            double newZ = Math.pow(this.z, 2) / (Math.abs(this.z) + 1) ;
            return new Point(newX, newY, newZ);
    }
    public boolean equals(Point other) {
            return this.x == other.getX() && this.y == other.getY() && this.z == other.getZ();
    }

    public void randomizeBetween(int start, int end) {
            int range = (end - start) * 10;
            this.x = (Math.abs(ThreadLocalRandom.current().nextInt() % range) / 10.0) + start;
            this.y = (Math.abs(ThreadLocalRandom.current().nextInt() % range) / 10.0) + start;
            this.z = (Math.abs(ThreadLocalRandom.current().nextInt() % range) / 10.0) + start;
        }



        public double getDistanceTo(Point other) {
            return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2) + Math.pow(other.z - this.z, 2));
        }

        public void print() {
            System.out.println("Point (" + x + ", " + y + ", " + z + ")");
        }
    }


