import { world, system, Dimension, ScoreboardObjective, Entity, EntityQueryOptions, Player } from "@minecraft/server";
import { Event, StringablePlayer } from "./classes";
import { dumy } from "./engine";

new dumy;

const overworld: Dimension = world.getDimension("overworld");
const check_exsits_objective: string[] = ['option'];
for(const objid of check_exsits_objective){
    if(typeof world.scoreboard.getObjective(objid) == 'undefined'){

    }
}

let events = ["door", "notch", "direction", "dest", "electricity", "delete"];
let working: Map<string, Entity> = new Map();

let engine = {};

// event operation
system.afterEvents.scriptEventReceive.subscribe( ev => {
    const playerLocation = ev.sourceEntity?ev.sourceEntity.location:undefined;
    switch(ev.id){
            // event
            case "tcmb:reply":
                let re_msg = JSON.parse(ev.message);
                if(events.includes(re_msg.name)){
                    let evdata = new Event(re_msg.name, re_msg.status, re_msg.entity, undefined);
                    evdata.send();
                }
            break;
            case "tcmb:work_control":
                let msg = JSON.parse(ev.message);
                if(msg.type == "start" && typeof msg.entity == "string" && typeof msg.playerName == "string"){
                    let work_train: Entity | undefined = overworld.getEntities({tags:['tcmb_carid_'+msg.entity]})[0];
                    if(typeof work_train == "undefined") throw Error('[tcmb:work_control] operation entity not found');
                    let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                    if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');

                    working.set(msg.playerName, work_train);
                    work_player.sendMessage('乗務を開始しました。');

                }else if(msg.type == "end" && typeof msg.playerName == "string"){
                    if(typeof working[msg.playerName] == "undefined") throw Error(`[tcmb:work_control] ${msg.playerName} is not working`);
                    let end_result = working.delete(msg.playerName);
                    if(!end_result) throw Error('[tcmb:work_control] failed to remove working data.');

                    let worked_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                    worked_player.sendMessage('乗務を終了しました。');

                }else if(msg.type == 'toggle' && typeof msg.playerName == 'string' && typeof msg.entity == 'string'){
                    if(working.has(msg.playerName)){
                        let end_result = working.delete(msg.playerName);
                        if(!end_result) throw Error('[tcmb:work_control] failed to remove working data.');
    
                        let worked_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                        worked_player.sendMessage('乗務を終了しました。');
                    }else{
                        let work_train: Entity | undefined = overworld.getEntities({tags:['tcmb_carid_'+msg.entity]})[0];
                        if(typeof work_train == "undefined") throw Error('[tcmb:work_control] operation entity not found');
                        let work_player: Player | undefined = world.getPlayers({name:msg.playerName})[0];
                        if(typeof work_player == "undefined") throw Error('[tcmb:work_control] player not found');
    
                        working.set(msg.playerName, work_train);
                        work_player.sendMessage('乗務を開始しました。');
                    }
                }else if(msg.type == "getStatus" && typeof msg.response == "string"){
                    if(typeof msg.playerName == 'string'){
                        let response_obj = {}
                        if(typeof working[msg.playerName] != 'undefined') response_obj = {
                            entity: working.get(msg.playerName)
                        };
                        overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);

                    }else if(typeof msg.entity == 'string'){
                        let response_obj = {}
                        for(let [playerName, train] of working){
                            if(train.id == msg.entity){
                                response_obj['playerName'] = playerName;
                                break;
                            }
                        }
                        overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);
                    }
                }else{
                    throw Error('[tcmb:work_control] Invalid JSON Message.');
                }
    }
});

//item use operation
world.afterEvents.itemUse.subscribe((ev)=>{
    let item_type_id: string = ev.itemStack.typeId;
    let train: Entity;

    let train_query = {
        type: "tcmb:tcmb_car",
        closest: 1
    };
    let event_train_query:EntityQueryOptions = {
        families: ["tcmb_car"],
        location: ev.source.location,
        closest: 1,
        maxDistance: 40
    } 
    let evdata: Event;
    switch(item_type_id){
        case "tcmb:delete_train":
            train = overworld.getEntities(event_train_query)[0];
            if(working.has(ev.source.name) && working.get(ev.source.name).id == train.id){
                ev.source.sendMessage('§c乗務中のため削除できません。');
                return;
            }
            if(typeof train == "undefined") return;
            evdata = new Event('deleteBefore', undefined, train, ev.source);
            evdata.send();
        break;
        case "tcmb:notch_power":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchBefore', {operation: 'power'}, train, ev.source);
            evdata.send();
        break;
        case "tcmb:notch_neutral":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchBefore', {operation: 'neutral'}, train, ev.source);
            evdata.send();
        break;
        case "tcmb:notch_break":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchBefore', {operation: 'break'}, train, ev.source);
            evdata.send();
        break;
        case "tcmb:notch_eb":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('notchBefore', {operation: 'eb'}, train, ev.source);
            evdata.send();
        break;
        case "tcmb:open_left":
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run function open_left");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_left");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_left");
        break;
        case "tcmb:open_right":
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run function open_right");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_right");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_right");
        break
        case "tcmb:open_all":
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run function open_all");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_all");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_all");
        break
        case "tcmb:close":
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run function close");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_close");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_close");
        break;
        case "tcmb:door_control":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            //"execute as @p at @s run scriptevent tcmb:door_control"
            evdata = new Event('door_control', undefined, train, ev.source);
            evdata.send();
        break;
        case "tcmb:ride":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('rideBefore', undefined, train, ev.source);
            evdata.send();
        break;
        case "tcmb:direction":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('directionBefore', undefined, train, ev.source);
            evdata.send();
        break;
        case "tcmb:dest":
            train = overworld.getEntities(train_query)[0];
            if(!train.hasTag("voltage_0")){
                ev.source.runCommandAsync("playsound random.click @p");
                train.runCommandAsync("function dest");
                if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommandAsync("function tc_dest");
            }
        break;
        case "tcmb:dest_reverse":
            train = overworld.getEntities(train_query)[0];
            if(!train.hasTag("voltage_0")){
                ev.source.runCommandAsync("playsound random.click @p");
                train.runCommandAsync("function dest_reverse");
                if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommandAsync("function tc_dest_reverse");
            }
        break;
        case "tcmb:crew_panel":
            if(working.has(ev.source.name)){
                train = working.get(ev.source.name);
            }else{
                train = overworld.getEntities(event_train_query)[0];
            }
            if(typeof train == "undefined") return;
            evdata = new Event('open_crew_panelBefore', undefined, train, ev.source, working.has(ev.source.name));
            evdata.send();
        break;
    }
});

world.afterEvents.playerJoin.subscribe((event)=>{
    system.runTimeout(()=>{
        let player: Player = world.getPlayers({name:event.playerName})[0];
        if(player.hasTag('tcmb_isworking')){
            let working_train: string | Entity = player.getTags().filter((tag)=>tag.startsWith('tcmb_workingat_'))[0];
            working_train = overworld.getEntities({tags:['tcmb_carid_'+working_train]})[0];
            working[event.playerName] = working_train;
        }
    }, 10);
});

overworld.runCommandAsync('scriptevent tcmb:initialized');