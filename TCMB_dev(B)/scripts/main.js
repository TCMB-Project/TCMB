import { world, system } from "@minecraft/server";
import { Event } from "./classes";
import { dumy } from "./engine";
new dumy;
const overworld = world.getDimension("overworld");
let events = ["door", "notch", "direction", "dest", "electricity", "delete"];
let working = new Map();
let ridden_train = overworld.getEntities({
    tags: ['tcmb_riding'],
    families: ['tcmb_car']
});
for (const train of ridden_train) {
    let tags = train.getTags();
    tags = tags.filter((tag) => tag.startsWith('tcmb_riding_'));
    for (const playerName of tags) {
        working.set(playerName.substring(12), train);
    }
}
let engine = {};
// event operation
system.afterEvents.scriptEventReceive.subscribe(ev => {
    const playerLocation = ev.sourceEntity ? ev.sourceEntity.location : undefined;
    switch (ev.id) {
        // event
        case "tcmb:reply":
            let re_msg = JSON.parse(ev.message);
            if (events.includes(re_msg.name)) {
                let evdata = new Event(re_msg.name, re_msg.status, re_msg.entity, undefined);
                evdata.send();
            }
            break;
        case "tcmb:work_control":
            let msg = JSON.parse(ev.message);
            if (msg.type == "start" && typeof msg.entity == "string" && typeof msg.playerName == "string") {
                let work_train = overworld.getEntities({ tags: ['tcmb_carid_' + msg.entity] })[0];
                if (typeof work_train == "undefined")
                    throw Error('[tcmb:work_control] operation entity not found');
                let work_player = world.getPlayers({ name: msg.playerName })[0];
                if (typeof work_player == "undefined")
                    throw Error('[tcmb:work_control] player not found');
                working.set(msg.playerName, work_train);
                work_train.addTag('tcmb_riding');
                work_train.addTag('tcmb_riding_' + msg.playerName);
                work_player.sendMessage('乗務を開始しました。');
            }
            else if (msg.type == "end" && typeof msg.playerName == "string") {
                if (!working.has(msg.playerName))
                    throw Error(`[tcmb:work_control] ${msg.playerName} is not working`);
                let worked_train = working.get(msg.playerName);
                try {
                    worked_train.removeTag('tcmb_riding');
                }
                catch (err) {
                    throw Error('[tcmb:work_control] failed to remove tcmb_riding tag');
                }
                try {
                    worked_train.removeTag('tcmb_riding_' + msg.playerName);
                }
                catch (err) {
                    throw Error('[tcmb:work_control] failed to remove playerName tag');
                }
                let end_result = working.delete(msg.playerName);
                if (!end_result)
                    throw Error('[tcmb:work_control] failed to remove working data.');
                let worked_player = world.getPlayers({ name: msg.playerName })[0];
                worked_player.sendMessage('乗務を終了しました。');
            }
            else if (msg.type == 'toggle' && typeof msg.playerName == 'string' && typeof msg.entity == 'string') {
                if (working.has(msg.playerName)) {
                    if (!working.has(msg.playerName))
                        throw Error(`[tcmb:work_control] ${msg.playerName} is not working`);
                    let worked_train = working.get(msg.playerName);
                    try {
                        worked_train.removeTag('tcmb_riding_' + msg.playerName);
                    }
                    catch (err) {
                        throw Error('[tcmb:work_control] failed to remove playerName tag');
                    }
                    let working_player = worked_train.getTags().filter((tag) => tag.startsWith('tcmb_riding_'));
                    if (working_player.length == 0) {
                        try {
                            worked_train.removeTag('tcmb_riding');
                        }
                        catch (err) {
                            throw Error('[tcmb:work_control] failed to remove tcmb_riding tag');
                        }
                    }
                    let end_result = working.delete(msg.playerName);
                    if (!end_result)
                        throw Error('[tcmb:work_control] failed to remove working data.');
                    let worked_player = world.getPlayers({ name: msg.playerName })[0];
                    worked_player.sendMessage('乗務を終了しました。');
                }
                else {
                    let work_train = overworld.getEntities({ tags: ['tcmb_carid_' + msg.entity] })[0];
                    if (typeof work_train == "undefined")
                        throw Error('[tcmb:work_control] operation entity not found');
                    let work_player = world.getPlayers({ name: msg.playerName })[0];
                    if (typeof work_player == "undefined")
                        throw Error('[tcmb:work_control] player not found');
                    working.set(msg.playerName, work_train);
                    work_train.addTag('tcmb_riding');
                    work_train.addTag('tcmb_riding_' + msg.playerName);
                    work_player.sendMessage('乗務を開始しました。');
                }
            }
            else if (msg.type == "getStatus" && typeof msg.response == "string") {
                if (typeof msg.playerName == 'string') {
                    let response_obj = {};
                    if (working.has(msg.playerName))
                        response_obj = {
                            entity: working.get(msg.playerName)
                        };
                    overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);
                }
                else if (typeof msg.entity == 'string') {
                    let response_obj = { playerName: [] };
                    for (let [playerName, train] of working) {
                        if (train.id == msg.entity) {
                            response_obj['playerName'].push(playerName);
                            break;
                        }
                    }
                    overworld.runCommandAsync(`scriptevent ${msg.response} ${JSON.stringify(response_obj)}`);
                }
            }
            else {
                throw Error('[tcmb:work_control] Invalid JSON Message.');
            }
    }
});
//item use operation
world.afterEvents.itemUse.subscribe((ev) => {
    let item_type_id = ev.itemStack.typeId;
    let train;
    let isworking;
    let event_train_query = {
        families: ["tcmb_car"],
        location: ev.source.location,
        closest: 1,
        maxDistance: 40
    };
    let evdata;
    switch (item_type_id) {
        case "tcmb:delete_train":
            train = overworld.getEntities(event_train_query)[0];
            if (working.has(ev.source.name) && working.get(ev.source.name).id == train.id) {
                ev.source.sendMessage('§c乗務中のため削除できません。');
                return;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('deleteBefore', undefined, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:notch_power":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('notchBefore', { operation: 'power' }, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:notch_neutral":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('notchBefore', { operation: 'neutral' }, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:notch_break":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('notchBefore', { operation: 'break' }, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:notch_eb":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('notchBefore', { operation: 'eb' }, train, ev.source, isworking);
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
            break;
        case "tcmb:open_all":
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run function open_all");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_open_all");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_open_all");
            break;
        case "tcmb:close":
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0] at @s run function close");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_close");
            ev.source.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_close");
            break;
        case "tcmb:door_control":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            //"execute as @p at @s run scriptevent tcmb:door_control"
            evdata = new Event('door_control', undefined, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:ride":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('rideBefore', undefined, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:direction":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('directionBefore', undefined, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:dest":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('destBefore', { 'operation': 'foward' }, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:dest_reverse":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('destBefore', { 'operation': 'reverse' }, train, ev.source, isworking);
            evdata.send();
            break;
        case "tcmb:crew_panel":
            if (working.has(ev.source.name)) {
                train = working.get(ev.source.name);
                isworking = true;
            }
            else {
                train = overworld.getEntities(event_train_query)[0];
                isworking = false;
            }
            if (typeof train == "undefined")
                return;
            evdata = new Event('open_crew_panelBefore', undefined, train, ev.source, isworking);
            evdata.send();
            break;
    }
});
overworld.runCommandAsync('scriptevent tcmb:initialized');
