import {AEToM, directedAcceleration, MToAE} from "../utils/VectorUtils";
import {Sphere} from "../Geometry/GeometryJS";
import {hexToRGB, idToColor} from "../utils/uiUtils";

export class SolarSystemSimulator {
    /**
     * Represents a complete Solar System with Simulation Functionality.
     * @param {number} gamma - Universal Gravitational Constant
     */
    constructor(gamma) {
        this.gamma = gamma;

        //[Mass in kg, Radius in ?, Position in AU, Velocity in m/s]
        this.objects = [];
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
        let newObjects = data.map((elem, idx) => new GravitationalObject(elem.id, elem.mass, 0.1, elem.pos, elem.vel));
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
        this.MAX_TRAJECTORY_LENGTH = 64;

        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this._position = position;
        this.velocity = velocity;
        this.color = hexToRGB(idToColor(this.id));

        this.bufferContent = [];

        this.lastPositions = [];

        this.updateBufferContent();
    }

    get position() {
        return this._position;
    }

    set position(newPos) {
        this.lastPositions.push(this._position[0], this._position[1], this._position[2]);

        if (this.lastPositions.length > 3 * this.MAX_TRAJECTORY_LENGTH) {
            this.lastPositions.splice(0, 3);
        }

        this._position = newPos;
    }

    updateBufferContent() {
        let sphere = new Sphere(this.radius, 8, 16);
        this.bufferContent = sphere.getArrayBufferContent();
    }
}