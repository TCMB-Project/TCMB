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
    runAction(player, train, evdata) {
        switch (this.response.type) {
            case "scriptevent":
                {
                    let send_event = new Event('click', {}, train, player, evdata.isWorking);
                    player.runCommandAsync(`scriptevent ${this.response.action} ${JSON.stringify(send_event)}`);
                }
                break;
            case "event":
                {
                    const overworld = world.getDimension("overworld");
                    let send_event = new Event(this.response.action, {}, train, player, evdata.isWorking);
                    overworld.runCommandAsync(`scriptevent tcmb:event ${JSON.stringify(send_event)}`);
                }
                break;
            case "entityevent":
                {
                    train.triggerEvent(this.response.action);
                }
                break;
            case "command":
                {
                    player.runCommandAsync(this.response.action);
                }
                break;
            case "command_by_entity":
                {
                    train.runCommandAsync(this.response.action);
                }
                break;
        }
    }
}
export class TCMBTrain {
    constructor(car, working = undefined, body = undefined) {
        this.entity = car;
        this.body = body;
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
//# sourceMappingURL=classes.js.map