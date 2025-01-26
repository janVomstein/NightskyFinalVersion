import java.util.ArrayList;
import java.util.List;

public class Main {

    //this class is used to run the program and edit the settings
    public static void main(String[] args) {
        System.out.println("Starting");
        ImageGenerator generator1 = new ImageGenerator(2*512,2*512,5,7,300);
        generator1.generate();


        System.out.println("Finished");
    }
}