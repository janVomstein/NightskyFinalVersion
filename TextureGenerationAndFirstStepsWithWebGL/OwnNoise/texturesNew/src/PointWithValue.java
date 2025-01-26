import java.util.concurrent.ThreadLocalRandom;

public class PointWithValue extends Point{

    //this class is an extension of the normal point
    //additionally it contains a value, these points are used as value points in the noise function

    //the points value
    private double value;

    //constructors
    public PointWithValue(double x, double y, double z, double value) {
        super(x,y,z);
        this.value = value;
    }
    public PointWithValue() {
        super();
        this.value = 0;
    }

    //this function randomizes the value of the point
    //for this it choses a random value from the range: [0;0.25;0.5;0.75;1]
    public void randomizeValue() {
        double random = Math.abs(ThreadLocalRandom.current().nextDouble()) % 1;
        if(random < 0.2) {
            this.value = 0;
        }
        else if (random < 0.4){
            this.value = 0.25;
        }
        else if (random < 0.6){
            this.value = 0.5;
        }
        else if (random < 0.8){
            this.value = 0.75;
        }
        else {
            this.value = 1;
        }
    }

    //Getter function for the points value
    public double getValue(){
        return this.value;
    }
}
