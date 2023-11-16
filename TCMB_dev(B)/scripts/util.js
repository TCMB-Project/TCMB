import { system } from "@minecraft/server";
export function findFirstMatch(array, searchString) {
    let match = array.find(element => element.startsWith(searchString));
    if (match) {
        return array.indexOf(match);
    }
    else {
        return -1;
    }
}
export function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function sleep(tick) {
    return new Promise((resolve) => {
        system.runInterval(() => {
            resolve(true);
        }, tick);
    });
}
