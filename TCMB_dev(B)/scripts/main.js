import { world, system } from "@minecraft/server";
import { Event } from "./classes";
import { dumy } from "./engine";
new dumy;
const overworld = world.getDimension("overworld");
const speedObject = world.scoreboard.getObjective("speed");
let events = ["door", "notch", "direction", "dest", "electricity", "delete"];
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
    }
});
//item use operation
world.afterEvents.itemUse.subscribe((ev) => {
    let item_type_id = ev.itemStack.typeId;
    let train;
    let train_query = {
        type: "tcmb:tcmb_car",
        closest: 1
    };
    let event_train_query = {
        families: ["tcmb_car"],
        location: ev.source.location,
        closest: 1
    };
    let evdata;
    switch (item_type_id) {
        case "tcmb:delete_train":
            ev.source.runCommandAsync("playsound random.click @s");
            let delete_train_query = {
                tags: ["body"],
                closest: 1,
                location: ev.source.location
            };
            train = overworld.getEntities(delete_train_query)[0];
            train.runCommandAsync("execute as @e[type=tcmb:tcmb_car,r=2,tag=tc_parent] at @s run function tc_delete_train");
            train.runCommandAsync("execute as @e[type=tcmb:tcmb_car,r=2,tag=tc_child] at @s run function tc_delete_train");
            train.runCommandAsync("function delete_train");
            break;
        case "tcmb:notch_power":
            train = overworld.getEntities(event_train_query)[0];
            evdata = new Event('notch', { operation: 'power' }, train, ev.source);
            evdata.send();
            break;
        case "tcmb:notch_neutral":
            train = overworld.getEntities(event_train_query)[0];
            evdata = new Event('notch', { operation: 'neutral' }, train, ev.source);
            evdata.send();
            break;
        case "tcmb:notch_break":
            train = overworld.getEntities(event_train_query)[0];
            evdata = new Event('notch', { operation: 'break' }, train, ev.source);
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
            train = overworld.getEntities(event_train_query)[0];
            //"execute as @p at @s run scriptevent tcmb:door_control"
            evdata = new Event('door_control', undefined, train, ev.source);
            evdata.send();
            break;
        case "tcmb:ride":
            train = overworld.getEntities(event_train_query)[0];
            evdata = new Event('rideBefore', undefined, train, ev.source);
            evdata.send();
            break;
        case "tcmb:direction":
            train = overworld.getEntities(event_train_query)[0];
            evdata = new Event('directionBefore', undefined, train, ev.source);
            evdata.send();
            break;
        case "tcmb:dest":
            train = overworld.getEntities(train_query)[0];
            if (!train.hasTag("voltage_0")) {
                ev.source.runCommandAsync("playsound random.click @p");
                train.runCommandAsync("function dest");
                if (train.hasTag("tc_parent") || train.hasTag("tc_child"))
                    train.runCommandAsync("function tc_dest");
            }
            break;
        case "tcmb:dest_reverse":
            train = overworld.getEntities(train_query)[0];
            if (!train.hasTag("voltage_0")) {
                ev.source.runCommandAsync("playsound random.click @p");
                train.runCommandAsync("function dest_reverse");
                if (train.hasTag("tc_parent") || train.hasTag("tc_child"))
                    train.runCommandAsync("function tc_dest_reverse");
            }
            break;
        case "tcmb:crew_panel":
            train = overworld.getEntities(event_train_query)[0];
            evdata = new Event('open_crew_panelBefore', undefined, train, ev.source);
            evdata.send();

    }
});
