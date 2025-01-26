import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class ImageGenerator {

    //this class creates and fills the images using the noise function

    //the image size in pixels
    private int xPixel;
    private int yPixel;

    //the size of the image space
    private int imageSpaceRadius;

    //the radius of the sphere used to create images without distortion
    private int radius;

    //the number of points with value used in the noise function
    private int numberOfPoints;
    //the noise function
    private Noise noise;
    //the image
    private BufferedImage image;
    //the color mapper used to get the color from the noise value
    private ColorMapper colorMapper;

    //constructor
    public ImageGenerator(int xPixel,int yPixel,int radius, int imageSpaceRadius, int numberOfPoints) {
        this.xPixel = xPixel;
        this.yPixel = yPixel;
        this.radius = radius;
        this.imageSpaceRadius = imageSpaceRadius;
        this.numberOfPoints = numberOfPoints;
        this.noise = new Noise(imageSpaceRadius, numberOfPoints, 2);
        this.image = new BufferedImage(xPixel, yPixel, BufferedImage.TYPE_INT_RGB);
        this.colorMapper = new ColorMapper();
    }

    //function used to fill and print the image
    public void generate() {
        //fillImageBasic();
        fillImageTurbulence();
        printImage();
    }

    //function used to fill and print the image using a given name
    public void generate(String name) {
        fillImageBasic();
        //fillImageTurbulence();
        printImage(name);
    }

    //this function fills the image using the basic noise function
    private void fillImageBasic() {
        //for every pixel
        for(int x = 0; x < xPixel; x++) {
            for(int y = 0; y < yPixel; y++) {
                //calculate image coordinates from pixel coordinates
                double xCoord = (10.0 / (double)xPixel * (double)x) - 5.0;
                double yCoord = (10.0 / (double)yPixel * (double)y) - 5.0;
                double zCoord = 0;
                //get noise value
                double noiseValue = noise.getNoiseValueAt(new Point(xCoord,yCoord,zCoord));
                //simple black and white gradient
                Point rgb = (new Point(noiseValue * 255, noiseValue * 255, noiseValue * 255));
                rgb.round();
                //set color value for pixel
                int col = ((int)rgb.getX() << 16) | ((int)rgb.getY() << 8) | (int)rgb.getZ();
                image.setRGB(x, y, col);
            }
        }
    }

    //this function is used to fill the image with noise and turbulence
    private void fillImageTurbulence() {
        //for every pixel
        for(int x = 0; x < xPixel; x++) {
            for(int y = 0; y < yPixel; y++) {
                //old version, square texture with distortion
                /*double xCoord = (10.0 / (double)xPixel * (double)x) - 5.0;
                double yCoord = (10.0 / (double)yPixel * (double)y) - 5.0;
                double zCoord = 0;
                double noiseValue = noise.getNoiseValueAt(new Point(xCoord,yCoord,zCoord));
                double turbulenceValue = getTurbulenceValueAt(5, xCoord, yCoord, zCoord);*/

                //new version, spherical textures without distortion
                //get point on sphere corresponding to pixel
                Point circlePoint = getCirclePoint(x,y);
                //get noise value
                double noiseValue = noise.getNoiseValueAt(circlePoint);
                //get turbulence value
                double turbulenceValue = getTurbulenceValueAt(5, circlePoint.getX(), circlePoint.getY(), circlePoint.getZ());

                //add basic noise and turbulence, use sine to bring value back to [0;1]
                noiseValue = Math.sin(noiseValue + 3 * turbulenceValue);
                noiseValue = (noiseValue + 1) / 2;

                //simple black and white gradient
                /*Point rgb = (new Point(noiseValue * 255, noiseValue * 255, noiseValue * 255));
                rgb.round();*/

                //use color mapper to get color value from noise value
                Point rgb = colorMapper.getRGBForNoiseValue(noiseValue, PlanetType.STAR);

                int col = ((int)rgb.getX() << 16) | ((int)rgb.getY() << 8) | (int)rgb.getZ();
                image.setRGB(x, y, col);
            }
        }
    }

    //this function calculats and returns the turbulence value
    private double getTurbulenceValueAt(int steps, double xCoord, double yCoord, double zCoord) {
        double t = 0;
        Point p = new Point(xCoord,yCoord,zCoord);
        for(int i = 0; i<steps; i++) {
            t += noise.getNoiseValueAt(p) / Math.pow(2, i);
            p = p.getNextPoint();
        }
        return t/2;
    }

    //this function calculates the point on sphere corresponding to the current pixel
    private Point getCirclePoint(int i,int j) {
        double angleX = 360 / (double)xPixel * i;
        double angleY = 180 / (double)yPixel * j;
        angleX = Math.toRadians(angleX);
        angleY = Math.toRadians(angleY);
        double px, py, pz;
        px = (radius * Math.cos(angleX) * Math.sin(angleY));
        py = (radius * Math.sin(angleX) * Math.sin(angleY));
        pz = (radius * Math.cos(angleY));
        return new Point(px, py, pz);
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

    //this function creates the image file with a given name
    private void printImage(String name) {
        File f = new File("image_" + name + ".png");
        try {
            ImageIO.write(image, "PNG", f);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
