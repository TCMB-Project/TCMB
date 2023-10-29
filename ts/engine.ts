import { world, system, Dimension, ScoreboardObjective, Entity, Player, EntityQueryOptions } from "@minecraft/server";
import { ModalFormData, ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { Event, PanelButton, TCMBTrain } from "./classes";
import { findFirstMatch } from "./util";

export class dumy{}

const overworld: Dimension = world.getDimension("overworld");
const speedObject: ScoreboardObjective | undefined = world.scoreboard.getObjective("speed");
if(typeof speedObject == "undefined"){
    world.scoreboard.addObjective("speed", "");
}
const perf_obj: ScoreboardObjective = world.scoreboard.getObjective('tcmb_perfomance');

let perf:object = {
    main: 0,
    spawn: 0,
    remove: 0
}

let perf_monitor: boolean = false;
let monitor_runid = 0;

let crew_panel_buttons: PanelButton[] = [];

let tcmb_trains: Entity[] = overworld.getEntities({families: ["tcmb_car"], type: "tcmb:tcmb_car"});


let tcmb_trains_key: object = {};
tcmb_trains.forEach((train, index)=>{
    tcmb_trains_key[train.id] = index;
});
let writing_train_db:boolean = false;

crew_panel_buttons.push(new PanelButton(true, '電気系統', 'textures/items/electricity_control', 'tcmb:engine_electricity_control'));
crew_panel_buttons.push(new PanelButton(true, 'ドア操作', 'textures/items/door_control', undefined));
crew_panel_buttons.push(new PanelButton(true, '非常ブレーキ', 'textures/items/notch_eb', undefined));
crew_panel_buttons.push(new PanelButton(true, '進行方向反転', 'textures/items/direction', undefined));

//main operation
system.runInterval(() =>{
    if(perf_monitor) var start: number = (new Date()).getTime();
    var tcmb_cars: Entity[] = tcmb_trains;
    for(const train of tcmb_cars){
        const tcmb_car = train;
        if(typeof speedObject == "undefined") continue;
        let tags: string[];
        try{
            tags = tcmb_car.getTags();
        }catch(e){
            console.error(e);
            continue;
        }
        //tcmb_car(speed)
        var speed: number | undefined = speedObject.getScore(tcmb_car);
        if(typeof speed == "undefined") continue;
        tcmb_car.triggerEvent(speed +"km");
        //tcmb_car(fast_run)
        if(speed > 108){
            var distance = speed/72;
            if(!tags.includes("backward")) distance = -distance;
            tcmb_car.triggerEvent("109km");
            tcmb_car.runCommandAsync("tp @s ^"+ distance + "^^");
        }
        //body
        const tcmbCarLocation = tcmb_car.location;
        var query = {
            families: ["tcmb_body"],
            closest: 2,
            location: { x: tcmbCarLocation.x, y: tcmbCarLocation.y, z: tcmbCarLocation.z }
        }
        var bodies = overworld.getEntities(query);
        //var doorRequest = tcmb_car.getDynamicProperty("door");

        //door operation
        let isclosing = false;
        let close_order = tags.filter((name)=> name.includes("close"))[0];
        let open_order = tags.filter((name)=> name.includes("open"))[0];
        for(const body of bodies){
            body.triggerEvent(speed +"km");

            let carid_onbody_tag_exists = findFirstMatch(body.getTags(), 'tcmb_body_');
            if(carid_onbody_tag_exists == -1){
                let car_entity_id = tcmb_car.id;
                body.addTag('tcmb_body_'+car_entity_id);
            }

            if(open_order){
                body.triggerEvent(open_order);

                //door event
                let door_direction;
                if(tags.includes("backward")){
                    if(open_order == "open_b"){
                        door_direction = "left";
                    }else if(open_order == "open_a"){
                        door_direction = "right";
                    }else if(open_order == "oneman_open_a"){
                        door_direction = "oneman_left";
                    }else if(open_order == "oneman_open_b"){
                        door_direction = "oneman_right";
                    }else if(open_order == "open_all"){
                        door_direction = "all";
                    }
                }else{
                    if(open_order == "open_b"){
                        door_direction ="right";
                    }else if(open_order == "open_a"){
                        door_direction = "left";
                    }else if(open_order == "oneman_open_a"){
                        door_direction = "oneman_right";
                    }else if(open_order == "oneman_open_b"){
                        door_direction = "oneman_left";
                    }else if(open_order == "open_all"){
                        door_direction = "all";
                    }
                }
            }
            if(close_order){
                body.triggerEvent(close_order);
                isclosing = true;

                //door event
                let door_direction;
                if(tags.includes("backward")){
                    if(close_order == "close_b"){
                        door_direction = "left";
                    }else if(close_order == "close_a"){
                        door_direction = "right";
                    }else if(close_order == "oneman_close_a"){
                        door_direction = "oneman_left";
                    }else if(close_order == "oneman_close_b"){
                        door_direction = "oneman_right";
                    }else if(close_order == "close_all"){
                        door_direction = "all";
                    }
                }else{
                    if(close_order == "close_b"){
                        door_direction = "right";
                    }else if(close_order == "close_a"){
                        door_direction = "left";
                    }else if(close_order == "oneman_close_a"){
                        door_direction = "oneman_right";
                    }else if(close_order == "oneman_close_b"){
                        door_direction = "oneman_left"
                        ;
                    }else if(close_order == "close_all"){
                        door_direction = "all";
                    }
                }

            }

            /*if(typeof doorRequest != 'undefined'){
                body.triggerEvent(doorRequest);
                if(doorRequest.includes("close")) tcmb_car.setDynamicProperty("door", "undefined")
            }*/      

            if(speed > 108) body.runCommandAsync("tp @s @e[type=tcmb:tcmb_car,c=1]"); 
        }
        //door operation
        if(isclosing){
            tcmb_car.removeTag(close_order.replace("close", "open"));
            tcmb_car.removeTag(close_order);
            isclosing = false;
        }

        let carid_tag_exists = findFirstMatch(tags, 'tcmb_carid_');
        if(carid_tag_exists == -1){
            let car_entity_id = tcmb_car.id;
            tcmb_car.addTag('tcmb_carid_'+car_entity_id);
        }
    }
    if(perf_monitor) perf['main'] = (new Date().getTime()) - start;
},1);

system.afterEvents.scriptEventReceive.subscribe( ev =>{
    const playerLocation = ev.sourceEntity?ev.sourceEntity.location:undefined;
    var train: Entity;
    switch(ev.id){
        case "tcmb:event":
            let evmsg = JSON.parse(ev.message);
            let evdata = new Event(evmsg.name, evmsg.status, evmsg.entity, evmsg.player);
            let train_query;
            if(typeof evdata.player != "undefined"){
                train_query = {
                location: { x: evdata.player.location.x, y: evdata.player.location.y, z: evdata.player.location.z },
                closest: 1,
                families:["tcmb_car"]
                };
            }
            switch(evdata.name){
                case "rideBefore":
                    train = overworld.getEntities(train_query)[0];
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        var player:any = world.getPlayers({name:evdata.player.name})[0];
                        const rideForm = new MessageFormData()
                            .title("乗車する号車を選択")
                            .body("乗車する号車をボタンで選択してください。\nこの号車は進行方向によって変わることはなく、固定です。")
                            .button1("2号車")
                            .button2("1号車");
                        rideForm.show(player).then( rawResponse => {
                            if(rawResponse.canceled) return;
                            let response = rawResponse.selection;
                            switch(response){
                                case 1: 
                                    player.runCommandAsync(`ride @s start_riding @e[family=tcmb_body,tag=car1,tag=tcmb_body_${train.id},c=1] teleport_rider`);
                                    break;
                                case 0:
                                    player.runCommandAsync(`ride @s start_riding @e[family=tcmb_body,tag=car2,tag=tcmb_body_${train.id},c=1] teleport_rider`);
                                    break;
                            }
                        }).catch( e => {
                            console.error(e, e.stack);
                        });
                    }
                break;
                case "door_control":
                    train = overworld.getEntities(train_query)[0];
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        var player:any = world.getPlayers({name:evdata.player.name})[0];
                        door_ctrl(player, train);
                    }
                break;
                case "directionBefore":
                    train = overworld.getEntities(train_query)[0];
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        if(!train.hasTag("voltage_0")){
                            train.runCommand("function direction");
                            if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommand("function tc_direction");
                        }
                        let event_report: Event;
                        event_report = new Event("direction", {backward: train.hasTag("backward")}, train, player);
                        event_report.reply();
                    }
                break;
                case "notchBefore":
                    train = overworld.getEntities(train_query)[0];
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        if(!train.hasTag("voltage_0")){
                            if(!(train.hasTag('eb') && evdata.status["operation"] == "break") && !(train.hasTag('p4') && evdata.status["operation"] == "power") && !(train.hasTag("n") && evdata.status["operation"] == "neutral")){
                                train.runCommandAsync("playsound notch @a[r=25]");
                                if(!train.hasTag("stopping") && speedObject.getScore(train) == 0 && evdata.status["operation"] == "neutral") train.runCommandAsync("playsound break_remission @a[r=100]");
                                let event_report = new Event('notch', evdata.status, train, player);
                                event_report.reply();
                            }
                            if(evdata.status["operation"] != "eb"){
                                train.runCommandAsync("function notch_"+evdata.status["operation"]);
                            }else{
                                train.runCommandAsync("function eb");
                            }
                            if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommandAsync("function tc_notch_"+evdata.status["operation"]);
                        }
                    }
                break;
                case "deleteBefore":
                    var player:any = world.getPlayers({name:evdata.player.name})[0];
                    player.runCommandAsync("playsound random.click @s");
                    let delete_train_query = {
                        tags: ["body"],
                        closest: 1,
                        location: player.location
                    };
                    train = overworld.getEntities(delete_train_query)[0];

                    train.runCommandAsync("execute as @e[type=tcmb:tcmb_car,r=2,tag=tc_parent] at @s run function tc_delete_train");
                    train.runCommandAsync("execute as @e[type=tcmb:tcmb_car,r=2,tag=tc_child] at @s run function tc_delete_train");
                    train.runCommandAsync("function delete_train");
                    let event_report = new Event('delete', undefined, train, player);
                    event_report.reply();
                break;
                case "open_crew_panelBefore":
                    train = overworld.getEntities(train_query)[0];
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        var player:any = world.getPlayers({name:evdata.player.name})[0];
                        let crewpanel = new ActionFormData()
                            .title('乗務パネル')
                        for(const button of crew_panel_buttons){
                            crewpanel.button(button.title, button.texture);
                        }
                        crewpanel.button('乗務')
                        crewpanel.show(player).then((response)=>{
                            if(response.canceled) return;
                            if(typeof crew_panel_buttons[response.selection].response == 'undefined'){
                                switch(response.selection){
                                    case 1:
                                        door_ctrl(player, train);
                                    break;
                                    case 2:
                                        train.runCommandAsync('function eb');
                                    break;
                                    case 3:
                                        if(!train.hasTag("voltage_0")){
                                            train.runCommand("function direction");
                                            if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommand("function tc_direction");
                                        }
                                        let event_report: Event;
                                        event_report = new Event("direction", {backward: train.hasTag("backward")}, train, player);
                                        event_report.reply();
                                }
                            }else{
                                let send_event = new Event('click', undefined, train, player);
                                player.runCommandAsync(`scriptevent ${crew_panel_buttons[response.selection].response} ${JSON.stringify(send_event)}`);
                            }
                        })
                    }
                break;
            }
        break;
        case "tcmb:engine_door":
            train = ev.sourceEntity;
            if(ev.message.includes("close")){
                let order = ev.message;
                train.addTag(order);
            }
        break;
        case "tcmb:engine_delete":

            break;
            
        case "tcmb:engine_electricity_control":
            var player:any = ev.sourceEntity;
            var train:Entity = overworld.getEntities({tags:[`tcmb_carid_${JSON.parse(ev.message)['entity']['id']}`]})[0];
            var query = {
                families: ["tcmb_car"],
                closest: 1,
                location: { x: playerLocation.x, y: playerLocation.y, z: playerLocation.z }
            };
            var tcmb_cars = overworld.getEntities(query);
            var currentDest: number;
            var currentOnemanStatus: boolean;
            var currentVoltage: number;
            for(const tcmb_car of tcmb_cars){
                let tags: String[] = tcmb_car.getTags();
                let rollDest = findFirstMatch(tags, "dest");
                var currentDest: number = Number(tags[rollDest].replace("dest",""));
                let rollVoltage: number = findFirstMatch(tags, "voltage");
                var currentVoltage: number = Number(tags[rollVoltage].replace("voltage_",""));
                var currentOnemanStatus: boolean = tags.includes('oneman');
            }
            const Electricityform = new ModalFormData()
                .title("電気系統管理パネル")
                .slider("行先・種別幕", 1, 20, 1, currentDest)
                .toggle("ワンマン",currentOnemanStatus);
            if(train.hasTag('only_vol1')){
                Electricityform.toggle('パンタグラフ', !!currentVoltage);
            }else if(train.hasTag('only_vol2')){
                Electricityform.toggle('パンタグラフ', !!currentVoltage);
            }else{
                Electricityform.dropdown("入力電源", [ "電源オフ", "電気1(標準では直流)", "電気2(標準では交流)"], currentVoltage);
            }
            
            Electricityform.show(player).then( rawResponse => {
                if(rawResponse.canceled) return;
                var dest:any;
                var oneman:any;
                var voltage:any;
                [ dest , oneman, voltage ] = rawResponse.formValues;
                //行先・種別幕
                ev.sourceEntity.runCommandAsync("function dest_reset");
                if(dest <= 10){
                    for(let i=0; i<dest-1; i++){
                        ev.sourceEntity.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run function dest");
                    }
                }else{
                    for(let i=0; i<21-dest; i++){
                        ev.sourceEntity.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run function dest_reverse");
                    } 
                }
                //ワンマン
                if(oneman){
                    ev.sourceEntity.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[r=1] add oneman")
                }else{
                    ev.sourceEntity.runCommandAsync("execute as @e[type=tcmb:tcmb_car,c=1] at @s run tag @e[r=1] remove oneman")
                }
                //入力電源
                if(train.hasTag('only_vol1')){
                    voltage = voltage?1:0;
                }else if(train.hasTag('only_vol2')){
                    voltage = voltage?2:0;
                }
                ev.sourceEntity.runCommandAsync("function voltage_"+voltage);

            }).catch( e => {
                console.error(e, e.stack);
            });

            break;
            // perfomance monitor
            case "tcmb:perf_monitor":
                if(ev.message == "true" || ev.message == "on" || ev.message == "1"){
                    monitor_runid = system.runInterval(output_perfomance, 20);
                    perf_monitor = true;
                    world.sendMessage("パフォーマンスモニターが有効になりました。");
                }else if(ev.message == "false" || ev.message == "off" || ev.message == "0"){
                    system.clearRun(monitor_runid);
                    perf_monitor = false;
                    world.sendMessage("パフォーマンスモニターが無効になりました。");
                }
            break;
    }
})

