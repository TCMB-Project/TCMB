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
export function getTrainTypeId(train) {
    return train.body[0].typeId.substring(0, train.body[0].typeId.length - 5);
}
export function getTCManifest(train, trains_manifest) {
    if (trains_manifest.has(getTrainTypeId(train))) {
        return trains_manifest.get(getTrainTypeId(train));
    }
    else {
        return undefined;
    }
}
export function getTrainSpec(train, trains_manifest) {
    let acceleration_spec = {
        startup: train.entity.getProperty('tcmb:startup_acceleration'),
        limit: train.entity.getProperty('tcmb:max_speed'),
        break: train.entity.getProperty('tcmb:deceleration'),
        eb: train.entity.getProperty('tcmb:eb_deceleration'),
        constant_acceleration_limit: train.entity.getProperty('constant_acceleration_limit'),
        coasting_deceleration: train.entity.getProperty('tcmb:coasting_deceleration')
    };
    let manifest = getTCManifest(train, trains_manifest);
    if (acceleration_spec.startup == 0) {
        if (typeof manifest == 'object' && typeof manifest['speed'] == 'object') {
            acceleration_spec.startup = manifest['speed']['startup'];
        }
    }
    if (acceleration_spec.break == 0) {
        if (typeof manifest == 'object' && typeof manifest['speed'] == 'object') {
            acceleration_spec.break = manifest['speed']['break'];
        }
        else {
            acceleration_spec.startup = 4.5;
        }
    }
    if (acceleration_spec.limit == 0) {
        if (typeof manifest == 'object' && typeof manifest['speed'] == 'object') {
            acceleration_spec.limit = manifest['speed']['limit'];
        }
        else {
            let max_speed;
            let maxspeed_tag = train.entity.getTags().filter((tag) => tag.startsWith('max_'))[0];
            max_speed = Number(maxspeed_tag.substring(4, maxspeed_tag.length - 2));
            train.entity.setProperty('tcmb:max_speed', max_speed);
        }
    }
    if (acceleration_spec.eb == 0) {
        if (typeof manifest == 'object' && typeof manifest['speed'] == 'object') {
            acceleration_spec.eb = manifest['speed']['eb'];
        }
        else {
            acceleration_spec.eb = 5;
        }
    }
    if (acceleration_spec.constant_acceleration_limit == 0) {
        if (typeof manifest == 'object' && typeof manifest['speed'] == 'object') {
            acceleration_spec.constant_acceleration_limit = manifest['speed']['constant_acceleration_limit'];
        }
        else {
            acceleration_spec.constant_acceleration_limit = 4;
        }
    }
    if (acceleration_spec.coasting_deceleration == 0) {
        if (typeof manifest == 'object' && typeof manifest['speed'] == 'object') {
            acceleration_spec.coasting_deceleration = manifest.speed.deceleration['coasting_deceleration'];
        }
        else {
            acceleration_spec.coasting_deceleration = 4;
        }
    }
    return acceleration_spec;
}
export const reverse_direction = {
    north: 'south'
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
