/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world, system, Dimension, Entity, EntityQueryOptions, Player, BlockRaycastOptions, BlockRaycastHit, RawMessage, ScriptEventCommandMessageAfterEvent, ItemUseAfterEvent, ItemUseOnAfterEvent } from "@minecraft/server";
import { Event, WorkRequest } from "./classes";
import { dummy } from "./engine";

new dummy;

const max_distance: number = 40;

const overworld: Dimension = world.getDimension("overworld");
const nether: Dimension = world.getDimension("nether");
const the_end: Dimension = world.getDimension("the_end");

let events = ["door", "notch", "direction", "dest", "delete"];
let working: Map<string, Entity> = new Map();

// event operation
system.afterEvents.scriptEventReceive.subscribe( ev => {
  switch(ev.id){
    // event
    case "tcmb:work_control":
      let msg = JSON.parse(ev.message) as WorkRequest;
      if(msg.type == "start" && typeof msg.entity == "string" && typeof msg.playerName == "string"){
        let work_train: Entity | undefined = world.getEntity(msg.entity);
        if(typeof work_train == "undefined") throw Error('[tcmb:work_control] operation entity not found');
        let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
        if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');

        working.set(work_player.id, work_train);
        work_train.addTag('tcmb_riding');
        work_train.addTag('tcmb_riding_'+work_player.id);
        work_player.sendMessage({translate: 'tcmb.message.work.start'});
      }else if(msg.type == "end" && typeof msg.playerName == "string"){
        let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
        if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');
        if(!working.has(work_player.id)) throw Error(`[tcmb:work_control] ${msg.playerName} is not working`);

        let worked_train = working.get(work_player.id);
        if(typeof worked_train == "undefined") return;
        
        try{ worked_train.removeTag('tcmb_riding'); } catch(err){ throw Error('[tcmb:work_control] failed to remove tcmb_riding tag') }
        try{ worked_train.removeTag('tcmb_riding_'+work_player.id); } catch(err){ throw Error('[tcmb:work_control] failed to remove playerName tag') } 
        let end_result = working.delete(work_player.id);
        if(!end_result) throw Error('[tcmb:work_control] failed to remove working data.');

        work_player.sendMessage({translate: 'tcmb.message.work.end'});

      }else if(msg.type == 'toggle' && typeof msg.playerName == 'string' && typeof msg.entity == 'string'){
        let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
        if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');

        let work_req: WorkRequest;
        if(working.has(work_player.id)){
          work_req = {
            type: 'end',
            playerName: msg.playerName
          }
        }else{
          work_req = {
            type: 'start',
            playerName: msg.playerName,
            entity: msg.entity
          }
        }
        overworld.runCommandAsync('scriptevent tcmb:work_control '+JSON.stringify(work_req));
      }else if(msg.type == "getStatus" && typeof msg.response == "string"){
        if(typeof msg.playerName == 'string'){
          let response_obj = {}
          let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
          if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');

          if(working.has(work_player.id)){
            response_obj = {
              entity: working.get(work_player.id)
            };
          }
          overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);
        }else if(typeof msg.entity == 'string'){
          let response_obj: {playerId: string[]} = {playerId: []}
          for(let [playerID, train] of working){
            if(train.id == msg.entity){
              response_obj.playerId.push(playerID);
            }
          }
          overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);
        }
      }else if(msg.type == "reload"){
        let ridden_train: Entity[] = overworld.getEntities({
          tags: ['tcmb_riding'],
          families: ['tcmb_car']
        });
        ridden_train = ridden_train.concat(nether.getEntities({
          tags: ['tcmb_riding'],
          families: ['tcmb_car']
        }));
        ridden_train = ridden_train.concat(the_end.getEntities({
          tags: ['tcmb_riding'],
          families: ['tcmb_car']
        }));
        for(const train of ridden_train){
          let tags = train.getTags();
          tags = tags.filter((tag)=> tag.startsWith('tcmb_riding_'));
          for(const playerID of tags){
            working.set(playerID.substring(12), train);
          }
        }
      }else {
        throw Error('[tcmb:work_control] Invalid JSON Message.');
      }
    break;
    case "tcmb:chat_echo":{
      world.sendMessage('[tcmb:chat_echo] '+ev.message);
    }
    break;
  }
}, { namespaces: ['tcmb'] });

