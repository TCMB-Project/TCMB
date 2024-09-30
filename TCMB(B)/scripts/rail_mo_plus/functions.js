/**
 * Function to return a normalized value
 * @param {Vector3} start - Starting coordinates
 * @param {Vector3} end - Ending coordinates
 * @param {Vector3} location - Current location
 * @returns {number} - Normalized value
 */
export function getNormalizedVector(start, end, location) {
    // Calculate the difference vector
    const vectorDiff = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    };
    // Calculate the difference from the start to the current location
    const locationDiff = {
        x: location.x - start.x,
        y: location.y - start.y,
        z: location.z - start.z
    };
    // Calculate the length of the vectors
    const vectorLength = Math.sqrt(vectorDiff.x ** 2 + vectorDiff.y ** 2 + vectorDiff.z ** 2);
    const locationLength = Math.sqrt(locationDiff.x ** 2 + locationDiff.y ** 2 + locationDiff.z ** 2);
    // Calculate the normalized value
    const normalizedValue = locationLength / vectorLength;
    return normalizedValue;
}
/**
 * Function to correct the position to the nearest point on the line segment (start, end)
 * @param start - The starting point of the line
 * @param end - The ending point of the line
 * @param location - The current position
 * @returns The corrected position (the closest point on the line segment)
 */
export function correctToRail(start, end, location) {
    // Vector from start to end
    const line = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    };
    // Vector from start to current location
    const locationVector = {
        x: location.x - start.x,
        y: location.y - start.y,
        z: location.z - start.z
    };
    // The squared length (norm) of the line vector
    const lineLengthSquared = line.x * line.x + line.y * line.y + line.z * line.z;
    if (lineLengthSquared === 0) {
        // If the start and end points are the same, return the start point
        return start;
    }
    // Calculate the scalar value to project locationVector onto line
    const t = (locationVector.x * line.x + locationVector.y * line.y + locationVector.z * line.z) / lineLengthSquared;
    // Clamp the value of t to ensure it is within the range 0 <= t <= 1, keeping the point within the line segment
    const clampedT = Math.max(0, Math.min(1, t));
    // Calculate the projected (corrected) position
    const correctedPosition = {
        x: start.x + clampedT * line.x,
        y: start.y + clampedT * line.y,
        z: start.z + clampedT * line.z
    };
    return correctedPosition;
}
export function toBlockLocation(location) {
    return { x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) };
}
//# sourceMappingURL=functions.js.map