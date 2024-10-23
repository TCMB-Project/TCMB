import { system, world } from "@minecraft/server";
import { randomId, between } from "./functions";
import { byteLength } from "./encoding";
const overworld = world.getDimension('overworld');
const packet_size = 650;
const extend_packet_size = 300;
const max_packet_size = 1850;
async function send_packet(id, packet) {
    let sent = false;
    while (!sent) {
        try {
            let result = await overworld.runCommandAsync(`scriptevent ${id} ${packet}`);
            sent = true;
            return result;
        }
        catch (e) {
            await system.waitTicks(2);
        }
    }
}
export function sendData(id, data, option) {
    return new Promise((resolve, reject) => {
        let response_id;
        if (typeof option == "object" && option.response_id) {
            response_id = option.response_id;
        }
        else {
            response_id = randomId() + ':' + randomId() + randomId();
        }
        let request = {
            response: response_id
        };
        if (typeof option == "object" && option.header) {
            request = Object.assign(request, option.header);
        }
        let namespace = response_id.split(':')[0];
        let connected = false;
        let data_part = [];
        let data_sessionId;
        let control_sessionId;
        let se_receive = system.afterEvents.scriptEventReceive.subscribe(async (event) => {
            let response = JSON.parse(event.message);
            if (!connected) {
                if (between(response.status, 400, 599)) {
                    reject(response);
                    system.afterEvents.scriptEventReceive.unsubscribe(se_receive);
                    return;
                }
                else {
                    if (response.status == 227) {
                        connected = true;
                        data_sessionId = response.header.data;
                        control_sessionId = response.header.control;
                        for (let i = 0; i < data.length; i += packet_size) {
                            let sliced = data.substring(i, i + packet_size);
                            for (let j = 0; j < 4; j++) {
                                let extend = data.substring(i + packet_size, i + packet_size + extend_packet_size);
                                if (byteLength(sliced) + byteLength(extend) <= max_packet_size) {
                                    sliced += extend;
                                    i += extend_packet_size;
                                }
                            }
                            data_part.push(sliced);
                        }
                        let last_tick = system.currentTick;
                        let count = 0;
                        let send_promises = [];
                        for (let i = 0; i < data_part.length; i++) {
                            let isSameTick = last_tick == system.currentTick;
                            if (isSameTick && count <= 4) {
                                send_promises.push(send_packet(data_sessionId + i.toString(), data_part[i]));
                                count++;
                            }
                            else {
                                await system.waitTicks(1);
                                last_tick = system.currentTick;
                            }
                            if (!isSameTick)
                                last_tick = system.currentTick;
                        }
                        await Promise.all(send_promises);
                        await system.waitTicks(1);
                        let status_req = {
                            type: "status",
                            symbol: 'status_request'
                        };
                        overworld.runCommandAsync(`scriptevent ${control_sessionId} ${JSON.stringify(status_req)}`);
                    }
                }
            }
            else {
                let message = JSON.parse(event.message);
                if (between(message.status, 400, 599)) {
                    console.error(JSON.stringify(message));
                }
                else if (message.status == 213 && message.header.symbol == 'status_request') {
                    if (message.header.length == data_part.length && message.header.loss.length == 0) {
                        let disconnect_req = {
                            type: "disconnect"
                        };
                        overworld.runCommandAsync(`scriptevent ${control_sessionId} ${JSON.stringify(disconnect_req)}`);
                    }
                    else {
                        if (message.header.length != data_part.length) {
                            let sequence = data_part.length - 1;
                            await send_packet(data_sessionId + sequence.toString(), data_part[sequence]);
                        }
                        else {
                            for (const sequence of message.header.loss) {
                                await send_packet(data_sessionId + sequence.toString(), data_part[sequence]);
                            }
                        }
                        let status_req = {
                            type: "status",
                            symbol: 'status_request'
                        };
                        overworld.runCommandAsync(`scriptevent ${control_sessionId} ${JSON.stringify(status_req)}`);
                    }
                }
                else if (message.status == 221) {
                    resolve();
                }
            }
        }, { namespaces: [namespace] });
        overworld.runCommandAsync(`scriptevent ${id} ${JSON.stringify(request)}`);
    });
}
//# sourceMappingURL=client.js.map