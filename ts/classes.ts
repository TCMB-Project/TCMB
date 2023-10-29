import { world, Entity, Player } from "@minecraft/server";

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
    constructor(name:string, status: object, car:Entity | undefined, player:Player | undefined){
        this.name = name;
        this.status = status;
        this.entity = car?new StringableCar(car):undefined;
        this.player = player?new StringablePlayer(player):undefined;
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
    title: string;
    texture: string | undefined;
    response: string | undefined;
    uuid: string | undefined;
    constructor(official:boolean, title:string, texture:string | undefined, response: string | undefined){
        if(!official && typeof texture != "undefined"){
            throw new TypeError('non-official button must not defined texture.');
        }
        this.official = official;
        this.title = title;
        this.texture = texture;
        this.response = response;
    }
    setUUID(uuid:string){
        this.uuid = uuid;
    }
}

export class TCMBTrain{
    entity: Entity;
    working: Player | undefined;
    body: Entity[];
    constructor(car:Entity, working:Player | undefined = undefined, body:Entity[] | undefined = undefined){
        this.entity = car;
        this.working = working;
        this.body = body;
    }
    setWorkingPlayer(working:Player | undefined){
        this.working = working;
    }
}