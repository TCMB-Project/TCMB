/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world } from "@minecraft/server";
export class Event {
    name;
    entity;
    player;
    status;
    isWorking;
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
    official;
    text;
    texture;
    response;
    uuid;
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
    entity;
    body;
    rail_mo_plus;
    constructor(car, working = undefined, body = undefined) {
        this.entity = car;
        this.body = body;
    }
}
class Notch {
    id;
    uuid;
    config;
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
//# sourceMappingURL=classes.js.map