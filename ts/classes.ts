/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world, Entity, Player, RawMessage } from "@minecraft/server";
import { RailMoPlusEntity } from "./rail_mo_plus/src/rail_mo_plus";

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

export type TCManifestMap = Map<string, TCManifest>;
export type ConfigObject = {
  auto_speed_down: boolean,
  speed_control_by_tp: boolean
}

export class TCMBTrain{
  entity: Entity;
  body: Entity[];
  rail_mo_plus: RailMoPlusEntity
  constructor(car:Entity, working:undefined = undefined, body:Entity[] | undefined = undefined){
    this.entity = car;
    this.body = body;
  }
}

export type TrainSpeedSpec = {
  limit?: number,
  simple_evaluation?: boolean,
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