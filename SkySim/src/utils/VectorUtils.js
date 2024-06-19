/**
 * Calculates the Distance between two points.
 * @param {number[]} a - Point A
 * @param {number[]} b - Point B
 * @returns {number}
 */
export function distance(a, b) {
    const length_squared = Math.pow(b[0] - a[0], 2) +
        Math.pow(b[1] - a[1], 2) +
        Math.pow(b[2] - a[2], 2);

    return Math.sqrt(length_squared);
}

/**
 * Calculates the directed acceleration from a scalar acceleration and two Objects.
 * @param {number[]} pos_target - Object on which the acceleration should apply
 * @param {number[]} pos_other - Object that applies the acceleration to another Object
 * @param {number} acceleration - Scalar acceleration
 * @returns {number[]}
 */
export function directedAcceleration(pos_target, pos_other, acceleration) {
    const length_of_vector = distance(pos_target, pos_other);
    return [
        acceleration * (pos_other[0] - pos_target[0]) / length_of_vector,
        acceleration * (pos_other[1] - pos_target[1]) / length_of_vector,
        acceleration * (pos_other[2] - pos_target[2]) / length_of_vector
    ];
}

/**
 * Calculates a vector in Astronomical Units (AE) to kilometers
 * @param {number[]} vector - Vector in AE
 * @returns {number[]}
 */
export function AEToM(vector) {
    return [
        149597870000 * vector[0],
        149597870000 * vector[1],
        149597870000 * vector[2]
    ]
}

/**
 * Calculates a vector in kilometers to Astronomical Units (AE)
 * @param {number[]} vector - Vector in kilometers
 * @returns {number[]}
 */
export function MToAE(vector) {
    return [
        vector[0] / 149597870000,
        vector[1] / 149597870000,
        vector[2] / 149597870000
    ]
}