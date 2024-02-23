/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { system } from "@minecraft/server";
import { TCManifest } from "./classes";
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
export function getTrainTypeId(train) {
    return train.body[0].typeId.substring(0, train.body[0].typeId.length - 5);
}
export function getTCManifest(train, trains_manifest) {
    if (train.entity.getDynamicPropertyIds().includes('tcmanifest')) {
        let manifest_property = train.entity.getDynamicProperty('tcmanifest');
        if (typeof manifest_property == 'string') {
            return new TCManifest(manifest_property);
        }
        else {
            throw new TypeError('TCManifest on DP is not a string.');
        }
    }
    else {
        return undefined;
    }
}
export function hasTCManifest(train, trains_manifest) {
    if (train.entity.getDynamicPropertyIds().includes('tcmanifest')) {
        return true;
    }
    else {
        return false;
    }
}
export const reverse_direction = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east'
};
export const rail_direction = {
    0: {
        straight: true,
        gradient: false,
        rotation: [{
                from: 'south',
                to: 'south'
            }, {
                from: 'north',
                to: 'north'
            }]
    },
    1: {
        straight: true,
        gradient: false,
        rotation: [{
                from: 'west',
                to: 'west'
            }, {
                from: 'east',
                to: 'east'
            }]
    },
    2: {
        straight: true,
        gradient: true,
        rotation: [{
                from: 'west',
                y: 'down',
                to: 'west'
            }, {
                from: 'east',
                y: 'up',
                to: 'east'
            }]
    },
    3: {
        straight: true,
        gradient: true,
        rotation: [{
                from: 'west',
                y: 'up',
                to: 'west'
            }, {
                from: 'east',
                y: 'down',
                to: 'east'
            }]
    },
    4: {
        straight: true,
        gradient: true,
        rotation: [{
                from: 'south',
                y: 'up',
                to: 'south'
            }, {
                from: 'north',
                y: 'down',
                to: 'north'
            }]
    },
    5: {
        straight: true,
        gradient: true,
        rotation: [{
                from: 'south',
                y: 'down',
                to: 'south'
            }, {
                from: 'north',
                y: 'up',
                to: 'north'
            }]
    },
    6: {
        straight: false,
        gradient: false,
        rotation: [{
                from: 'south',
                to: 'east'
            }, {
                from: 'west',
                to: 'north'
            }]
    },
    7: {
        straight: false,
        gradient: false,
        rotation: [{
                from: 'east',
                to: 'north'
            }, {
                from: 'south',
                to: 'west'
            }]
    },
    8: {
        straight: false,
        gradient: false,
        rotation: [{
                from: 'east',
                to: 'south'
            }, {
                from: 'north',
                to: 'west'
            }]
    },
    9: {
        straight: false,
        gradient: false,
        rotation: [{
                from: 'north',
                to: 'east'
            }, {
                from: 'east',
                to: 'south'
            }]
    },
};
//# sourceMappingURL=util.js.map