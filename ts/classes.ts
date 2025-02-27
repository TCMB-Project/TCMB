/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world, Entity, Player, RawMessage } from "@minecraft/server";
import { RailMoPlusEntity } from "./rail_mo_plus/src/rail_mo_plus";

const overworld = world.getDimension('overworld')

export class Event{
  name: string;
  entity: Entity | undefined;
  player: {name: string, id: string} | undefined;
  status: object;
  isWorking: boolean;
  constructor(name:string, status: object, car:Entity, player:Player | undefined, working: boolean = false){
    this.name = name;
    this.status = status;
    this.entity = car;
    this.player = player?{name: player.name, id: player.id}:undefined;
    this.isWorking = working;
  }

  send(){
    let stringify_data = JSON.stringify(this); 
    this.entity.runCommandAsync(`/scriptevent tcmb:event ${stringify_data}`);
  }
  reply(){
    let stringify_data = JSON.stringify(this);
    this.entity.runCommandAsync(`/scriptevent tcmb:event ${stringify_data}`)
  }
}

type PanelAction = {
  type: "scriptevent" | "TEvent" | "Command",
  action: string,
  status?: {[key: string]: any}
}

export class PanelButton{
  official: boolean;
  text: string | RawMessage;
  texture: string | undefined;
  response: PanelAction;
  uuid: string | undefined;
  constructor(official:boolean, text:string | RawMessage, texture:string | undefined, response: PanelAction){
    this.official = official;
    this.text = text;
    this.texture = texture;
    this.response = response;
  }
  setUUID(uuid:string){
    this.uuid = uuid;
  }
  push(train: Entity, player: Player, isWorking: boolean = false){
    switch(this.response.type){
      case "scriptevent":{
        let send_event = new Event('click', undefined, train, player, isWorking);
        player.runCommandAsync(`scriptevent ${this.response.action} ${JSON.stringify(send_event)}`);
      }
      break;
      case "TEvent":{
        let event = new Event(this.response.action, this.response.status, train, player, isWorking);
        event.send();
      }
    }
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
  rail_mo_plus: RailMoPlusEntity;
  manifest: TCManifest
  constructor(car:Entity, working:undefined = undefined, body:Entity[] | undefined = undefined){
    this.entity = car;
    this.body = body;
    this.rail_mo_plus = new RailMoPlusEntity(car);
  }
  getManifest(): TCManifest{
    if(typeof this.manifest != 'undefined') return this.manifest;

    if(this.entity.getDynamicPropertyIds().includes('tcmanifest')){
      let manifest_property: unknown = this.entity.getDynamicProperty('tcmanifest');
      if(typeof manifest_property == 'string'){
        let manifest = JSON.parse(manifest_property) as TCManifest;
        this.manifest = manifest;
        return manifest;
      }else{
          throw new TypeError('TCManifest on DP is not a string.');
      }
    }else{
      return undefined;
    }
  }
  connect(car: TCMBTrain): ConnectedChild{
    let child = new ConnectedChild(car.entity, undefined, car.body);
    child.parent = this;
    this.connected.push(child);
    return child;
  }
  isConnected(): boolean{
    return this.connected.length>=1;
  }
  setSpeed(speed: number): void{
    this.rail_mo_plus.setSpeed(speed);
    if(this.isConnected()){
      for(const car of this.connected){
        car.rail_mo_plus.setSpeed(speed);
      }
    }
  }
  triggerEvent(eventName: string): void{
    this.entity.triggerEvent(eventName);
    if(this.isConnected()){
      for(const car of this.connected){
        car.triggerEvent(eventName);
      }
    }
  }
  async runCommandAsync(commandString: string): Promise<void>{
    this.entity.runCommandAsync(commandString);
    if(this.isConnected()){
      for(const car of this.connected){
        car.runCommandAsync(commandString);
      }
    }
  }
  connected: ConnectedChild[] = [];
}

export class ConnectedChild extends TCMBTrain{
  parent: TCMBTrain
}

export type TrainSpeedSpec = {
  limit?: number,
  simple_evaluation?: boolean,
  deceleration?: number,
  emergency?: number,
  break_latency?: number
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

export type Cab = {
  power: number,
  break: number,
  breakRates: number[]
}

type BreakSpec = {
  type?: "step",
  service: number,
  emergency: number
}

export type TCManifest = {
  name: string | undefined,
  company: string | undefined,
  type: string,
  speed_control_by_tp: boolean,
  summon_command: string | undefined,
  speed: TrainSpeedSpec | undefined,
  break: BreakSpec,
  battery: TrainBattery | undefined,
  cab: Cab
}

export type WorkRequest = {
  type: "start" | "end" | "toggle" | "getStatus" | "reload",
  entity?: string,
  playerName?: string
  response?: string
}