import { system, Direction } from "@minecraft/server";
import { rail_direction } from "./rail_direction";
import { correctToRail, getNormalizedVector, getLerpVector, toBlockLocation, edge, direction_reverse, nextBlock, VectorAdd } from "./functions";
const PRIVARE_SYMBOL = Symbol('rail_mo_plus_private');
const north_south = [0, 4, 5];
const east_west = [1, 2, 3];
const ascending = [2, 3, 4, 5];
const curve = [6, 7, 8, 9];
export class RailMoPlusEntity {
    constructor(entity /*, rotate: boolean*/) {
        this.entity = entity;
        this.isDestroyed = false;
        //this.rotate = rotate;
        if (!entity.getDynamicPropertyIds().includes('rail_mo_plus:speed')) {
            entity.setDynamicProperty('rail_mo_plus:speed', 0);
        }
        this.entity.setDynamicProperty('rail_mo_plus:reverse', false);
        let current_time = new Date();
        this.setLastTickTime(PRIVARE_SYMBOL, current_time);
        if (!entity.getDynamicPropertyIds().includes('rail_mo_plus:vrotation_x') || !entity.getDynamicPropertyIds().includes('rail_mo_plus:vrotation_y')) {
            //virtual rotation
            const location = this.entity.location;
            const current_block = this.entity.dimension.getBlock({ x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) });
            if (typeof current_block == "undefined")
                return;
            let state = current_block.permutation.getState('rail_direction');
            if (typeof state != 'number')
                return;
            /*
            if(north_south.includes(state)){
              this.setVirtualRotation(PRIVARE_SYMBOL, {x: 0, y: 0});
              this.setEnterDirection(PRIVARE_SYMBOL, Direction.North);
            }else if(east_west.includes(state)){
              this.setVirtualRotation(PRIVARE_SYMBOL, {x: 0, y: -90});
              this.setEnterDirection(PRIVARE_SYMBOL, Direction.West);
            }
            */
        }
        system.run(() => this.gameloop());
    }
    entity;
    /**
     * Set the speed.
     * @param speed Speed (km/h) to be set
     */
    setSpeed(speed) {
        this.entity.setDynamicProperty('rail_mo_plus:speed', speed);
        let reverse = this.entity.getDynamicProperty('rail_mo_plus:reverse');
        if (reverse != speed < 0)
            this.setEnterDirection(PRIVARE_SYMBOL, direction_reverse[this.getEnterDirection()]);
        this.entity.setDynamicProperty('rail_mo_plus:reverse', speed < 0);
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
        if (typeof direction_dp != "string") {
            let block_location = toBlockLocation(this.entity.location);
            let current_block = this.entity.dimension.getBlock(block_location);
            let state = current_block.permutation.getState('rail_direction');
            if (typeof state != "number")
                throw new Error("Unable to resolve Enter direction.");
            direction_dp = rail_direction[state].default_enter;
            this.entity.setDynamicProperty('rail_mo_plus:enter_direction', direction_dp);
        }
        return direction_dp;
    }
    setEnterDirection(symbol, direction) {
        if (symbol != PRIVARE_SYMBOL)
            throw Error('Use from outside the module is not allowed.');
        this.entity.setDynamicProperty('rail_mo_plus:enter_direction', direction);
    }
    getLastTickTime() {
        let dp = this.entity.getDynamicProperty('rail_mo_plus:last_tick_time');
        if (typeof dp != 'number')
            throw Error('rail_mo_plus:last_tick_time is not a number.');
        return new Date(dp);
    }
    setLastTickTime(symbol, time) {
        if (symbol != PRIVARE_SYMBOL)
            throw Error('Use from outside the module is not allowed.');
        this.entity.setDynamicProperty('rail_mo_plus:last_tick_time', time.getTime());
    }
    isValid() {
        return this.entity.isValid() && !this.isDestroyed;
    }
    destroy() {
        this.isDestroyed = true;
        this.entity.setDynamicProperty('rail_mo_plus:enter_direction', undefined);
        this.entity.setDynamicProperty('rail_mo_plus:vrotation_x', undefined);
        this.entity.setDynamicProperty('rail_mo_plus:vtotation_y', undefined);
        this.entity.setDynamicProperty('rail_mo_plus:speed', undefined);
    }
    isDestroyed;
    gameloop() {
        if (!this.isValid())
            return;
        do {
            let entity = this.entity;
            let location = entity.location;
            let block_location = toBlockLocation(location);
            let current_block = entity.dimension.getBlock(block_location);
            if (typeof current_block == "undefined")
                break;
            let state = current_block.permutation.getState('rail_direction');
            if (typeof state != "number")
                break;
            let enter = this.getEnterDirection();
            let start = VectorAdd(block_location, edge[enter]);
            let end = VectorAdd(block_location, edge[rail_direction[state][enter].direction]);
            if (rail_direction[state][enter].ascending == Direction.Up)
                end = VectorAdd(end, { x: 0, y: 1, z: 0 });
            if (rail_direction[state][enter].ascending == Direction.Down)
                start = VectorAdd(start, { x: 0, y: 1, z: 0 });
            location = correctToRail(start, end, location);
            // km/h to m/ms
            const speed = this.getSpeed() / 3600;
            let last_time = this.getLastTickTime();
            let current_time = new Date();
            let time = current_time.getTime() - last_time.getTime();
            console.log(time);
            const distance = Math.abs(speed) * time;
            this.setLastTickTime(PRIVARE_SYMBOL, current_time);
            //Ignore gravity
            if (speed == 0) {
                entity.teleport(location);
                break;
            }
            let norm = getNormalizedVector(start, end, location);
            let target = distance + norm;
            while (true) {
                if (target >= 1) {
                    current_block = nextBlock(current_block, rail_direction[state][enter].direction, rail_direction[state][enter].ascending);
                    if (typeof current_block == "undefined")
                        break;
                    enter = direction_reverse[rail_direction[state][enter].direction];
                    block_location = current_block.location;
                    state = current_block.permutation.getState('rail_direction');
                    if (typeof state != "number")
                        break;
                    start = VectorAdd(block_location, edge[enter]);
                    end = VectorAdd(block_location, edge[rail_direction[state][enter].direction]);
                    target--;
                }
                else {
                    location = getLerpVector(start, end, target);
                    break;
                }
            }
            entity.teleport(location);
            this.setEnterDirection(PRIVARE_SYMBOL, enter);
        } while (false);
        system.run(() => this.gameloop());
    }
}
//# sourceMappingURL=rail_mo_plus.js.map