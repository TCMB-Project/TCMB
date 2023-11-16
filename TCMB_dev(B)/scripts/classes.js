import { world } from "@minecraft/server";
export class StringableEntity {
    constructor(entity) {
        this.location = { x: -0, y: -0, z: -0 };
        this.type = entity.typeId;
        this.location = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
        this.id = entity.id;
    }
}
export class StringableCar extends StringableEntity {
}
export class StringablePlayer extends StringableEntity {
    constructor(player) {
        super(player);
        this.name = player.name;
    }
}
export class Event {
    constructor(name, status, car, player, working = false) {
        this.name = name;
        this.status = status;
        this.entity = car ? new StringableCar(car) : undefined;
        this.player = player ? new StringablePlayer(player) : undefined;
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
    constructor(official, title, texture, response) {
        if (!official && typeof texture != "undefined") {
            throw new TypeError('non-official button must not defined texture.');
        }
        this.official = official;
        this.title = title;
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
        this.working = working;
        this.body = body;
        this.sessionStorage = {};
    }
    setWorkingPlayer(working) {
        this.working = working;
    }
    setStore(key, value) {
        this.sessionStorage[key] = value;
    }
    getStore(key) {
        return this.sessionStorage[key];
    }
    removeStore(key) {
        delete this.sessionStorage[key];
    }
}
