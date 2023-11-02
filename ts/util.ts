import { Vector3 } from "@minecraft/server";

export function findFirstMatch(array, searchString) {
    let match = array.find(element => element.startsWith(searchString));
    if (match) {
      return array.indexOf(match);
    }
    else {
      return -1;
    }
}

export function distance(p1: Vector3, p2: Vector3): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
