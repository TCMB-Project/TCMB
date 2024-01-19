/*
* TCMB v1.2.0
* (c) TCMB Project
* Apache License 2.0
*/
import { world, system, Dimension, Entity, EntityQueryOptions, Player, BlockRaycastOptions, BlockRaycastHit } from "@minecraft/server";
import { Event } from "./classes";
import { dummy } from "./engine";

new dummy;

const overworld: Dimension = world.getDimension("overworld");
const nether: Dimension = world.getDimension("nether");
const the_end: Dimension = world.getDimension("the_end");

let events = ["door", "notch", "direction", "dest", "delete"];
let working: Map<string, Entity> = new Map();
let horned: Map<string, string> = new Map();

let optionObject = world.scoreboard.getObjective("option");
if(typeof optionObject == "undefined"){
    optionObject = world.scoreboard.addObjective("option", "");
    optionObject.setScore('auto_speed_down', 0);
    optionObject.setScore('require_work', 0);
    optionObject.setScore('item_distance', 40);
    optionObject.setScore('antirolling_by_eb', 1);
}

system.runInterval(()=>{
    for(const [playerID, entity] of working){
        let player: Entity = world.getEntity(playerID);
        if(!(player instanceof Player)) continue;
        let rotation = player.getRotation();
        if(rotation.x >= 35){
            if(rotation.x >= 45 && horned.get(player.id) != 'horn'){
                console.log('horn', rotation.x);
                horned.set(player.id, 'horn');
            }else if(horned.get(player.id) != 'mh' && horned.get(player.id) != 'horn' && rotation.x <= 45){
                console.log('mh', rotation.x);
                horned.set(player.id, 'mh');
            }
        }else{
            horned.delete(playerID);
        }
    }
}, 1);

