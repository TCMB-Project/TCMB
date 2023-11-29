import { world, system, Dimension, ScoreboardObjective, Entity, Player, EntityQueryOptions } from "@minecraft/server";
import { ModalFormData, ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { Event, PanelButton, TCMBTrain } from "./classes";
import { findFirstMatch } from "./util";

export class dumy{}

const overworld: Dimension = world.getDimension("overworld");
let speedObject: ScoreboardObjective | undefined = world.scoreboard.getObjective("speed");
if(typeof speedObject == "undefined"){
    speedObject = world.scoreboard.addObjective("speed", "");
}
if(typeof world.scoreboard.getObjective('atc') == 'undefined'){
    world.scoreboard.addObjective('atc', '');
}
let optionObject: ScoreboardObjective | undefined = world.scoreboard.getObjective("option");

const perf_obj: ScoreboardObjective = world.scoreboard.getObjective('tcmb_perfomance');
const door_orders: String[] = ['open_a', 'open_b', 'open_all', 'oneman_open_a', 'oneman_open_b'];
const reverse_direction = {
    north: 'south'
}
const rail_direction = {
    0: {
        straight: true,
        gradient: false,
        rotation: [{
            from: 'south',
            to: 'south'
        },{
            from: 'north',
            to: 'north'
        }]
    },
    1: {
        straight: true,
        gradient: false,
        rotation: [{
            from: 'west',
            to: 'west'
        },{
            from: 'east',
            to: 'east'
        }]
    },
    2: {
        straight: true,
        gradient: true,
        rotation: [{
            from: 'west',
            y: 'down',
            to: 'west'
        },{
            from: 'east',
            y: 'up',
            to: 'east'
        }]
    },
    3: {
        straight: true,
        gradient: true,
        rotation: [{
            from: 'west',
            y: 'up',
            to: 'west'
        },{
            from: 'east',
            y: 'down',
            to: 'east'
        }]
    },
    4: {
        straight: true,
        gradient: true,
        rotation: [{
            from: 'south',
            y: 'up',
            to: 'south'
        },{
            from: 'north',
            y: 'down',
            to: 'north'
        }]
    },
    5: {
        straight: true,
        gradient: true,
        rotation: [{
            from: 'south',
            y: 'down',
            to: 'south'
        },{
            from: 'north',
            y: 'up',
            to: 'north'
        }]
    },
    6: {
        straight: false,
        gradient: false,
        rotation: [{
            from: 'south',
            to: 'east'
        },{
            from: 'west',
            to: 'north'
        }]
    },
    7: {
        straight: false,
        gradient: false,
        rotation: [{
            from: 'east',
            to: 'north'
        },{
            from: 'south',
            to: 'west'
        }]
    },
    8: {
        straight: false,
        gradient: false,
        rotation: [{
            from: 'east',
            to: 'south'
        },{
            from: 'north',
            to: 'west'
        }]
    },
    9: {
        straight: false,
        gradient: false,
        rotation: [{
            from: 'north',
            to: 'east'
        },{
            from: 'east',
            to: 'south'
        }]
    },
}

let perf:object = {
    main: 0,
    spawn: 0,
    remove: 0
}

let perf_monitor: boolean = false;
let monitor_runid = 0;

let writing_train_db:boolean = false;

let crew_panel_buttons: PanelButton[] = [];
crew_panel_buttons.push(new PanelButton(true, '電気系統', 'textures/items/electricity_control', 'tcmb:engine_electricity_control'));
crew_panel_buttons.push(new PanelButton(true, 'ドア操作', 'textures/items/door_control', undefined));
crew_panel_buttons.push(new PanelButton(true, '非常ブレーキ', 'textures/items/notch_eb', undefined));
crew_panel_buttons.push(new PanelButton(true, '進行方向反転', 'textures/items/direction', undefined));
crew_panel_buttons.push(new PanelButton(true, '乗務開始/終了', 'textures/items/crew_panel', 'tcmb:engine_work'));

let trains_manifest : object = {};

async function initializeTrain(entity: Entity){
    if(entity.typeId == 'tcmb:tcmb_car'){
        if(perf_monitor) var start: number = (new Date()).getTime();
        var query: EntityQueryOptions = {
            families: ["tcmb_body"],
            closest: 2,
            location: entity.location
        }
        
        while(writing_train_db);
        writing_train_db = true;
        let bodies: Entity[] = overworld.getEntities(query);
        let train = new TCMBTrain(entity, undefined, bodies);

        let type = bodies[0].typeId;
        let manifest = trains_manifest[type.substring(0, type.length - 5)]; 
        if(typeof manifest != 'undefined'){
            train.setStore('manifest', manifest);
        }

        tcmb_trains.push(train);
        writing_train_db = false;

        if(entity.hasTag('tcmanifest')){
            entity.setProperty('tcmb:tcmanifest', bodies[0].getProperty(type.substring(0, type.length - 5)+':tcmanifest'));
        }
        let car_entity_id = entity.id;
        entity.addTag('tcmb_carid_'+car_entity_id);
        if(perf_monitor) perf_obj.setScore('spawn', (new Date().getTime()) - start);
    }
}


let tcmb_trains: TCMBTrain[] = [];

//main operation
system.runInterval(() =>{
    if(perf_monitor) var start: number = (new Date()).getTime();
    var tcmb_cars: TCMBTrain[] = tcmb_trains;
    for(const train of tcmb_cars){
        const tcmb_car = train.entity;
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
        //tcmb_car(fast_run)
        if(speed > 108){
            var distance = speed/72;
            if(!tags.includes("backward")) distance = -distance;
            tcmb_car.runCommandAsync(`tp @s ^${distance} ^^`);
            tcmb_car.triggerEvent('109km');
        }else{
            tcmb_car.triggerEvent(speed +"km");
        }
        //body
        var bodies = train.body;
        //var doorRequest = tcmb_car.getDynamicProperty("door");

        //door operation
        let open_order = tags.filter((name)=> door_orders.includes(name))[0];
        for(const body of bodies){
            try{
                body.triggerEvent(speed +"km");
                if(speed >= 108){
                    body.teleport(tcmb_car.location);
                    let target_notch = ['p1', 'p2', 'p3', 'p4'];
                    if(tags.filter((tag)=> target_notch.includes(tag)).length){
                        tcmb_car.runCommandAsync(`playsound ${body.typeId.substring(0, train.body[0].typeId.length - 5)}_a_${speed}km @a[r=100]`);
                    }else if(!tags.includes('n')){
                        tcmb_car.runCommandAsync(`playsound ${body.typeId.substring(0, train.body[0].typeId.length - 5)}_d_${speed}km @a[r=100]`);
                    }
                }
            }catch(err){
                tcmb_car.kill();
                console.error(err, ' | Deleted the associated tcmb_car.');
                continue;
            }
            if(open_order) body.triggerEvent(open_order);

            let carid_onbody_tag_exists = findFirstMatch(body.getTags(), 'tcmb_body_');
            if(carid_onbody_tag_exists == -1){
                let car_entity_id = tcmb_car.id;
                body.addTag('tcmb_body_'+car_entity_id);
            }
        }

        let carid_tag_exists = findFirstMatch(tags, 'tcmb_carid_');
        if(carid_tag_exists == -1){
            let car_entity_id = tcmb_car.id;
            tcmb_car.addTag('tcmb_carid_'+car_entity_id);
        }
    }
    if(perf_monitor) perf['main'] = (new Date().getTime()) - start;
},1);

//battery charge and self-discharge
system.runInterval(()=>{
    for(const train of tcmb_trains){
        let typeId = train.body[0].typeId.substring(0, train.body[0].typeId.length - 5);
        if(typeof trains_manifest[typeId] == 'object'){
            let battery = trains_manifest[typeId]['battery'];
            if(typeof battery != 'object') continue;
            train.entity.addTag('has_battery');
            let now_level = train.entity.getProperty('tcmb:battery_level');

            if(train.entity.hasTag('voltage_1')){
                let charge_perf = trains_manifest[typeId]['battery']['performance']['voltage_1']['charge'];
                if((now_level + charge_perf) >= battery['capacity']){
                    train.entity.setProperty('tcmb:battery_level', battery['capacity']);
                }else if(typeof charge_perf != 'undefined' && now_level < battery['capacity']){
                    train.entity.setProperty('tcmb:battery_level', now_level + charge_perf);
                    train.entity.removeTag('voltage_0');
                }
            }else if(train.entity.hasTag('voltage_2')){
                let charge_perf = trains_manifest[typeId]['battery']['performance']['voltage_2']['charge'];
                if((now_level + charge_perf) >= battery['capacity']){
                    train.entity.setProperty('tcmb:battery_level', battery['capacity']);
                }else if(typeof charge_perf != 'undefined' && now_level < battery['capacity']){
                    train.entity.setProperty('tcmb:battery_level', now_level + charge_perf);
                    train.entity.removeTag('voltage_0');
                }
            }else if(train.entity.hasTag('voltage_b')){
                let perf: object = trains_manifest[typeId]['battery']['performance']['no_operation'];
                let interval = train.entity.getProperty('tcmb:battery_no_op_interval');
                if(typeof interval == 'number'){
                    interval++;
                    train.entity.setProperty('tcmb:battery_no_op_interval', interval);

                    if(typeof now_level == 'number' && (now_level - perf['use']) <= 0){
                        train.entity.setProperty('tcmb:battery_level', 0);
                        train.entity.setProperty('tcmb:battery_no_op_interval', 0);
                        train.entity.addTag('voltage_0');
                    }else if(typeof perf != 'undefined' && typeof now_level == 'number' && now_level >= 0 && interval >= perf['TimeInterval']){
                        train.entity.setProperty('tcmb:battery_level', now_level - perf['use']);
                        train.entity.setProperty('tcmb:battery_no_op_interval', 0);
                    }
                }
            }
            let level = train.entity.getProperty('tcmb:battery_level');
            for(const body of train.body){
                if(typeof now_level == 'number') body.setProperty(typeId+':battery_level', level);
            }
        }
    }
}, 20)

system.runInterval(()=>{
    if(optionObject instanceof ScoreboardObjective && optionObject.getScore('auto_speed_down') != 0){
        for(const train of tcmb_trains){
            if(train.entity.hasTag('n') && !train.entity.hasTag('tasc_on') && !train.entity.hasTag('tc_child')){
                train.entity.runCommandAsync('scriptevent tcmb:speed down');
            }
        }
    }
}, 120);

//events/functions
system.afterEvents.scriptEventReceive.subscribe( ev =>{
    var train: Entity;
    switch(ev.id){
        case "tcmb:event":
            let evmsg = JSON.parse(ev.message);
            let evdata = new Event(evmsg.name, evmsg.status, evmsg.entity, evmsg.player);
            let train_query;
            if(typeof evdata.player != "undefined"){
                train_query = {
                    tags:['tcmb_carid_'+evdata.entity.id],
                    type:'tcmb:tcmb_car'
                };
            }
            switch(evdata.name){
                case "rideBefore":
                    train = overworld.getEntities(train_query)[0];
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        var player:any = world.getPlayers({name:evdata.player.name})[0];
                        ride(player, train);
                    }
                break;
                case "door_control":
                    train = tcmb_trains.filter((train)=> train.entity.id == evdata.entity.id)[0].entity
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
                    train = tcmb_trains.filter((train)=> train.entity.id == evdata.entity.id)[0].entity;
                    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
                        if(!train.hasTag("voltage_0")){
                            if(!(train.hasTag('eb') && evdata.status["operation"] == "break") && !(train.hasTag('p4') && evdata.status["operation"] == "power") && !(train.hasTag("n") && evdata.status["operation"] == "neutral") && !(train.hasTag('eb') && evdata.status['operation'] == 'eb')){
                                train.runCommandAsync("playsound notch @a[r=25]");
                                if(speedObject.getScore(train) == 0 && ((evdata.status["operation"] == "neutral") || (train.hasTag('b1') && evdata.status['operation'] == 'power'))) train.runCommandAsync("playsound break_remission @a[r=100]");
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
                case "destBefore":{
                    let train:Entity = overworld.getEntities(train_query)[0];
                    var player:any = world.getPlayers({name:evdata.player.name})[0];
                    if(!train.hasTag("voltage_0")){
                        if(evdata.status["operation"] == 'foward'){
                            player.runCommandAsync("playsound random.click @p");
                            train.runCommandAsync("function dest");
                            if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommandAsync("function tc_dest");
                        }else{
                            player.runCommandAsync("playsound random.click @p");
                            train.runCommandAsync("function dest_reverse");
                            if(train.hasTag("tc_parent") || train.hasTag("tc_child")) train.runCommandAsync("function tc_dest_reverse");
                        }
                    }
                }
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
                                    break;
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
            //door event
            let door_direction;
            if(ev.message.includes('open')){
                //door event
                if(ev.sourceEntity.hasTag("backward")){
                    if(ev.message == "open_b"){
                        door_direction = "left";
                    }else if(ev.message == "open_a"){
                        door_direction = "right";
                    }else if(ev.message == "oneman_open_a"){
                        door_direction = "oneman_left";
                    }else if(ev.message == "oneman_open_b"){
                        door_direction = "oneman_right";
                    }else if(ev.message == "open_all"){
                        door_direction = "all";
                    }
                }else{
                    if(ev.message == "open_b"){
                        door_direction ="right";
                    }else if(ev.message == "open_a"){
                        door_direction = "left";
                    }else if(ev.message == "oneman_open_a"){
                        door_direction = "oneman_right";
                    }else if(ev.message == "oneman_open_b"){
                        door_direction = "oneman_left";
                    }else if(ev.message == "open_all"){
                        door_direction = "all";
                    }
                }
            }

            if(ev.message.includes('close')){
                train = ev.sourceEntity;
                var bodies = tcmb_trains.filter((car)=> car.entity.id == ev.sourceEntity.id)[0].body;
                if(ev.message.includes('close')) train.removeTag(ev.message.replace('close', 'open'));
                for(const body of bodies){
                    body.triggerEvent(ev.message);
                }

                //door event
                if(train.hasTag("backward")){
                    if(ev.message == "close_b"){
                        door_direction = "left";
                    }else if(ev.message == "close_a"){
                        door_direction = "right";
                    }else if(ev.message == "oneman_close_a"){
                        door_direction = "oneman_left";
                    }else if(ev.message == "oneman_close_b"){
                        door_direction = "oneman_right";
                    }else if(ev.message == "close_all"){
                        door_direction = "all";
                    }
                }else{
                    if(ev.message == "close_b"){
                        door_direction = "right";
                    }else if(ev.message == "close_a"){
                        door_direction = "left";
                    }else if(ev.message == "oneman_close_a"){
                        door_direction = "oneman_right";
                    }else if(ev.message == "oneman_close_b"){
                        door_direction = "oneman_left";
                    }else if(ev.message == "close_all"){
                        door_direction = "all";
                    }
                }
            }
            let event_report = new Event('door', {door_direction}, train, undefined);
            event_report.reply();
        break;
        case "tcmb:engine_delete":
            let delete_train: TCMBTrain = tcmb_trains.filter((train)=> train.body[0].id == ev.sourceEntity.id || train.body[1].id == ev.sourceEntity.id)[0];
            let tcmb_cars: Entity[] = overworld.getEntities({
                type: 'tcmb:tcmb_car',
                maxDistance: 2,
                location: ev.sourceEntity.location
            });

            for(const tcmb_car of tcmb_cars){
                tcmb_car.triggerEvent('delete');
            }
            for(const body of delete_train.body){
                body.teleport({ x: body.location.x, y: -128, z: body.location.z});
            }
            break;
            
        case "tcmb:engine_electricity_control":
            var player:any = ev.sourceEntity;
            var train:Entity = tcmb_trains.filter((train)=> train.entity.id == evdata.entity.id)[0].entity;
            var currentDest: number;
            var currentOnemanStatus: boolean;
            var currentVoltage: number;
            let tags: String[] = train.getTags();
            let rollDest = findFirstMatch(tags, "dest");
            var currentDest: number = Number(tags[rollDest].replace("dest",""));
            let rollVoltage: number = findFirstMatch(tags, "voltage");
            var currentVoltage: number = Number(tags[rollVoltage].replace("voltage_",""));
            var currentOnemanStatus: boolean = tags.includes('oneman');
            if(tags[rollVoltage] == 'voltage_b') currentVoltage = 0;

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
                if(train.hasTag('has_battery') && voltage == 0){
                   voltage = 'b'; 
                }
                ev.sourceEntity.runCommandAsync("function voltage_"+voltage);

            }).catch( e => {
                console.error(e, e.stack);
            });

            break;
            case 'tcmb:engine_work':{
                var player:any = ev.sourceEntity;
                var train:Entity = overworld.getEntities({tags:[`tcmb_carid_${JSON.parse(ev.message)['entity']['id']}`], type:'tcmb:tcmb_car'})[0];
                let work_req = {
                    type: 'toggle',
                    playerName: player.name,
                    entity: train.id
                }
                player.runCommandAsync('scriptevent tcmb:work_control '+JSON.stringify(work_req));
                
            }
            break;
            case 'tcmb:speed':{
                if(ev.sourceEntity.typeId != 'tcmb:tcmb_car') return;
                let train: TCMBTrain = tcmb_trains.filter((train)=>train.entity.id == ev.sourceEntity.id)[0];
                let tags = train.entity.getTags();
                let speed: unknown = train.entity.getProperty('tcmb:speed');

                if(ev.message == 'up' && !tags.includes('voltage_0') && typeof speed == 'number'){
                    let max_speed: number | string | boolean = train.entity.getProperty('tcmb:max_speed');
                    if(typeof max_speed != 'number') return;
                    if(max_speed == 0){
                        let maxspeed_tag: string = tags.filter((tag) => tag.startsWith('max_'))[0];
                        max_speed = Number(maxspeed_tag.substring(4, maxspeed_tag.length-2));
                        train.entity.setProperty('tcmb:max_speed', max_speed);
                    }
                    let typeId = train.body[0].typeId.substring(0, train.body[0].typeId.length - 5);
                    let perf: object;
                    if(trains_manifest[typeId] && trains_manifest[typeId]['battery']) perf = trains_manifest[typeId]['battery']['performance']['speed_up'];
                    let level = train.entity.getProperty('tcmb:battery_level');
                    if(!(trains_manifest[typeId] && trains_manifest[typeId]['battery'])) level = undefined;

                    if(tags.filter((tag) => tag.includes('open')).length == 0 && speed <= 1){
                        if(!tags.includes('backward')){
                            train.entity.runCommandAsync('summon tcmb:tcmb_starter ^1^^');
                        }else{
                            train.entity.runCommandAsync('summon tcmb:tcmb_starter ^-1^^');
                        }
                    }
                    if(!tags.includes('tc_child') && !tags.includes('stopping') && speed < max_speed){
                        if(max_speed <= 108){
                            train.entity.setProperty('tcmb:speed', speed + 1);
                            speedObject.setScore(train.entity, speed + 1);
                            if(typeof level == 'number' && tags.includes('voltage_b')) level -= perf['use'];
                        }else if(!tags.includes('tc_parent')){
                            speedObject.setScore(train.entity, speed + 1);
                            if(typeof level == 'number'&& tags.includes('voltage_b')) level -= perf['use'];
                        }
                    }
                    if(tags.includes('tc_parent') && !tags.includes('stopping') && speed < max_speed && speed < 108){
                        speedObject.addScore(train.entity, 1);
                        train.entity.runCommandAsync('function train_connect');
                    }
                    console.log(level);
                    if(trains_manifest[typeId] && trains_manifest[typeId]['battery'] && tags.includes('voltage_b')) train.entity.setProperty('tcmb:battery_level', level);
                }else if(ev.message == 'down' && typeof speed == 'number'){
                    let target_notch = ['eb', 'b7', 'b6', 'b5', 'b4', 'b3', 'b2', 'b1', 'n'];
                    if(tags.filter((notch)=>target_notch.includes(notch))){
                        if(!train.entity.hasTag('backward')){
                            train.entity.runCommandAsync('summon tcmb:tcmb_starter ^1^^');
                        }else{
                            train.entity.runCommandAsync('summon tcmb:tcmb_starter ^-1^^');
                        }
                        if(speed > 0 && !train.entity.hasTag('tc_child')){
                            
                            speedObject.addScore(train.entity, -1);
                        }
                        train.entity.runCommandAsync('function train_connect');
                    }
                }
            }
            break;
            case "tcmb_minecart_engine:regist_tcmanifest":{
                let message: unknown = JSON.parse(ev.message);
                if(typeof message == "object" && typeof message['type'] == 'string'){
                    trains_manifest[message['type']] = message;
                }
            }
            break;
            case "tcmb_minecart_engine:voltage_battery":{
                if(ev.sourceEntity.hasTag('has_battery')){
                    let train: TCMBTrain = tcmb_trains.filter((train)=>train.entity.id == ev.sourceEntity.id)[0];
                    train.entity.removeTag('voltage_0');
                    train.entity.removeTag('voltage_1');
                    train.entity.removeTag('voltage_2');
                    train.entity.addTag('voltage_b');
                    for(const body of train.body){
                        body.removeTag('voltage_0');
                        body.removeTag('voltage_1');
                        body.removeTag('voltage_2');
                        body.addTag('voltage_b');
                    }
                }
            }
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

// initialize Spawn train
world.afterEvents.entitySpawn.subscribe(async (event)=>{
    initializeTrain(event.entity);
});

// initialize Loaded train
world.afterEvents.entityLoad.subscribe(async (event)=>{
    if(event.entity.typeId == 'tcmb:tcmb_car'){
        console.warn('[minecart engine] Fired entityLoad');
        initializeTrain(event.entity);
    }
});

let init_entities: Entity[] = overworld.getEntities({families: ["tcmb_car"], type: "tcmb:tcmb_car"});
for(const init_train of init_entities){
    let initialized_train = tcmb_trains.filter((train)=> train.entity.id == init_train.id);
    initializeTrain(init_train);
}

world.afterEvents.entityRemove.subscribe(async (event)=>{
    if(perf_monitor) var start: number = (new Date()).getTime();
    while(writing_train_db);
    writing_train_db = true;
    tcmb_trains = tcmb_trains.filter((train)=> train.entity.id != event.removedEntityId);
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
        if(!train.hasTag("voltage_0")){
            train.runCommandAsync("function " + door_order);
            train.runCommandAsync("execute as @s[tag=tc_parent] at @s run function tc_" + door_order);
            train.runCommandAsync("execute as @s[tag=tc_child] at @s run function tc_" + door_order);
            if(door_order != "close") {
                event_report = new Event("door", {door_direction:door_order, open:true}, train, player);
            }else{
                event_report = new Event("door", {open:false}, train, player);
            }
            event_report.reply();
        }
    }).catch( e => {
        console.error(e, e.stack);
    });
}

function ride(player: Player, train: Entity){
    if(typeof train != "undefined" && train.typeId == "tcmb:tcmb_car"){
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
}

overworld.runCommandAsync('scriptevent tcmb_minecart_engine:initalized');