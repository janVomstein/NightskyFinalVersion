import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class FileGenerator {
    //this class creates and fills an image using perlin noise

    //the noise
    private PerlinNoise pNoise;

    //the size of the image
    private int width;
    private int height;

    //the size of the internal coordinate system
    private double coordinateFrameX;
    private double coordinateFrameY;
    private double coordinateFrameZ;

    //the image
    private BufferedImage image;

    //constructor

    public FileGenerator(PerlinNoise p, int w, int h, double x, double y, double z) {
        this.pNoise = p;
        this.width = w;
        this.height = h;
        this.coordinateFrameX = x;
        this.coordinateFrameY = y;
        this.coordinateFrameZ = z;
        this.image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
    }

    //this function fills and prints the image with basic perlin noise
    public void generate() {
        fillImage();
        printImage();
    }

    //this function fills and prints the image with perlin nosie and turbulence
    public void generateTurbulence(String id) {
        fillImageTurbulence();
        printImage(id);
    }

    //this function fills and prints the image with perlin noise and octaves
    public void generateOctaves(int levels) {
        fillImageOctaves(levels, 0);
        printImage();
    }

    //this function fills and prints the image with perlin noise and octaves
    public void generateOctaves2(int levels) {
        fillImageOctaves2(levels, 0);
        printImage();
    }

    //this function fills and prints multiple images with perlin noise and octaves
    //"above" each other to create frames of an animation
    public void generateOctavesAnimation(int levels, int frames) {
        for(int frame = 0; frame < frames; frame++) {
            fillImageOctaves(levels, getZFromF(frame, frames));
            printImage(String.valueOf(frame));
        }
    }

    //this function fills and prints an image using a 3-dimensional checkerboard to test
    //the method of removing distortion
    public void generateSphereTest() {
        fillImageWithSphereTest();
        printImage();
    }

    //this function creates the image file
    private void printImage() {
        File f = new File("image.png");
        try {
            ImageIO.write(image, "PNG", f);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    //this function creates an image file with a specified name
    private void printImage(String name) {
        File f = new File("image_" + name +".png");
        try {
            System.out.println("saved image " + name);
            ImageIO.write(image, "PNG", f);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // this function fills the image with basic perlin noise by calculating the noise value for each pixel
    private void fillImage() {
        //for every pixel
        for(int i = 0; i<width; i++) {
            double x = getXFromI(i);
            for(int j = 0; j<height; j++) {
                double y = getYFromJ(j);
                //get perlin value at calculated coordinate
                double perlinValue = pNoise.perlin(new Point(x, y, 0));
                //get color value corresponding to noise value
                UnitPoint rgb = getRGBFromPV(perlinValue);
                //create and set thee color variable at the current pixel
                int col = (rgb.getX() << 16) | (rgb.getY() << 8) | rgb.getZ();
                image.setRGB(i, j, col);
            }
        }
    }

    //this function fills the image with perlin noise and octaves
    private void fillImageOctaves(int levels, double frame) {
        //for every pixel
        for(int i = 0; i<width; i++) {
            for(int j = 0; j<height; j++) {
                double perlinValue = 0;
                //add Octaves at different levels
                for(int l = 1; l<=levels; l++) {
                    //calculate new coordinate to increase frequency
                    double x = getXFromIAtLevel(i, l);
                    double y = getYFromJAtLevel(j, l);
                    //divide by a smaller and smaller number to decrease amplitude, add to the sum
                    perlinValue += (pNoise.perlin(new Point(x, y, frame))) * Math.pow(0.25, l - 1);
                }
                //divide by max possible number to bring result bck to [0;1]
                perlinValue = perlinValue / 1.5;
                UnitPoint rgb = getRGBFromPV(perlinValue);
                int col = (rgb.getX() << 16) | (rgb.getY() << 8) | rgb.getZ();
                image.setRGB(i, j, col);
            }
        }
    }

    ///this function fills the image with perlin noise and octaves using a different weight to decrease amplitude
    private void fillImageOctaves2(int levels, double frame) {
        for(int i = 0; i<width; i++) {
            for(int j = 0; j<height; j++) {
                double perlinValue = 0;
                for(int l = 1; l<=levels; l++) {
                    double x = getXFromIAtLevel(i, l);
                    double y = getYFromJAtLevel(j, l);
                    perlinValue += pNoise.perlin(new Point(x, y, frame)) * Math.pow(0.5, l-1);
                }
                perlinValue = perlinValue / 2;
                UnitPoint rgb = getRGBFromPV(perlinValue);
                int col = (rgb.getX() << 16) | (rgb.getY() << 8) | rgb.getZ();
                image.setRGB(i, j, col);
            }
        }
    }

    //this functions fills the image with perlin noise and turbulence
    private void fillImageTurbulence(){
        //for every pixel
        for(int i = 0; i<width; i++) {
            double x = getXFromI(i);
            for(int j = 0; j<height; j++) {
                double y = getYFromJ(j);
                //point on the surface of a sphere corresponding to current pixel
                Point c = getSpherePoint(i, j, 1);

                //perlin value at point on sphere
                double perlinValue = pNoise.perlin(c);

                //used to create a "square texture" with results in distortion
                //double perlinValue = pNoise.perlin(new Point(x, y, 0));

                //used to create striped textures for gas giants
                //double perlinValue = y;//

                //calculate turbulence value for point on sphere
                double turbulence = getTurbulenceValue(5,c.getX(),2*c.getY(),c.getZ());

                //calculate turbulence value for point in "square texture"
                //double turbulence = getTurbulenceValue(5, x, y, 0);

                //adding turbulence twice to perlin value (or y coordinate for stripes)
                perlinValue = perlinValue + 2 * turbulence;

                //using sine to bring result back to [0;1]
                perlinValue = Math.sin(perlinValue);
                perlinValue = 0.5 * (perlinValue + 1);

                UnitPoint rgb = getRGBFromPV(perlinValue);
                int col = (rgb.getX() << 16) | (rgb.getY() << 8) | rgb.getZ();
                image.setRGB(i, j, col);
            }
        }
    }

    //this function is used to fill the image space with a 3 dimensional checkerboard to
    //test methodd of creating textures without distortion

    private void fillImageWithSphereTest() {
        //for every pixel
        for(int i = 0; i<width; i++) {
            for (int j = 0; j < height; j++) {
                //get corresponding point on sphere
                Point c = getSpherePoint(i, j, 3);
                //add rounded coordinates of point
                int v = (int)c.getX() + (int)c.getY() + (int)c.getZ();
                UnitPoint rgb;
                //if uneven white
                if(v % 2 == 1) {
                    rgb = new UnitPoint(255, 255, 255);
                }
                //else black
                else {
                    rgb = new UnitPoint(0, 0, 0);
                }
                int col = (rgb.getX() << 16) | (rgb.getY() << 8) | rgb.getZ();
                image.setRGB(i, j, col);
            }
        }
    }

    //this function is used to calculate the Turbulence value
    private double getTurbulenceValue(int steps, double x, double y, double z) {
        double t = 0;
        Point p = new Point(x,y,z);
        //for a given number of steps
        for(int i = 0; i<steps; i++) {
            //add noise value, with amplitude decreasing every step
            t += (pNoise.perlin(p) * 2 - 1) / Math.pow(2, i);
            //increase frequency
            p = p.times(2);
        }
        return t/2;
    }

    //this function is used to fade a double using a polynomial
    private double fadeValue(double t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    //this function is used to calculate the X-coordinate in image space representing the current pixel
    private double getXFromI(int i) {
        return i * (coordinateFrameX / (double) width);
    }

    //this function is used to calculate the Y-coordinate in image space representing the current pixel
    private double getYFromJ(int j) {
        return j * (coordinateFrameY / (double) height);
    }

    //this function is used to calculate the point on a sphere representing the current pixel
    //this is used to remove distortion
    private Point getSpherePoint(int i,int j, double radius) {
        double angleX = 360 / (double)width * i;
        double angleY = 180 / (double) height * j;
        angleX = Math.toRadians(angleX);
        angleY = Math.toRadians(angleY);
        double px, py, pz;
        px = (radius * Math.cos(angleX) * Math.sin(angleY)) + (coordinateFrameX / 2);
        py = (radius * Math.sin(angleX) * Math.sin(angleY)) + (coordinateFrameY / 2);
        pz = (radius * Math.cos(angleY)) + (coordinateFrameZ / 2);
        return new Point(px, py, pz);
    }

    //this function is used to calculate the Z coordinate representing the current frame
    //when creating frames of an animation
    private double getZFromF(int f, int max) {
        return f * (coordinateFrameZ / (double) max);
    }

    //this function is used to calculate the X coordinate used to calculate the noise value
    //at a given level when using Octaves

    private double getXFromIAtLevel(int i, int level) {
        return i * (level * coordinateFrameX / (double) width);
    }

    //this function is used to calculate the Y coordinate used to calculate the noise value
    //at a given level when using Octaves
    private double getYFromJAtLevel(int j, int level) {
        return j * (level * coordinateFrameY / (double) height);
    }

    //This function is used to select the function used to map the noise value to a color
    private UnitPoint getRGBFromPV(double pv) {
        //return gradientBlackWhite(pv);
        return gradientIce(pv);
        //return gradientGasStripes(pv);
        //return gradientWaterLand(pv);
        //return gradientLavaRock(pv);
        //return gradientAsteroid(pv);
        //return gradientFire(pv);
    }

    /*
    *functions that map the noise values to different color gradients
    */

    //a gradient resulting in a simple black and white image
    private UnitPoint gradientBlackWhite(double pv) {
        double rgb = pv * 255;
        return new UnitPoint(rgb, rgb, rgb);
    }

    //a gradient resulting in a fiery texture
    private UnitPoint gradientFire(double pv) {
        double r = 0;
        double g = 0;
        double b = 0;
        pv *= 3;
        pv -= 0.35;
        if(pv < 0) {pv = 0;}
        if (pv < 1) {
            r = pv * 255;
        } else {
            r = 255;
            pv -= 1;
            if (pv < 1) {
                g = pv * 255;
            } else {
                g = 255;
                pv -= 1;
                b = pv * 255;
            }
        }
        return new UnitPoint(r, g, b);

    }

    //a function that returns a single R- G- or B-value between a start and an end value
    //representing the "position" of the noise value in [0;1]
    //used to make it easier to change the gradients

    private double getRGBValueBetween(double start, double end, double pv) {
        double diff = end - start;
        diff *= pv;
        return start + diff;
    }

    //a gradient that results in an image with blue water and green land
    private UnitPoint gradientWaterLand(double pv) {
        double r = 0;
        double g = 0;
        double b = 0;
        double switchValue = 0.8;
        if (pv < switchValue) {
            r = getRGBValueBetween(37, 0, pv / switchValue);
            g = getRGBValueBetween(13, 219, pv / switchValue);
            b = 255;
            return new UnitPoint(r, g, b);
        }
        pv -= switchValue;
        r = getRGBValueBetween(31, 27, pv / (1- switchValue));
        g = getRGBValueBetween(171, 129, pv / (1- switchValue));
        b = getRGBValueBetween(66, 11, pv / (1- switchValue));
        return new UnitPoint(r, g, b);
    }

    //a gradient that results in an image with orange/red lava and gray rock
    private UnitPoint gradientLavaRock(double pv) {
        double r = 0;
        double g = 0;
        double b = 0;
        double switchValue = 0.7;
        if (pv < switchValue) {
            r = getRGBValueBetween(255, 141, pv / switchValue);
            g = getRGBValueBetween(226, 0, pv / switchValue);
            b = getRGBValueBetween(27, 0, pv / switchValue);
            return new UnitPoint(r, g, b);
        }
        pv -= switchValue;
        r = getRGBValueBetween(31, 84, pv / (1- switchValue));
        g = getRGBValueBetween(4, 74, pv / (1- switchValue));
        b = getRGBValueBetween(4, 68, pv / (1- switchValue));
        return new UnitPoint(r, g, b);
    }

    //a gradient that results in a gray, rocky texture
    private UnitPoint gradientAsteroid(double pv) {
        double r,g,b;
        if (pv < 0.3) {
            pv = pv / 0.3;
            r = getRGBValueBetween(42, 62, pv);
            g = getRGBValueBetween(42, 62, pv);
            b = getRGBValueBetween(42, 62, pv);
        }
        else if (pv < 0.55) {
            pv = (pv - 0.3) / 0.25;
            r = getRGBValueBetween(73, 93, pv);
            g = getRGBValueBetween(73, 93, pv);
            b = getRGBValueBetween(73, 93, pv);
        }
        else if (pv < 0.93) {
            pv = (pv - 0.55) / 0.38;
            r = getRGBValueBetween(109, 159, pv);
            g = getRGBValueBetween(109, 159, pv);
            b = getRGBValueBetween(109, 159, pv);
        }
        else {
            pv = (pv - 0.93) / 0.07;
            r = getRGBValueBetween(173, 193, pv);
            g = getRGBValueBetween(173, 193, pv);
            b = getRGBValueBetween(173, 193, pv);
        }
        return new UnitPoint(r, g, b);
    }

    //a gradient that results in a texture for an icy planet
    private UnitPoint gradientIce(double pv) {
        double r = 0;
        double g = 0;
        double b = 0;
        double switchValue = 0.65;
        if (pv < switchValue) {
            r = getRGBValueBetween(56, 200, pv / switchValue);
            g = getRGBValueBetween(81, 200, pv / switchValue);
            b = getRGBValueBetween(89, 200, pv / switchValue);
            return new UnitPoint(r, g, b);
        }
        if (pv < switchValue + 0.32) {
            r = getRGBValueBetween(230, 255, (pv- switchValue) / 0.32);
            g = getRGBValueBetween(230, 255, (pv- switchValue) / 0.32);
            b = getRGBValueBetween(230, 255, (pv- switchValue) / 0.32);
            return new UnitPoint(r, g, b);
        }

        //commented part used to create water holes in the ice
        /*pv -= (switchValue + 0.32);
        r = getRGBValueBetween(0, 12, pv / (1- switchValue -0.32));
        g = getRGBValueBetween(22, 43, pv / (1- switchValue -0.32));
        b = getRGBValueBetween(255, 124, pv / (1- switchValue -0.32));
        return new UnitPoint(r, g, b);*/

        pv -= (switchValue + 0.32);
        r = getRGBValueBetween(255, 255, pv / (1- switchValue -0.32));
        g = getRGBValueBetween(255, 255, pv / (1- switchValue -0.32));
        b = getRGBValueBetween(255, 255, pv / (1- switchValue -0.32));
        return new UnitPoint(r, g, b);
    }

    //a gradient used to color the striped textures for gas giants
    private UnitPoint gradientGasStripes(double pv) {
        double r,g,b;
        if (pv < 0.5) {
            pv = pv / 0.5;
            r = getRGBValueBetween(20, 51, pv);
            g = getRGBValueBetween(102, 187, pv);
            b = getRGBValueBetween(227, 255, pv);
        }
        else if (pv < 0.7) {
            pv = (pv - 0.5) / 0.2;
            r = getRGBValueBetween(51, 20, pv);
            g = getRGBValueBetween(187, 61, pv);
            b = getRGBValueBetween(255, 197, pv);
        }
        else {
            pv = (pv - 0.7) / 0.3;
            r = getRGBValueBetween(20, 0, pv);
            g = getRGBValueBetween(61, 37, pv);
            b = getRGBValueBetween(197, 133, pv);
        }
        return new UnitPoint(r,g,b);
    }
}