// event operation
system.afterEvents.scriptEventReceive.subscribe( ev => {
    switch(ev.id){
            // event
            case "tcmb:reply":
                if(ev.sourceType != "Server"){
                    console.warn('[tcmb:reply] Event source is not Server.');
                    return;
                }
                let re_msg = JSON.parse(ev.message);
                if(events.includes(re_msg.name)){
                    let evdata = new Event(re_msg.name, re_msg.status, re_msg.entity, undefined);
                    evdata.send();
                }
            break;
            case "tcmb:work_control":
                let msg = JSON.parse(ev.message);
                if(msg.type == "start" && typeof msg.entity == "string" && typeof msg.playerName == "string"){
                    let work_train: Entity | undefined = world.getEntity(msg.entity);
                    if(typeof work_train == "undefined") throw Error('[tcmb:work_control] operation entity not found');
                    let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                    if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');

                    working.set(work_player.id, work_train);
                    work_train.addTag('tcmb_riding');
                    work_train.addTag('tcmb_riding_'+work_player.id);
                    work_player.sendMessage('乗務を開始しました。');

                }else if(msg.type == "end" && typeof msg.playerName == "string"){
                    let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                    if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');
                    if(!working.has(work_player.id)) throw Error(`[tcmb:work_control] ${msg.playerName} is not working`);
                    let worked_train = working.get(work_player.id);
                    try{ worked_train.removeTag('tcmb_riding'); } catch(err){ throw Error('[tcmb:work_control] failed to remove tcmb_riding tag') }
                    try{ worked_train.removeTag('tcmb_riding_'+work_player.id); } catch(err){ throw Error('[tcmb:work_control] failed to remove playerName tag') } 
                    let end_result = working.delete(work_player.id);
                    if(!end_result) throw Error('[tcmb:work_control] failed to remove working data.');

                    work_player.sendMessage('乗務を終了しました。');

                }else if(msg.type == 'toggle' && typeof msg.playerName == 'string' && typeof msg.entity == 'string'){
                    let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                    if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');
                    if(working.has(work_player.id)){
                        if(!working.has(work_player.id)) throw Error(`[tcmb:work_control] ${msg.playerName} is not working`);
                        let worked_train = working.get(work_player.id);
                        try{ worked_train.removeTag('tcmb_riding_'+work_player.id); } catch(err){ throw Error('[tcmb:work_control] failed to remove playerName tag') } 
                        let working_player: string[] = worked_train.getTags().filter((tag)=> tag.startsWith('tcmb_riding_'));
                        if(working_player.length == 0){
                            try{
                                worked_train.removeTag('tcmb_riding');
                            }catch(err){
                                throw Error('[tcmb:work_control] failed to remove tcmb_riding tag')
                            }
                        }
                        let end_result = working.delete(work_player.id);
                        if(!end_result) throw Error('[tcmb:work_control] failed to remove working data.');
    
                        work_player.sendMessage('乗務を終了しました。');
                    }else{
                        let work_train: Entity | undefined = world.getEntity(msg.entity);
                        if(typeof work_train == "undefined") throw Error('[tcmb:work_control] operation entity not found');
                        let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                        if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');
    
                        working.set(work_player.id, work_train);
                        work_train.addTag('tcmb_riding');
                        work_train.addTag('tcmb_riding_'+work_player.id);
                        work_player.sendMessage('乗務を開始しました。');
                    }
                }else if(msg.type == "getStatus" && typeof msg.response == "string"){
                    if(typeof msg.playerName == 'string'){
                        let response_obj = {}
                        let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                        if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');

                        if(working.has(work_player.id)) response_obj = {
                            entity: working.get(work_player.id)
                        };
                        overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);

                    }else if(typeof msg.entity == 'string'){
                        let response_obj = {playerName:[]}
                        for(let [playerID, train] of working){
                            if(train.id == msg.entity){
                                response_obj['playerName'].push(playerID);
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
world.afterEvents.itemUse.subscribe((ev)=>{
    let item_type_id: string = ev.itemStack.typeId;
    let train: Entity;
    let ground_facilitiy: Entity;
    let block_location: BlockRaycastHit;
    let isworking: boolean;

    let event_train_query:EntityQueryOptions = {
        families: ["tcmb_car"],
        location: ev.source.location,
        closest: 1,
        maxDistance: 40
    };

    let raycast_query: BlockRaycastOptions = {
        maxDistance: 8
    };
    let dimension = ev.source.dimension;
    let block_dimension: Dimension;

    let evdata: Event;
    switch(item_type_id){
        case "tcmb:delete_train":
            train = dimension.getEntities(event_train_query)[0];
            if(typeof train == "undefined") return;
            if(working.has(ev.source.id) && working.get(ev.source.id).id == train.id){
                ev.source.sendMessage('§c乗務中のため削除できません。');
                return;
            }else if(train.hasTag('tcmb_riding')){
                let working_player = [];
                let offline_player: number = 0;
                for(let [playerID, work_train] of working){
                    if(train.id == work_train.id){
                        let player: Entity = world.getEntity(playerID);
                        if((player instanceof Player)){
                            working_player.push(player.nameTag);
                        }else{
                            offline_player++;
                        }
                    }
                }
                let message: string;
                if(working_player.length != 0){
                    message = `§cまだ${working_player.join(', ')}${offline_player?'と'+offline_player+'人のオフラインのプレイヤー':''}が乗務しています。`;
                }else{
                    message = `§cまだ${offline_player+'人のオフラインのプレイヤー'}が乗務しています。`
                }
                ev.source.sendMessage(message);
                return;
            }
            evdata = new Event('deleteSignal', undefined, train, ev.source, isworking);
            evdata.send();
        break;
        case "tcmb:notch_power":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchSignal', {operation: 'power'}, train, ev.source, isworking);
            evdata.send();
        break;
        case "tcmb:notch_neutral":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchSignal', {operation: 'neutral'}, train, ev.source, isworking);
            evdata.send();
        break;
        case "tcmb:notch_break":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchSignal', {operation: 'break'}, train, ev.source, isworking);
            evdata.send();
        break;
        case "tcmb:notch_eb":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchSignal', {operation: 'eb'}, train, ev.source, isworking);
            evdata.send();
        break;
        case "tcmb:open_left":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function open_left");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_left");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_left");
        break;
        case "tcmb:open_right":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function open_right");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_right");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_right");
        break;
        case "tcmb:open_all":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function open_all");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_all");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_all");
        break;
        case "tcmb:oneman_open_left":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function oneman_open_left");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_oneman_open_left");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_oneman_open_left");
        break;
        case "tcmb:oneman_open_right":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function oneman_open_right");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_oneman_open_right");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_oneman_open_right");
        break;
        case "tcmb:close":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function close");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_close");
            train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_close");
        break;
        case "tcmb:door_control":
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('door_control', undefined, train, ev.source, isworking);
            evdata.send();
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
            evdata = new Event('rideSignal', undefined, train, ev.source, isworking);
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
            evdata = new Event('directionSignal', undefined, train, ev.source, isworking);
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
            evdata = new Event('open_crew_panelSignal', undefined, train, ev.source, isworking);
            evdata.send();
        break;
        case "tcmb:seat_control":{
            if(working.has(ev.source.id)){
                train = working.get(ev.source.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('open_seat_controlSignal', undefined, train, ev.source, isworking);
            evdata.send();
        }
        break;
    }
});

//mobile enhance
system.afterEvents.scriptEventReceive.subscribe((event)=>{
    let dimension: Dimension = event.sourceEntity.dimension;
    let train: Entity;
    let isworking: boolean;
    if(event.sourceType != 'Entity') return;
    let playerEntity: Entity = event.sourceEntity;
    let player: Player;
    if(playerEntity instanceof Player) player = playerEntity;

    let event_train_query:EntityQueryOptions = {
        families: ["tcmb_car"],
        location: player.location,
        closest: 1,
        maxDistance: 40
    };

    switch(event.id){
        case "tcmb_mobile_items:notch_power":{
            if(working.has(event.sourceEntity.id)){
                train = working.get(event.sourceEntity.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            let evdata = new Event('notchSignal', {operation: 'power'}, train, player, isworking);
            evdata.send();
        }
        break;
        case "tcmb_mobile_items:notch_neutral":{
            if(working.has(event.sourceEntity.id)){
                train = working.get(event.sourceEntity.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            let evdata = new Event('notchSignal', {operation: 'neutral'}, train, player, isworking);
            evdata.send();
        }
        break;
        case "tcmb_mobile_items:notch_break":{
            if(working.has(event.sourceEntity.id)){
                train = working.get(event.sourceEntity.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            let evdata = new Event('notchSignal', {operation: 'break'}, train, player, isworking);
            evdata.send();
        }
        break;
        case "tcmb_mobile_items:notch_eb":{
            if(working.has(event.sourceEntity.id)){
                train = working.get(event.sourceEntity.id);
                isworking = true;
            }else{
                train = dimension.getEntities(event_train_query)[0];
                isworking = false;
            }
            if(typeof train == "undefined") return;
            let evdata = new Event('notchSignal', {operation: 'eb'}, train, player, isworking);
            evdata.send();
        }
        break;
    }
}, {
    namespaces: ['tcmb_mobile_items']
});

overworld.runCommandAsync('scriptevent tcmb:work_control {"type":"reload"}');
overworld.runCommandAsync('scriptevent tcmb:initialized');