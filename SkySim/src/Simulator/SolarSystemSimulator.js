import {directedAcceleration} from "../utils/VectorUtils";
import {Sphere} from "../Geometry/GeometryJS";

export class SolarSystemSimulator {
    /**
     * Represents a complete Solar System with Simulation Functionality.
     * @param {number} gamma - Universal Gravitational Constant
     */
    constructor(gamma) {
        this.gamma = gamma;

        this.objects = [
            new NaturalObject(1000, 1, [0, 0, 0], [0, 0, 0]),
            new NaturalObject(1, 1, [0, 10, 0], [10, 0, 0])
            //new NaturalObject(15, 0.1, [0, 10, 0], [10, 0, 0]),
        ];
    }

    /**
     * Simulate a timestep and update the values of the respective Objects.
     * @param {number} dt - Length of Timestep
     */
    simulate(dt) {
        for (let i = 0; i < this.objects.length; i++) {
            let acceleration = [0.0, 0.0, 0.0];
            for (let j = 0; j < this.objects.length; j++) {
                if (i === j) {
                    continue;
                }

                const distance_squared = Math.pow(this.objects[i].position[0] - this.objects[j].position[0], 2) +
                    Math.pow(this.objects[i].position[1] - this.objects[j].position[1], 2) +
                    Math.pow(this.objects[i].position[2] - this.objects[j].position[2], 2)

                if (distance_squared === 0) {
                    continue;
                }

                const scalar_acceleration = this.gamma * this.objects[j].mass / distance_squared;
                const directed_acceleration = directedAcceleration(this.objects[i].position, this.objects[j].position, scalar_acceleration);
                acceleration[0] += directed_acceleration[0];
                acceleration[1] += directed_acceleration[1];
                acceleration[2] += directed_acceleration[2];
            }
            this.objects[i].velocity = [
                this.objects[i].velocity[0] + acceleration[0] * dt,
                this.objects[i].velocity[1] + acceleration[1] * dt,
                this.objects[i].velocity[2] + acceleration[2] * dt
            ];

            this.objects[i].position = [
                this.objects[i].position[0] + this.objects[i].velocity[0] * dt,
                this.objects[i].position[1] + this.objects[i].velocity[1] * dt,
                this.objects[i].position[2] + this.objects[i].velocity[2] * dt
            ];
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
}

class GravitationalObject {
    /**
     * Represents an Object with gravitational properties.
     * @param {number} mass - Mass of the Object
     * @param {number} radius - Radius of the Object
     * @param {[number, number, number]} position - Position of the Object
     * @param {[number, number, number]} velocity - Velocity of the Object
     */
    constructor(mass, radius, position, velocity) {
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
        super(mass, radius, position, velocity);
    }
}

class ArtificalObject extends GravitationalObject {
    /**
     * Represents an artificial Object with gravitational properties.
     * Artificial Objects are Objects that are inserted by the User (e.g. Space probe).
     * @param {number} mass - Mass of the Object
     * @param {number} radius - Radius of the Object
     * @param {[number, number, number]} position - Position of the Object
     * @param {[number, number, number]} velocity - Velocity of the Object
     */
    constructor(mass, radius, position, velocity) {
        super(mass, radius, position, velocity);
    }
}