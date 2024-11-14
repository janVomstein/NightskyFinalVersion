public class ColorMapper {
    public Point getRGBForNoiseValue(double noiseValue, PlanetType type) {
        switch(type){
            case ICE_PLANET -> {
                return getRGBIcePlanet(noiseValue);
            }
            case LAVA_PLANET -> {
                return getRGBLavaPlanet(noiseValue);
            }
            case STAR -> {
                return getRGBStar(noiseValue);
            }
            case BLACK_AND_WHITE -> {
                return getRGBBlackAndWhite(noiseValue);
            }
            default -> {
                return new Point();
            }
        }
    }

    private double getRGBValueBetween(double start, double end, double pv) {
        double diff = end - start;
        diff *= pv;
        return start + diff;
    }

    private Point getRGBIcePlanet(double noiseValue) {
        double r = 0;
        double g = 0;
        double b = 0;
        double switchValue = 0.65;
        if (noiseValue < switchValue) {
            r = getRGBValueBetween(56, 200, noiseValue / switchValue);
            g = getRGBValueBetween(81, 200, noiseValue / switchValue);
            b = getRGBValueBetween(89, 200, noiseValue / switchValue);
            Point rgb = new Point(r, g, b);
            rgb.round();
            return rgb;
        }
        if (noiseValue < switchValue + 0.32) {
            r = getRGBValueBetween(230, 255, (noiseValue- switchValue) / 0.32);
            g = getRGBValueBetween(230, 255, (noiseValue- switchValue) / 0.32);
            b = getRGBValueBetween(230, 255, (noiseValue- switchValue) / 0.32);
            Point rgb = new Point(r, g, b);
            rgb.round();
            return rgb;
        }
        noiseValue -= (switchValue + 0.32);
        r = getRGBValueBetween(0, 12, noiseValue / (1- switchValue -0.32));
        g = getRGBValueBetween(22, 43, noiseValue / (1- switchValue -0.32));
        b = getRGBValueBetween(255, 124, noiseValue / (1- switchValue -0.32));
        Point rgb = new Point(r, g, b);
        rgb.round();
        return rgb;

    }

    private Point getRGBLavaPlanet(double noiseValue) {
        double r = 0;
        double g = 0;
        double b = 0;
        double switchValue = 0.7;
        if (noiseValue < switchValue) {
            r = getRGBValueBetween(255, 141, noiseValue / switchValue);
            g = getRGBValueBetween(226, 0, noiseValue / switchValue);
            b = getRGBValueBetween(27, 0, noiseValue / switchValue);
            Point rgb = new Point(r, g, b);
            rgb.round();
            return rgb;
        }
        noiseValue -= switchValue;
        r = getRGBValueBetween(31, 84, noiseValue / (1- switchValue));
        g = getRGBValueBetween(4, 74, noiseValue / (1- switchValue));
        b = getRGBValueBetween(4, 68, noiseValue / (1- switchValue));
        Point rgb = new Point(r, g, b);
        rgb.round();
        return rgb;
    }

    private Point getRGBStar(double noiseValue) {
        double r = getRGBValueBetween(246, 96, noiseValue );
        double g = getRGBValueBetween(247, 151, noiseValue);
        double b = getRGBValueBetween(255, 244, noiseValue);
        Point rgb = new Point(r, g, b);
        rgb.round();
        return rgb;
    }

    private Point getRGBBlackAndWhite(double noiseValue) {
        double r = getRGBValueBetween(0, 255, noiseValue );
        double g = getRGBValueBetween(0, 255, noiseValue);
        double b = getRGBValueBetween(0, 255, noiseValue);
        Point rgb = new Point(r, g, b);
        rgb.round();
        return rgb;
    }
}
