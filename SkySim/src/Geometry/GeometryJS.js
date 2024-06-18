/**
 * Represents a triangle. The triangle's Points a, b, c should be in clockwise order. (Backface Culling)
 */
export class Triangle {
    /**
     * Constructor of a Triangle Object.
     *
     * @param {Array<number>} a Array which represents one of the triangle's Points.
     * @param {Array<number>} b Array which represents one of the triangle's Points.
     * @param {Array<number>} c Array which represents one of the triangle's Points.
     */
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

export class Circle {
    constructor(radius, n_phi) {
        this.radius = radius;
        this.n_phi = n_phi;
    }

    getTriangleSphericalIndices(index_phi) {
        // Value of phi represents the corner of the wanted triangle with the smallest value of phi
        let phi = (index_phi % this.n_phi) * 2 * Math.PI / this.n_phi;

        // Calculate the three corners (in spherical coordinates)
        let a;
        let b;
        let c;

        a = Array(this.radius, phi);
        b = Array(0.0, phi);
        c = Array(this.radius, phi + (2 * Math.PI / this.n_phi));

        let a_cartesian = circularToCartesian(a[0], a[1]);
        let b_cartesian = circularToCartesian(b[0], b[1]);
        let c_cartesian = circularToCartesian(c[0], c[1]);

        return new Triangle(a_cartesian, b_cartesian, c_cartesian);
    }

    getArrayBufferContent() {
        let triangles = [];
        for(let i_phi = 0; i_phi < this.n_phi; i_phi++) {
            triangles.push(this.getTriangleSphericalIndices(i_phi));
        }

        let trianglePoints = [];
        triangles.forEach((item) => {
            trianglePoints.push(item.a[0], item.a[1], item.a[2]);
            trianglePoints.push(item.b[0], item.b[1], item.b[2]);
            trianglePoints.push(item.c[0], item.c[1], item.c[2]);
        });

        return new Float32Array(trianglePoints);
    }
}

/**
 * Represents a sphere.
 */
export class Sphere {
    /**
     * Constructor of a Sphere Object.
     *
     * @param {number} radius Radius of the sphere.
     * @param {number} n_theta Whole number of segments (quadrangles) in theta-direction. The resulting sphere will have the doubled number of triangles in theta-direction.
     * @param {number} n_phi Whole number of segments (quadrangles) in phi-direction. The resulting sphere will have the doubled number of triangles in phi-direction.
     */
    constructor(radius, n_theta, n_phi) {
        this.radius = radius;
        this.n_theta = n_theta;
        this.n_phi = n_phi;
    }

    /**
     * Returns the triangle at the given indices in cartesian-coordinates.
     *
     * theta = index_theta * PI / n_theta
     * phi = index_phi * 2 * PI / n_phi
     *
     * @param {number} index_theta Whole number of the theta-index of the requested segment (quadrangle) on the sphere.
     * @param {number} index_phi Whole number of the phi-index of the requested segment (quadrangle) on the sphere.
     * @param {boolean} index_down If true, the lower triangle of the segment (quadrangle) (the one with lower theta) is returned.
     *
     * @returns {Triangle} The requested triangle.
     */
    getTriangleSphericalIndices(index_theta, index_phi, index_down) {
        // Values of theta and phi represent the corner of the wanted triangle with the smallest values of theta and phi
        let theta = (index_theta % this.n_theta) * Math.PI / this.n_theta;
        let phi = (index_phi % this.n_phi) * 2 * Math.PI / this.n_phi;

        // Calculate the three corners (in spherical coordinates)
        let a;
        let b;
        let c;


        // If theta is at one of the poles of the sphere, we must output a layer consisting only of triangles
        if (index_theta == 0) {
            // We are at the top most point of the sphere -> Calculate a lower triangle
            a = Array(theta, phi + (2 * Math.PI / this.n_phi));
            b = Array(theta + (Math.PI / this.n_theta), phi + (2 * Math.PI / this.n_phi));
            c = Array(theta + (Math.PI / this.n_theta), phi);
        }
        else if (index_theta == this.n_theta - 1) {
            // We are at the low most point of the sphere -> Calculate a upper triangle
            a = Array(theta + (Math.PI / this.n_theta), phi);
            b = Array(theta, phi);
            c = Array(theta, phi + (2 * Math.PI / this.n_phi));
        }
        // Upper triangle
        else if (index_down == false) {
            a = Array(theta + (Math.PI / this.n_theta), phi);
            b = Array(theta, phi);
            c = Array(theta, phi + (2 * Math.PI / this.n_phi));
        }
        // Lower triangle
        else if (index_down) {
            a = Array(theta, phi + (2 * Math.PI / this.n_phi));
            b = Array(theta + (Math.PI / this.n_theta), phi + (2 * Math.PI / this.n_phi));
            c = Array(theta + (Math.PI / this.n_theta), phi);
        }

        let a_cartesian = sphericalToCartesian(this.radius, a[0], a[1]);
        let b_cartesian = sphericalToCartesian(this.radius, b[0], b[1]);
        let c_cartesian = sphericalToCartesian(this.radius, c[0], c[1]);


        return new Triangle(a_cartesian, b_cartesian, c_cartesian);
    }

    /**
     * Returns the triangle at the given single-index in cartesian-coordinates.
     *
     * @param {number} index Whole number of index.
     *
     * @returns {Triangle} The requested triangle.
     */
    getTriangleIndex(index) {
        let index_down = index % 2;
        let index_phi = ((index % (2 * this.n_phi)) - index_down) / 2;
        let index_theta = (index - 2 * index_phi - index_down) / (2 * this.n_phi);

        return this.getTriangleSphericalIndices(index_theta, index_phi, Boolean(index_down));
    }

