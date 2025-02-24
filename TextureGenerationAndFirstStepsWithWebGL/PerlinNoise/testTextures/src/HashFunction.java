public class HashFunction {
    //this class is a custom hash-function with that projects an integer onto an integer between 0 and 255

    //the "hash array" thats used to get the hash result
    private static int[] permutation = { 151,160,137,91,90,15,
            131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
            190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
            88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
            77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
            102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
            135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
            5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
            223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
            129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
            251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
            49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
            138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    };

    //the "size" of the noise until it repeats
    private int repeat = 0;
    //a seed for the hash function
    private int seed = 0;

    //constructors
    public HashFunction(int r, int s) {
        this.repeat = r; this.seed = s;
    }

    public HashFunction() {
    }

    //a function that increases an integer by one
    private int inc(int i) {
        return i + 1;
    }

    //the hash function, it uses the repeat and seed value to select an entry to chose from the hash map
    //it then returns this entry
    private int hash(int i) {
        i %= 255;
        if (repeat > 0) {
            i %= repeat;
        }
        for (int j = 0; j < seed; j++) {
            i = permutation[i];
        }
        return permutation[i];
    }

    //this functions is used to chose the direction vectors from a unit point
    //These vectors are needed to calculate the perlin noise
    //By using the hash function we make sure, that the same point returns the same vector every time
    public HashResult hash(UnitPoint p) {
        HashResult result = new HashResult();
        result.setAaa(hash(p.getZ() + hash(p.getY() + hash(p.getX()))));
        result.setAba(hash(p.getZ() + hash(inc(p.getY()) + hash(p.getX()))));
        result.setAab(hash(inc(p.getZ()) + hash(p.getY() + hash(p.getX()))));
        result.setAbb(hash(inc(p.getZ()) + hash(inc(p.getY()) + hash(p.getX()))));
        result.setBaa(hash(p.getZ() + hash(p.getY() + hash(inc(p.getX())))));
        result.setBba(hash(p.getZ() + hash(inc(p.getY()) + hash(inc(p.getX())))));
        result.setBab(hash(inc(p.getZ()) + hash(p.getY() + hash(inc(p.getX())))));
        result.setBbb(hash(inc(p.getZ()) + hash(inc(p.getY()) + hash(inc(p.getX())))));
        return result;
    }
}
