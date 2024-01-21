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
        this.entity.typeId = car ? car.typeId : undefined;
        this.entity.id = car ? car.id : undefined;
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
        if (typeof origin == 'object') {
            if (typeof origin['name'] == 'string' || typeof origin['name'] == 'undefined') {
                this.name = origin['name'];
            }
            else {
                throw TypeError(`{tcmanifest}.name is not string. (${typeof origin['name']})`);
            }
            if (typeof origin['company'] == 'string' || typeof origin['company'] == 'undefined') {
                this.company = origin['company'];
            }
            else {
                throw TypeError(`{tcmanifest}.company is not string. (${typeof origin['company']})`);
            }
            if (typeof origin['type'] == 'string') {
                this.type = origin['type'];
            }
            else {
                throw TypeError(`{tcmanifest}.type is not string. (${typeof origin['type']})`);
            }
            if (typeof origin['summon_command'] == 'string' || typeof origin['summon_command'] == 'undefined') {
                this.company = origin['summon_command'];
            }
            else {
                throw TypeError('{tcmanifest}.summon_command is not string.');
            }
            if (typeof origin['speed'] == 'object') {
                this.speed = new TrainSpeedSpec(origin['speed']);
            }
            else if (typeof origin['speed'] == 'undefined') {
                this.speed = undefined;
            }
            else {
                throw TypeError(`{tcmanifest}.speed is not TrainSpeedSpec. (${typeof origin['speed']})`);
            }
            if (typeof origin['notch'] == 'object') {
                this.notch = origin['notch'];
            }
            else if (typeof origin['notch'] == 'undefined') {
                this.notch = undefined;
            }
            else {
                throw TypeError(`{tcmanifest}.notch is not TrainNotch. (${typeof origin['notch']})`);
            }
            if (typeof origin['battery'] == 'object') {
                this.battery = new TrainBattery(origin['battery']);
            }
            else if (typeof origin['battery'] == 'undefined') {
                this.battery = undefined;
            }
            else {
                throw TypeError(`{tcmanifest}.notch is not TrainBattery. (${typeof origin['battery']})`);
            }
        }
    }
}
