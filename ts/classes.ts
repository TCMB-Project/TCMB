/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world, Entity, Player, RawMessage } from "@minecraft/server";

export class Event{
    name: string;
    entity: {typeId: string, id: string} | undefined;
    player: {name: string, id: string} | undefined;
    status: object;
    isWorking: boolean;
    constructor(name:string, status: object, car:Entity | undefined, player:Player | undefined, working: boolean = false){
        this.name = name;
        this.status = status;
        this.entity = car?{
            typeId: car.typeId,
            id: car.id
        }:undefined;
        this.player = player?{name: player.name, id: player.id}:undefined;
        this.isWorking = working;
    }

    send(){
        let overworld = world.getDimension("overworld");
        let stringify_data = JSON.stringify(this); 
        overworld.runCommandAsync(`/scriptevent tcmb:event ${stringify_data}`);
    }
    reply(){
        let overworld = world.getDimension("overworld");
        let stringify_data = JSON.stringify(this);
        overworld.runCommandAsync(`/scriptevent tcmb:reply ${stringify_data}`)
    }
}

export class PanelButton{
    official: boolean;
    text: string | RawMessage;
    texture: string | undefined;
    response: PanelButtonAction;
    uuid: string | undefined;
    constructor(official:boolean, text:string | RawMessage, texture:string | undefined, response: PanelButtonAction){
        this.official = official;
        this.text = text;
        this.texture = texture;
        this.response = response;
    }
    setUUID(uuid:string){
        this.uuid = uuid;
    }
    runAction(player: Player, train: Entity, evdata: Event){
        switch(this.response.type){
            case "scriptevent":{
                let send_event = new Event('click', {}, train, player, evdata.isWorking);
                player.runCommandAsync(`scriptevent ${this.response.action} ${JSON.stringify(send_event)}`);
            }
            break;
            case "event":{
                const overworld = world.getDimension("overworld");
                let send_event = new Event(this.response.action, {}, train, player, evdata.isWorking);
                overworld.runCommandAsync(`scriptevent tcmb:event ${JSON.stringify(send_event)}`);
            }
            break;
            case "entityevent":{
                train.triggerEvent(this.response.action);
            }
            break;
            case "command":{
                player.runCommandAsync(this.response.action);
            }
            break;
            case "command_by_entity":{
                train.runCommandAsync(this.response.action)
            }
            break;
        }
    }
}

export type PanelButtonAction = {
    type: 'scriptevent' | 'event' | 'entityevent' | 'command' | 'command_by_entity',
    action: string | undefined
}

export type TCManifestMap = Map<string, TCManifest>;
export type ConfigObject = {
    auto_speed_down: boolean,
    speed_control_by_tp: boolean
}

export class TCMBTrain{
    entity: Entity;
    body: Entity[];
    constructor(car:Entity, working:undefined = undefined, body:Entity[] | undefined = undefined){
        this.entity = car;
        this.body = body;
    }
}

export class TrainSpeedSpec{
    limit: number;
    evalby: string;
    acceleration: object;
    deceleration: object;
    constructor(origin: object){
        if(typeof origin['limit'] == 'number'){
            this.limit = origin['limit'];
        }else{
            throw TypeError(`{tcmanifest}.speed.limit is not a number. (${typeof origin['limit']})`);
        }
        this.evalby = typeof origin['evalby'] == 'string'?origin['evalby']:'default';
        if(typeof origin['deceleration'] == 'object'){
            this.deceleration = origin['deceleration'];
        }else if(typeof origin['deceleration'] != 'undefined'){
            throw TypeError(`{tcmanifest}.speed.deceleration is not an object. (${typeof origin['deceleration']})`);
        }
        if(typeof origin['acceleration'] == 'object'){
            this.acceleration = origin['acceleration'];
        }else if(typeof origin['deceleration'] != 'undefined'){
            throw TypeError(`{tcmanifest}.speed.acceleration is not number. (${typeof origin['acceleration']})`);
        }
    }
}

class TrainBattery{
    capacity: number;
    performance: object;
    constructor(origin: object){
        if(typeof origin['capacity'] == 'number'){
            this.capacity = origin['capacity'];
        }else{
            throw TypeError(`{tcmanifest}.battery.capacity is not number. (${typeof origin['capacity']})`);
        }
        if(typeof origin['performance'] == 'object'){
            this.performance = origin['performance'];
        }else{
            throw TypeError(`{tcmanifest}.battery.performance is not object. (${typeof origin['performance']})`);
        }
    }
}

class Notch{
    id: string | undefined;
    uuid: string | undefined;
    config: object | undefined;
    constructor(origin: object){
        if(typeof origin['id'] == 'string'){
            this.id = origin['id'];
        }else if(typeof origin['uuid'] == 'string'){
            this.id = origin['uuid'];
        }else{
            throw ReferenceError(`Notch ID is not defined.`);
        }
        if(typeof origin['config'] == 'object'){
            this.config = origin['config'];
        }
    }
}

export class TCManifest{
    name: string | undefined;
    company: string | undefined;
    type: string;
    speed_control_by_tp: boolean;
    summon_command: string | undefined;
    speed: TrainSpeedSpec | undefined;
    notch: object[];
    battery: TrainBattery | undefined;
    constructor(origin_json: string){
        let origin: unknown = JSON.parse(origin_json);
        let keys = Object.keys(origin);
        for(const key of keys){
            this[key] = origin[key];
        }
    }
}