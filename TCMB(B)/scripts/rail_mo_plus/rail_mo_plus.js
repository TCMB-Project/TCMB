import { system, world } from "@minecraft/server";
import { rail_direction } from "./rail_direction";
import { toBlockLocation } from "./functions";
const PRIVARE_SYMBOL = Symbol('rail_mo_plus_private');
const north_south = [1, 4, 5];
const east_west = [1, 2, 3];
const ascending = [2, 3, 4, 5];
const curve = [6, 7, 8, 9];
const direction = {
    "-180": "north",
    "0": "south",
    "90": "west",
    "-90": "east"
};
const edge = {
    "north": { x: 0.5, y: 0, z: 0 },
    "south": { x: 0.5, y: 0, z: 1 },
    "west": { x: -1, y: 0, z: 0.5 },
    "east": { x: 0, y: 0, z: 0.5 }
};
const direction_reverse = {
    "north": "south",
    "south": "north",
    "west": "east",
    "east": "west"
};
export class RailMoPlusEntity {
    constructor(entity /*, rotate: boolean*/) {
        this.entity = entity;
        this.isDestroyed = false;
        //this.rotate = rotate;
        if (!entity.getDynamicPropertyIds().includes('rail_mo_plus:speed')) {
            entity.setDynamicProperty('rail_mo_plus:speed', 0);
            //virtual rotation
            const location = this.entity.location;
            const current_block = this.entity.dimension.getBlock({ x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) });
            if (typeof current_block == "undefined")
                return;
            let state = current_block.permutation.getState('rail_direction');
            if (typeof state != 'number')
                return;
            if (north_south.includes(state)) {
                this.setVirtualRotation(PRIVARE_SYMBOL, rail_direction[state].rotate_north);
                this.setEnterDirection(PRIVARE_SYMBOL, "north");
            }
            else if (east_west.includes(state)) {
                this.setVirtualRotation(PRIVARE_SYMBOL, rail_direction[state].rotate_east);
                this.setEnterDirection(PRIVARE_SYMBOL, "west");
            }
        }
        system.run(() => this.gameloop(this));
    }
    setSpeed(speed) {
        this.entity.setDynamicProperty('rail_mo_plus:speed', speed);
    }
    getSpeed() {
        let speedDP = this.entity.getDynamicProperty('rail_mo_plus:speed');
        return typeof speedDP == 'number' ? speedDP : 0;
    }
    getVirtualRotation() {
        let vrotation_x_dp = this.entity.getDynamicProperty('rail_mo_plus:vrotation_x');
        let vrotation_y_dp = this.entity.getDynamicProperty('rail_mo_plus:vrotation_y');
        let vrotation_x = typeof vrotation_x_dp == "number" ? vrotation_x_dp : 0;
        let vrotation_y = typeof vrotation_y_dp == "number" ? vrotation_y_dp : 0;
        return { x: vrotation_x, y: vrotation_y };
    }
    /**
     * Internal use only
     * Sets the virtual rotation of the entity.
     * @param symbol Symbol stored in PRIVATE_SYMBOL
     * @param rotation The x and y virtual rotation of the entity (in degrees).
     */
    setVirtualRotation(symbol, rotation) {
        if (symbol != PRIVARE_SYMBOL)
            throw Error('Use from outside the module is not allowed.');
        this.entity.setDynamicProperty('rail_mo_plus:vrotation_x', rotation.x);
        this.entity.setDynamicProperty('rail_mo_plus:vtotation_y', rotation.y);
    }
    getEnterDirection() {
        let direction_dp = this.entity.getDynamicProperty('rail_mo_plus:enter_direction');
        if (typeof direction_dp != "string")
            throw Error('rail_mo_plus:enter_direction is not string');
        return direction_dp;
    }
    setEnterDirection(symbol, direction) {
        if (symbol != PRIVARE_SYMBOL)
            throw Error('Use from outside the module is not allowed.');
        this.entity.setDynamicProperty('rail_mo_plus:enter_direction', direction);
    }
    isValid() {
        return this.entity.isValid();
    }
    destroy() {
        this.isDestroyed = true;
        this.entity.setDynamicProperty('rail_mo_plus:enter_direction', undefined);
        this.entity.setDynamicProperty('rail_mo_plus:vrotation_x', undefined);
        this.entity.setDynamicProperty('rail_mo_plus:vtotation_y', undefined);
        this.entity.setDynamicProperty('rail_mo_plus:speed', undefined);
    }
    gameloop(car) {
        if (this.isDestroyed)
            return;
        do {
            const entity = this.entity;
            const location = entity.location;
            const blockLocation = toBlockLocation(location);
            const rotation = this.getVirtualRotation();
            const current_block = entity.dimension.getBlock(blockLocation);
            if (typeof current_block == "undefined")
                break;
            let state = current_block.permutation.getState('rail_direction');
            if (typeof state != 'number')
                break;
            const enter_edge = edge[direction_reverse[this.getEnterDirection()]];
            const start = { x: blockLocation.x + enter_edge.x, y: blockLocation.y + enter_edge.y, z: blockLocation.z + enter_edge.z };
            const end_edge = rail_direction[state][this.getEnterDirection()];
            const end = { x: blockLocation.x + end_edge.x, y: blockLocation.y + end_edge.y, z: blockLocation.z + end_edge.z };
            let after_location;
            world.sendMessage("state: " + state + "\n" + "block_location: " + blockLocation);
        } while (false);
        system.run(() => this.gameloop(this));
    }
}
//# sourceMappingURL=rail_mo_plus.js.map