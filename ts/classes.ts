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

export type TrainSpeedSpec = {
    limit?: number,
    evaluation?: boolean,
    acceleration?: number[][],
    deceleration?: number,
    emergency?: number,
    break_latency?: number
}

export type MNotch = {
    power: number,
    break: number,
    constant_speed?: boolean
}

export type TrainBattery = {
    capacity: number,
    performance: {
        speed_up: { use: number},
        speed_dowm: { charge: number },
        voltage_1: { charge: number },
        no_operation: { TimeInterval: number, use: number }
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

export type TCManifest = {
    name: string | undefined,
    company: string | undefined,
    type: string,
    speed_control_by_tp: boolean,
    summon_command: string | undefined,
    speed: TrainSpeedSpec | undefined,
    battery: TrainBattery | undefined,
    mnotch: MNotch
}