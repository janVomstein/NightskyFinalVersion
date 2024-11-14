public class Main {
    public static void main(String[] args) {

        System.out.println("starting");
        //PerlinNoise pNoise = new PerlinNoise(32);
        //FileGenerator fGenerator = new FileGenerator(pNoise, 2048, 2248, 32, 30, 32);

        PerlinNoise pNoise0 = new PerlinNoise(24);
        FileGenerator fGenerator0 = new FileGenerator(pNoise0, 1024, 1024, 5, 5, 5);
        fGenerator0.generateSphereTest();

        /*PerlinNoise pNoise1 = new PerlinNoise(24);
        FileGenerator fGenerator1 = new FileGenerator(pNoise1, 2048, 2048, 24, 24, 24);
        fGenerator1.generateTurbulence("2");*/

        /*PerlinNoise pNoise2 = new PerlinNoise(24);
        FileGenerator fGenerator2 = new FileGenerator(pNoise2, 2048, 2048, 24, 24, 24);
        fGenerator2.generateTurbulence("3");*/

        //PerlinNoise pNoise = new PerlinNoise(8);
        //FileGenerator fGenerator = new FileGenerator(pNoise, 2048, 2248, 8, 8, 8);

        System.out.println("done");
    }
}