/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world } from "@minecraft/server";
export class Event {
    constructor(name, status, car, player, working = false) {
        this.name = name;
        this.status = status;
        this.entity = car ? {
            typeId: car.typeId,
            id: car.id
        } : undefined;
        this.player = player ? { name: player.name, id: player.id } : undefined;
        this.isWorking = working;
    }
    send() {
        let overworld = world.getDimension("overworld");
        let stringify_data = JSON.stringify(this);
        overworld.runCommandAsync(`/scriptevent tcmb:event ${stringify_data}`);
    }
    reply() {
        let overworld = world.getDimension("overworld");
        let stringify_data = JSON.stringify(this);
        overworld.runCommandAsync(`/scriptevent tcmb:reply ${stringify_data}`);
    }
}
export class PanelButton {
    constructor(official, text, texture, response) {
        this.official = official;
        this.text = text;
        this.texture = texture;
        this.response = response;
    }
    setUUID(uuid) {
        this.uuid = uuid;
    }
}
export class TCMBTrain {
    constructor(car, working = undefined, body = undefined) {
        this.entity = car;
        this.body = body;
    }
}
export class TrainSpeedSpec {
    constructor(origin) {
        if (typeof origin['limit'] == 'number') {
            this.limit = origin['limit'];
        }
        else {
            throw TypeError(`{tcmanifest}.speed.limit is not a number. (${typeof origin['limit']})`);
        }
        this.evalby = typeof origin['evalby'] == 'string' ? origin['evalby'] : 'default';
        if (typeof origin['deceleration'] == 'object') {
            this.deceleration = origin['deceleration'];
        }
        else if (typeof origin['deceleration'] != 'undefined') {
            throw TypeError(`{tcmanifest}.speed.deceleration is not an object. (${typeof origin['deceleration']})`);
        }
        if (typeof origin['acceleration'] == 'object') {
            this.acceleration = origin['acceleration'];
        }
        else if (typeof origin['deceleration'] != 'undefined') {
            throw TypeError(`{tcmanifest}.speed.acceleration is not number. (${typeof origin['acceleration']})`);
        }
    }
}
class TrainBattery {
    constructor(origin) {
        if (typeof origin['capacity'] == 'number') {
            this.capacity = origin['capacity'];
        }
        else {
            throw TypeError(`{tcmanifest}.battery.capacity is not number. (${typeof origin['capacity']})`);
        }
        if (typeof origin['performance'] == 'object') {
            this.performance = origin['performance'];
        }
        else {
            throw TypeError(`{tcmanifest}.battery.performance is not object. (${typeof origin['performance']})`);
        }
    }
}
class Notch {
    constructor(origin) {
        if (typeof origin['id'] == 'string') {
            this.id = origin['id'];
        }
        else if (typeof origin['uuid'] == 'string') {
            this.id = origin['uuid'];
        }
        else {
            throw ReferenceError(`Notch ID is not defined.`);
        }
        if (typeof origin['config'] == 'object') {
            this.config = origin['config'];
        }
    }
}
export class TCManifest {
    constructor(origin_json) {
        let origin = JSON.parse(origin_json);
        let keys = Object.keys(origin);
        for (const key of keys) {
            this[key] = origin[key];
        }
    }
}
//# sourceMappingURL=classes.js.map