/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world, Entity, Player, RawMessage } from "@minecraft/server";

export class StringableEntity{
    type: string;
    location: any = {x:-0, y:-0, z:-0};
    id: string;
    constructor(entity: Entity){
        this.type = entity.typeId;
        this.location = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
        this.id = entity.id;
    }
}

export class StringableCar extends StringableEntity{
}

export class StringablePlayer extends StringableEntity{
    name: string;
    constructor(player: Player){
        super(player);
        this.name = player.name;
    }
}

export class Event{
    name: string;
    entity: StringableCar | undefined;
    player: StringablePlayer | undefined;
    status: object;
    isWorking: boolean;
    constructor(name:string, status: object, car:Entity | undefined, player:Player | undefined, working: boolean = false){
        this.name = name;
        this.status = status;
        this.entity = car?new StringableCar(car):undefined;
        this.player = player?new StringablePlayer(player):undefined;
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
    response: string | undefined;
    uuid: string | undefined;
    constructor(official:boolean, text:string | RawMessage, texture:string | undefined, response: string | undefined){
        this.official = official;
        this.text = text;
        this.texture = texture;
        this.response = response;
    }
    setUUID(uuid:string){
        this.uuid = uuid;
    }
}

export type StorageData = string | number | undefined | null | Entity; 
export type TCManifestMap = Map<string, TCManifest>;

export class TCMBTrain{
    entity: Entity;
    working: Player | undefined;
    body: Entity[];
    sessionStorage: object;
    constructor(car:Entity, working:Player | undefined = undefined, body:Entity[] | undefined = undefined){
        this.entity = car;
        this.working = working;
        this.body = body;
        this.sessionStorage = {}
    }
    setWorkingPlayer(working:Player | undefined){
        this.working = working;
    }
    setStore(key: string, value: StorageData){
        this.sessionStorage[key] = value;
    }
    getStore(key: string){
        return this.sessionStorage[key];
    }
    removeStore(key){
        delete this.sessionStorage[key];
    }
}

export class TrainSpeedSpec{
    limit: number;
    acceleration: object;
    deceleration: object;
    constructor(origin: object){
        if(typeof origin['limit'] == 'number'){
            this.limit = origin['limit'];
        }else{
            throw TypeError(`{tcmanifest}.speed.limit is not a number. (${typeof origin['limit']})`);
        }
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
    summon_command: string | undefined;
    speed: TrainSpeedSpec | undefined;
    notch: object[];
    battery: TrainBattery | undefined;
    constructor(origin_json: string){
        let origin: unknown = JSON.parse(origin_json);
        if(typeof origin == 'object'){

            if(typeof origin['name'] == 'string' || typeof origin['name'] == 'undefined'){
                this.name = origin['name'];
            }else{
                throw TypeError(`{tcmanifest}.name is not string. (${typeof origin['name']})`);
            }
            if(typeof origin['company'] == 'string' || typeof origin['company'] == 'undefined'){
                this.company = origin['company'];
            }else{
                throw TypeError(`{tcmanifest}.company is not string. (${typeof origin['company']})`);
            }
            if(typeof origin['type'] == 'string'){
                this.type = origin['type'];
            }else{
                throw TypeError(`{tcmanifest}.type is not string. (${typeof origin['type']})`);
            }
            if(typeof origin['summon_command'] == 'string' || typeof origin['summon_command'] == 'undefined'){
                this.company = origin['summon_command'];
            }else{
                throw TypeError('{tcmanifest}.summon_command is not string.');
            }
            if(typeof origin['speed'] == 'object'){
                this.speed = new TrainSpeedSpec(origin['speed']);
            }else if(typeof origin['speed'] == 'undefined'){
                this.speed = undefined;
            }else{
                throw TypeError(`{tcmanifest}.speed is not TrainSpeedSpec. (${typeof origin['speed']})`);
            }
            if(typeof origin['notch'] == 'object'){
                this.notch = origin['notch'];
            }else if(typeof origin['notch'] == 'undefined'){
                this.notch = undefined;
            }else{
                throw TypeError(`{tcmanifest}.notch is not TrainNotch. (${typeof origin['notch']})`);
            }
            if(typeof origin['battery'] == 'object'){
                this.battery = new TrainBattery(origin['battery']);
            }else if(typeof origin['battery'] == 'undefined'){
                this.battery = undefined;
            }else{
                throw TypeError(`{tcmanifest}.notch is not TrainBattery. (${typeof origin['battery']})`);
            }

        }
    }
}