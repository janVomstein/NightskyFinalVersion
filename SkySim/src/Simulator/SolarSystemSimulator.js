import {AEToM, directedAcceleration, MToAE} from "../utils/VectorUtils";
import {Sphere} from "../Geometry/GeometryJS";

export class SolarSystemSimulator {
    /**
     * Represents a complete Solar System with Simulation Functionality.
     * @param {number} gamma - Universal Gravitational Constant
     */
    constructor(gamma) {
        this.gamma = gamma;

        //[Mass in kg, Radius in ?, Position in AU, Velocity in m/s]
        this.objects = [
            new NaturalObject(1.989 * Math.pow(10, 30), 0.1, [0, 0, 0], [0, 0, 0]),
            new NaturalObject(5.972 * Math.pow(10, 24), 0.1, [1, 0, 0], [0, 29780, 0])
            //new NaturalObject(15, 0.1, [0, 10, 0], [10, 0, 0]),
        ];
    }

    /**
     * Simulate a timestep and update the values of the respective Objects.
     * @param {number} dt - Length of Timestep
     */
    simulate(dt) {
        for (let i = 0; i < this.objects.length; i++) {
            let posA = AEToM(this.objects[i].position);
            let acceleration = [0.0, 0.0, 0.0];
            for (let j = 0; j < this.objects.length; j++) {
                if (i === j) {
                    continue;
                }

                let posB = AEToM(this.objects[j].position);

                let distance_squared = Math.pow(posA[0] - posB[0], 2) +
                    Math.pow(posA[1] - posB[1], 2) +
                    Math.pow(posA[2] - posB[2], 2);

                if (distance_squared === 0) {
                    continue;
                }

                const scalar_acceleration = this.gamma * this.objects[j].mass / distance_squared;
                const directed_acceleration = directedAcceleration(
                    posA,
                    posB,
                    scalar_acceleration
                );
                acceleration[0] += directed_acceleration[0];
                acceleration[1] += directed_acceleration[1];
                acceleration[2] += directed_acceleration[2];
            }

            this.objects[i].velocity = [
                this.objects[i].velocity[0] + acceleration[0] * dt,
                this.objects[i].velocity[1] + acceleration[1] * dt,
                this.objects[i].velocity[2] + acceleration[2] * dt
            ];

            this.objects[i].position = MToAE([
                posA[0] + this.objects[i].velocity[0] * dt,
                posA[1] + this.objects[i].velocity[1] * dt,
                posA[2] + this.objects[i].velocity[2] * dt
            ]);
        }
    }

    /**
     * Add an Object to this Solar System.
     * @param {GravitationalObject} object - Object to add.
     */
    addObject(object) {
        this.objects.push(object);
    }

    /**
     * Delete an Object from this Solar System.
     * @param {number} index - Index of the Object to delete.
     */
    deleteObject(index) {
        this.objects.splice(index, 1);
    }

    applyDataUpdate(data) {
        let newObjects = data.map((elem, idx) => new ArtificalObject(elem.id, elem.mass, 1, elem.pos, elem.vel));
        let objectsCopy = this.objects.filter((elem, idx) => elem.id === -1);
        for (let item of newObjects) {
            objectsCopy.push(item);
        }

        this.objects = objectsCopy;
    }
}

class GravitationalObject {
    /**
     * Represents an Object with gravitational properties.
     * @param {number} id - ID of the Object
     * @param {number} mass - Mass of the Object
     * @param {number} radius - Radius of the Object
     * @param {[number, number, number]} position - Position of the Object
     * @param {[number, number, number]} velocity - Velocity of the Object
     */
    constructor(id, mass, radius, position, velocity) {
        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;

        this.bufferContent = [];
        this.updateBufferContent();
    }

    updateBufferContent() {
        let sphere = new Sphere(this.radius, 8, 16);
        this.bufferContent = sphere.getArrayBufferContent();
    }
}

class NaturalObject extends GravitationalObject {
    /**
     * Represents a natural Object with gravitational properties.
     * Natural Objects are Objects that naturally exist in the Solar System (e.g. Planets).
     * @param {number} mass - Mass of the Object
     * @param {number} radius - Radius of the Object
     * @param {[number, number, number]} position - Position of the Object
     * @param {[number, number, number]} velocity - Velocity of the Object
     */
    constructor(mass, radius, position, velocity) {
        super(-1, mass, radius, position, velocity);
    }
}

class ArtificalObject extends GravitationalObject {
    /**
     * Represents an artificial Object with gravitational properties.
     * Artificial Objects are Objects that are inserted by the User (e.g. Space probe).
     * @param {number} id - ID of the Object
     * @param {number} mass - Mass of the Object
     * @param {number} radius - Radius of the Object
     * @param {[number, number, number]} position - Position of the Object
     * @param {[number, number, number]} velocity - Velocity of the Object
     */
    constructor(id, mass, radius, position, velocity) {
        super(id, mass, radius, position, velocity);
    }
}