//item use operation
function selectTrain(ev: ItemUseAfterEvent): { train: Entity, isWorking: boolean }{
  let event_train_query: EntityQueryOptions = {
    families: ["tcmb_car"],
    location: ev.source.location,
    closest: 1,
    maxDistance: max_distance
  };

  let train: Entity;
  let isWorking: boolean
  if(working.has(ev.source.id)){
    return {
      train: working.get(ev.source.id),
      isWorking: true
    }
  }else{
    return {
      train: ev.source.dimension.getEntities(event_train_query)[0],
      isWorking: false
    }
  }
}

let itemUseTime: Map<string, number> = new Map();

let itemEvent = (ev: ItemUseAfterEvent | ItemUseOnAfterEvent)=>{
  let lastUseTime = itemUseTime.get(ev.source.id);
  if(lastUseTime == system.currentTick){
    return;
  }else{
    itemUseTime.set(ev.source.id, system.currentTick);
  }

  let item_type_id: string = ev.itemStack.typeId;
  let train: Entity | undefined;
  let isworking: boolean;

  let event_train_query:EntityQueryOptions = {
    families: ["tcmb_car"],
    location: ev.source.location,
    closest: 1,
    maxDistance: max_distance
  };

  let dimension = ev.source.dimension;
  let evdata: Event;
  switch(item_type_id){
    case "tcmb:delete_train":
      train = dimension.getEntities(event_train_query)[0];
      if(typeof train == "undefined") return;
      let working_train = working.get(ev.source.id);

      if(working_train instanceof Entity && working_train.id == train.id){
        ev.source.sendMessage({translate: 'tcmb.message.cannot_remove.working'});
        return;
      }else if(train.hasTag('tcmb_riding')){
        let working_player: string[] = [];
        let offline_player: number = 0;
        for(let [playerID, work_train] of working){
          if(train.id == work_train.id){
            let player: unknown = world.getEntity(playerID);
            if((player instanceof Player)){
              working_player.push(player.nameTag);
            }else{
              offline_player++;
            }
          }
        }
        let message_with: RawMessage[] = [];
        if(working_player.length != 0){
          message_with[0] = {text: `${working_player.join(', ')}`};
          if(offline_player >= 1){
            message_with[1] = {translate: 'tcmb.message.cannot_remove.and_offline_player', with: [offline_player.toString()]}
          }

          ev.source.sendMessage({translate: 'tcmb.message.cannot_remove.ridden', with: {rawtext: message_with}});
        }else{
          ev.source.sendMessage({
            translate: 'tcmb.message.cannot_remove.working_offline_player',
            with: [offline_player.toString()]
          });
        }
        return;
      }
      evdata = new Event('deleteSignal', {}, train, ev.source, false);
      evdata.send();
    break;
    case "tcmb:notch_power":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      evdata = new Event('notchSignal', {operation: 'power'}, train, ev.source, isWorking);
      evdata.send();
    }
    break;
    case "tcmb:notch_neutral":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      evdata = new Event('notchSignal', {operation: 'neutral'}, train, ev.source, isWorking);
      evdata.send();
    }
    break;
    case "tcmb:notch_break":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      evdata = new Event('notchSignal', {operation: 'break'}, train, ev.source, isWorking);
      evdata.send();
    }
    break;
    case "tcmb:notch_eb":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      evdata = new Event('notchSignal', {operation: 'eb'}, train, ev.source, isWorking);
      evdata.send();
    }
    break;
    case "tcmb:open_left":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      if(!train.hasTag("voltage_0")){
        train.runCommandAsync("function open_left");
        if(train.hasTag("tc_parent") || train.hasTag("tc_child")){
          train.runCommandAsync("function tc_open_left");
        }
      }
    }
    break;
    case "tcmb:open_right":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      if(!train.hasTag("voltage_0")){
        train.runCommandAsync("function open_right");
        if(train.hasTag("tc_parent") || train.hasTag("tc_child")){
          train.runCommandAsync("function tc_open_right");
        }
      }
    }
    break;
    case "tcmb:open_all":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      if(!train.hasTag("voltage_0")){
        train.runCommandAsync("function open_all");
        if(train.hasTag("tc_parent") || train.hasTag("tc_child")){
          train.runCommandAsync("function tc_open_all");
        }
      }
    }
    break;
    case "tcmb:oneman_open_left":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      if(!train.hasTag("voltage_0")){
        train.runCommandAsync("function oneman_open_left");
        if(train.hasTag("tc_parent") || train.hasTag("tc_child")){
          train.runCommandAsync("function oneman_open_left");
        }
      }
    }
    break;
    case "tcmb:oneman_open_right":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      if(!train.hasTag("voltage_0")){
        train.runCommandAsync("function oneman_open_right");
        if(train.hasTag("tc_parent") || train.hasTag("tc_child")){
          train.runCommandAsync("function oneman_open_right");
        }
      }
    }
    break;
    case "tcmb:close":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      if(!train.hasTag("voltage_0")){
        train.runCommandAsync("function close");
        if(train.hasTag("tc_parent") || train.hasTag("tc_child")){
          train.runCommandAsync("function tc_close");
        }
      }
    }
    break;
    case "tcmb:door_control":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      evdata = new Event('door_control', {}, train, ev.source, isWorking);
      evdata.send();
    }
    break;
    case "tcmb:ride":
      if(working.has(ev.source.id)){
        train = working.get(ev.source.id);
        isworking = true;
      }else{
        train = dimension.getEntities(event_train_query)[0];
        isworking = false;
      }
      if(typeof train == "undefined") return;
      evdata = new Event('rideSignal', {}, train, ev.source, isworking);
      evdata.send();
    break;
    case "tcmb:direction":
      if(working.has(ev.source.id)){
        train = working.get(ev.source.id);
        isworking = true;
      }else{
        train = dimension.getEntities(event_train_query)[0];
        isworking = false;
      }
      if(typeof train == "undefined") return;
      evdata = new Event('directionSignal', {}, train, ev.source, isworking);
      evdata.send();
    break;
    case "tcmb:dest":
      if(working.has(ev.source.id)){
        train = working.get(ev.source.id);
        isworking = true;
      }else{
        train = dimension.getEntities(event_train_query)[0];
        isworking = false;
      }
      if(typeof train == "undefined") return;
      evdata = new Event('destSignal', {'operation':'foward'}, train, ev.source, isworking);
      evdata.send();
    break;
    case "tcmb:dest_reverse":
      if(working.has(ev.source.id)){
        train = working.get(ev.source.id);
        isworking = true;
      }else{
        train = dimension.getEntities(event_train_query)[0];
        isworking = false;
      }
      if(typeof train == "undefined") return;
      evdata = new Event('destSignal', {'operation':'reverse'}, train, ev.source, isworking);
      evdata.send();
    break;
    case "tcmb:crew_panel":
      if(working.has(ev.source.id)){
        train = working.get(ev.source.id);
        isworking = true;
      }else{
        train = dimension.getEntities(event_train_query)[0];
        isworking = false;
      }
      if(typeof train == "undefined") return;
      evdata = new Event('open_crew_panelSignal', {}, train, ev.source, isworking);
      evdata.send();
    break;
    case "tcmb:seat_control":{
      let { train, isWorking } = selectTrain(ev);

      if(typeof train == "undefined") return;
      evdata = new Event('open_seat_controlSignal', {}, train, ev.source, isWorking);
      evdata.send();
    }
    break;
  }
}

world.afterEvents.itemUse.subscribe(itemEvent);
world.afterEvents.itemUseOn.subscribe(itemEvent);

overworld.runCommandAsync('scriptevent tcmb:work_control {"type":"reload"}');
overworld.runCommandAsync('scriptevent tcmb:initialized');