world.afterEvents.entitySpawn.subscribe(async (event)=>{
    if(event.entity.typeId == 'tcmb:tcmb_car'){
        if(perf_monitor) var start: number = (new Date()).getTime();
        var query: EntityQueryOptions = {
            families: ["tcmb_body"],
            closest: 2,
            location: event.entity.location
        }
        while(writing_train_db);
        writing_train_db = true;
        tcmb_trains_key[event.entity.id] = tcmb_trains.push(event.entity) - 1;
        writing_train_db = false;
        if(perf_monitor) perf_obj.setScore('remove', (new Date().getTime()) - start);
    }
});

world.afterEvents.entityRemove.subscribe(async (event)=>{
    if(perf_monitor) var start: number = (new Date()).getTime();
    while(writing_train_db);
    writing_train_db = true;
    tcmb_trains = tcmb_trains.filter((entity)=> entity.id != event.removedEntityId);
    delete tcmb_trains_key[event.removedEntityId];
    writing_train_db = false;
    if(perf_monitor) perf_obj.setScore('remove', (new Date().getTime()) - start);
}, {
    entityTypes: ['tcmb:tcmb_car']
});

function output_perfomance(){
    let score_obj = world.scoreboard.getObjective("tcmb_perfomance");
    score_obj.setScore("main", perf['main']);
}

