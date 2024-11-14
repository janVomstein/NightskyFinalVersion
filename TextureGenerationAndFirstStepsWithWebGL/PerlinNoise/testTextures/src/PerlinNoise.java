import java.util.concurrent.ThreadLocalRandom;

public class PerlinNoise {

    private int repeat = 0;
    private HashFunction hashFunction = new HashFunction();

    public PerlinNoise() {}
    public PerlinNoise(int r) {
        this.repeat = r;
        int seed = ThreadLocalRandom.current().nextInt() % 32;
        seed = Math.abs(seed);
        System.out.println(seed);
        hashFunction = new HashFunction(r, seed);
    }

    public double perlin(Point pStart) {
        Point p = pStart;
        if (repeat > 0) {
            p = new Point(pStart.getX() % repeat, pStart.getY() % repeat, pStart.getZ() % repeat);
        }
        UnitPoint up = new UnitPoint(p);
        Point rp = new Point(p.getX() % 1, p.getY() % 1, p.getZ() % 1);
        Point rpf = rp.fade();
        HashResult hr = hashFunction.hash(up);
        double x1, x2, y1, y2;
        x1 = interpolate(grad(hr.getAaa(), rp.getX(), rp.getY(), rp.getZ()),
                        grad(hr.getBaa(),rp.getX()-1, rp.getY(), rp.getZ()),
                        rpf.getX());
        x2 = interpolate(grad(hr.getAba(), rp.getX(), rp.getY()-1, rp.getZ()),
                        grad(hr.getBba(),rp.getX()-1, rp.getY()-1, rp.getZ()),
                        rpf.getX());
        y1 = interpolate(x1, x2, rpf.getY());
        x1 = interpolate(grad(hr.getAab(), rp.getX(), rp.getY(), rp.getZ()-1),
                        grad(hr.getBab(),rp.getX()-1, rp.getY(), rp.getZ()-1),
                        rpf.getX());
        x2 = interpolate(grad(hr.getAbb(), rp.getX(), rp.getY()-1, rp.getZ()-1),
                        grad(hr.getBbb(),rp.getX()-1, rp.getY()-1, rp.getZ()-1),
                        rpf.getX());
        y2 = interpolate(x1, x2, rpf.getY());

        return (interpolate(y1, y2, rpf.getZ())+1)/2;
    }

    private double interpolate(double a, double b, double x) {
        return a + x * (b - a);
    }

    private double grad(int hash, double x, double y, double z) {
        switch (hash & 0xF) {
            case 0x0:
                return x + y;
            case 0x1:
                return -x + y;
            case 0x2:
                return x - y;
            case 0x3:
                return -x - y;
            case 0x4:
                return x + z;
            case 0x5:
                return -x + z;
            case 0x6:
                return x - z;
            case 0x7:
                return -x - z;
            case 0x8:
                return y + z;
            case 0x9:
                return -y + z;
            case 0xA:
                return y - z;
            case 0xB:
                return -y - z;
            case 0xC:
                return y + x;
            case 0xD:
                return -y + z;
            case 0xE:
                return y - x;
            case 0xF:
                return -y - z;
            default:
                return 0; // never happens
        }
    }

}
