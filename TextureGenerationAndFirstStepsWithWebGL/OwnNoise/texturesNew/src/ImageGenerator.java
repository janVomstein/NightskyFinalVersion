import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class ImageGenerator {
    private int xPixel;
    private int yPixel;

    private int imageSpaceRadius;

    private int radius;

    private int numberOfPoints;
    private Noise noise;
    private BufferedImage image;
    private ColorMapper colorMapper;

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

    public void generate() {
        //fillImageBasic();
        fillImageTurbulence();
        printImage();
    }

    public void generate(String name) {
        fillImageBasic();
        //fillImageTurbulence();
        printImage(name);
    }
    private void fillImageBasic() {
        for(int x = 0; x < xPixel; x++) {
            for(int y = 0; y < yPixel; y++) {
                double xCoord = (10.0 / (double)xPixel * (double)x) - 5.0;
                double yCoord = (10.0 / (double)yPixel * (double)y) - 5.0;
                double zCoord = 0;
                double noiseValue = noise.getNoiseValueAt(new Point(xCoord,yCoord,zCoord));
                Point rgb = (new Point(noiseValue * 255, noiseValue * 255, noiseValue * 255));
                rgb.round();
                int col = ((int)rgb.getX() << 16) | ((int)rgb.getY() << 8) | (int)rgb.getZ();
                image.setRGB(x, y, col);
            }
        }
    }

    private void fillImageTurbulence() {
        for(int x = 0; x < xPixel; x++) {
            for(int y = 0; y < yPixel; y++) {
                /*double xCoord = (10.0 / (double)xPixel * (double)x) - 5.0;
                double yCoord = (10.0 / (double)yPixel * (double)y) - 5.0;
                double zCoord = 0;
                double noiseValue = noise.getNoiseValueAt(new Point(xCoord,yCoord,zCoord));
                double turbulenceValue = getTurbulenceValueAt(5, xCoord, yCoord, zCoord);*/

                Point circlePoint = getCirclePoint(x,y,5);
                double noiseValue = noise.getNoiseValueAt(circlePoint);
                double turbulenceValue = getTurbulenceValueAt(5, circlePoint.getX(), circlePoint.getY(), circlePoint.getZ());

                noiseValue = Math.sin(noiseValue + 3 * turbulenceValue);
                noiseValue = (noiseValue + 1) / 2;

                /*Point rgb = (new Point(noiseValue * 255, noiseValue * 255, noiseValue * 255));
                rgb.round();*/

                Point rgb = colorMapper.getRGBForNoiseValue(noiseValue, PlanetType.STAR);

                int col = ((int)rgb.getX() << 16) | ((int)rgb.getY() << 8) | (int)rgb.getZ();
                image.setRGB(x, y, col);
            }
        }
    }

    private double getTurbulenceValueAt(int steps, double xCoord, double yCoord, double zCoord) {
        double t = 0;
        Point p = new Point(xCoord,yCoord,zCoord);
        for(int i = 0; i<steps; i++) {
            t += noise.getNoiseValueAt(p) / Math.pow(2, i);
            p = p.getNextPoint();
        }
        return t/2;
    }

    private Point getCirclePoint(int i,int j, int radius) {
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
    private void printImage() {
        File f = new File("image.png");
        try {
            ImageIO.write(image, "PNG", f);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void printImage(String name) {
        File f = new File("image_" + name + ".png");
        try {
            ImageIO.write(image, "PNG", f);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