function door_ctrl(player:Player, train:Entity){
    const doorForm = new ActionFormData()
    .title("ドア操作パネル")
    .body("開きたいドアの選択、または閉じる操作の実行")
    .button("左ドア開", "textures/items/open_left")
    .button("右ドア開", "textures/items/open_right")
    .button("両ドア開", "textures/items/open_all")
    .button("左ドア開(一部締め切り)", "textures/items/oneman_open_left")
    .button("右ドア開(一部締め切り)", "textures/items/oneman_open_right")
    .button("閉じる(共通)", "textures/items/close");
    doorForm.show(player).then( rawResponse => {
        if(rawResponse.canceled) return;
        var response = rawResponse.selection;
        switch(response){
            case 0:
                var door_order = "open_left";
                break;
            case 1: 
                var door_order = "open_right";
                break;
            case 2:
                var door_order = "open_all";
                break;
            case 3:
                var door_order = "oneman_open_left";
                break;
            case 4: 
                var door_order = "oneman_open_right";
                break;
            case 5:
                var door_order = "close";
                break;
        }
        let event_report: Event;
        train.runCommandAsync("execute as @s[tag=!voltage_0] at @s run function " + door_order);
        train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_parent] at @s run function tc_" + door_order);
        train.runCommandAsync("execute as @s[tag=!voltage_0,tag=tc_child] at @s run function tc_" + door_order);
        if(door_order != "close") {
            event_report = new Event("door", {door_direction:door_order, open:true}, train, player);
        }else{
            event_report = new Event("door", {open:false}, train, player);
        }
        event_report.reply();
    }).catch( e => {
        console.error(e, e.stack);
    });
}