    /**
     * Returns the whole content of ARRAY_BUFFER as Float32Array.
     *
     * @returns {Float32Array} Content of ARRAY_BUFFER.
     */
    getArrayBufferContent() {
        // For the first and last theta_index only calculate one triangle per phi_index (Simply leave out the index_down variation)
        let triangles = [];
        for(let i_theta = 0; i_theta < this.n_theta; i_theta++) {
            for(let i_phi = 0; i_phi < this.n_phi; i_phi++) {
                if (i_theta == 0 || i_theta == this.n_theta - 1) {
                    triangles.push(this.getTriangleSphericalIndices(i_theta, i_phi, false));
                }
                else {
                    triangles.push(this.getTriangleSphericalIndices(i_theta, i_phi, false));
                    triangles.push(this.getTriangleSphericalIndices(i_theta, i_phi, true));
                }
            }
        }

        let trianglePoints = [];
        triangles.forEach((item) => {
            trianglePoints.push(item.a[0], item.a[1], item.a[2]);
            trianglePoints.push(item.b[0], item.b[1], item.b[2]);
            trianglePoints.push(item.c[0], item.c[1], item.c[2]);
        });

        return new Float32Array(trianglePoints);
    }

    getSphericalTriangleFromIndices(index_theta, index_phi, index_down) {
        // Values of theta and phi represent the corner of the wanted triangle with the smallest values of theta and phi
        let phi = (index_phi % this.n_phi) * 2 * Math.PI / this.n_phi;
        let theta = (index_theta % this.n_theta) * Math.PI / this.n_theta;

        // Calculate the three corners (in spherical coordinates)
        let a;
        let b;
        let c;

        // If theta is at one of the poles of the sphere, we must output a layer consisting only of triangles
        if (index_theta === 0) {
            // We are at the top most point of the sphere -> Calculate a lower triangle
            a = Array(theta, phi + (2 * Math.PI / this.n_phi));
            b = Array(theta + (Math.PI / this.n_theta), phi + (2 * Math.PI / this.n_phi));
            c = Array(theta + (Math.PI / this.n_theta), phi);
        }
        else if (index_theta === this.n_theta - 1) {
            // We are at the low most point of the sphere -> Calculate a upper triangle
            a = Array(theta + (Math.PI / this.n_theta), phi);
            b = Array(theta, phi);
            c = Array(theta, phi + (2 * Math.PI / this.n_phi));
        }
        // Upper triangle
        else if (index_down === false) {
            a = Array(theta + (Math.PI / this.n_theta), phi);
            b = Array(theta, phi);
            c = Array(theta, phi + (2 * Math.PI / this.n_phi));
        }
        // Lower triangle
        else if (index_down) {
            a = Array(theta, phi + (2 * Math.PI / this.n_phi));
            b = Array(theta + (Math.PI / this.n_theta), phi + (2 * Math.PI / this.n_phi));
            c = Array(theta + (Math.PI / this.n_theta), phi);
        }

        return new Triangle(a, b, c);
    }

    getCartesianTriangleFromIndices(index_theta, index_phi, index_down) {
        // Values of theta and phi represent the corner of the wanted triangle with the smallest values of theta and phi
        let spherical_triangle = this.getSphericalTriangleFromIndices(index_theta, index_phi, index_down);

        let a = spherical_triangle.a;
        let b = spherical_triangle.b;
        let c = spherical_triangle.c;

        let a_cartesian = sphericalToCartesian(this.radius, a[0], a[1]);
        let b_cartesian = sphericalToCartesian(this.radius, b[0], b[1]);
        let c_cartesian = sphericalToCartesian(this.radius, c[0], c[1]);


        return new Triangle(a_cartesian, b_cartesian, c_cartesian);
    }

    getTextureCoordinateBufferContent() {
        // For the first and last theta_index only calculate one triangle per phi_index (Simply leave out the index_down variation)
        let triangles = [];
        for(let i_theta = 0; i_theta < this.n_theta; i_theta++) {
            for(let i_phi = 0; i_phi < this.n_phi; i_phi++) {
                if (i_theta === 0 || i_theta === this.n_theta - 1) {
                    triangles.push(this.getSphericalTriangleFromIndices(i_theta, i_phi, false));
                }
                else {
                    triangles.push(this.getSphericalTriangleFromIndices(i_theta, i_phi, false));
                    triangles.push(this.getSphericalTriangleFromIndices(i_theta, i_phi, true));
                }
            }
        }

        let trianglePoints = [];
        triangles.forEach((item) => {
            // The spherical coordinates do come in 2-Array because the radius is constant per sphere
            // Swap first and second component of spherical/texture coordinates because theta maps to y and phi maps to x
            // phi / x has to be divided by 2*PI and theta / y has to be divided by PI because of normalization
            trianglePoints.push(item.a[1] / (2 * Math.PI), item.a[0] / Math.PI);
            trianglePoints.push(item.b[1] / (2 * Math.PI), item.b[0] / Math.PI);
            trianglePoints.push(item.c[1] / (2 * Math.PI), item.c[0] / Math.PI);
        });

        return new Float32Array(trianglePoints);
    }
}


/**
 * Transforms spherical coordinates to cartesian coordinates.
 *
 * @param {number} radius Radius-Coordinate
 * @param {number} theta Theta-Coordinate
 * @param {number} phi Phi-Coordinate
 *
 * @returns {Array<number>} Array of length 3 containing the desired cartesian coordinates.
 */
export function sphericalToCartesian(radius, theta, phi) {
    return Array(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
    );
}

export function circularToCartesian(radius, phi) {
    return Array(
        radius * Math.cos(phi),
        radius * Math.sin(phi),
        0.0
    );
}