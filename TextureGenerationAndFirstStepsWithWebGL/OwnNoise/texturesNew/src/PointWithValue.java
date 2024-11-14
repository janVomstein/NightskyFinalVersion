import java.util.concurrent.ThreadLocalRandom;

public class PointWithValue extends Point{
    private double value;

    public PointWithValue(double x, double y, double z, double value) {
        super(x,y,z);
        this.value = value;
    }
    public PointWithValue() {
        super();
        this.value = 0;
    }

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

    public double getValue(){
        return this.value;
    }
}
