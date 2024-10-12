import { Direction } from "@minecraft/server";
const { North, South, East, West, Up, Down } = Direction;
export const rail_direction = [
    //rail_direction=0 north_south
    {
        North: { direction: South },
        South: { direction: North },
        East: { direction: South },
        West: { direction: South },
        default_enter: North
    },
    //rail_direction=1 east_west
    {
        North: { direction: East },
        South: { direction: East },
        East: { direction: West },
        West: { direction: East },
        default_enter: West
    },
    //rail_direction=2 ascending_east
    {
        North: { direction: West },
        South: { direction: West },
        East: { direction: West, ascending: Down },
        West: { direction: East, ascending: Up },
        default_enter: East
    },
    //rail_direction=3 ascending_west
    {
        North: { direction: East },
        South: { direction: East },
        East: { direction: West, ascending: Up },
        West: { direction: East, ascending: Down },
        default_enter: West
    },
    //rail_direction=4 ascending_north
    {
        North: { direction: South, ascending: Down },
        South: { direction: North, ascending: Up },
        East: { direction: South },
        West: { direction: South },
        default_enter: North
    },
    //rail_direction=5 ascending_south
    {
        North: { direction: South, ascending: Up },
        South: { direction: North, ascending: Down },
        East: { direction: South },
        West: { direction: South },
        default_enter: South
    },
    //rail_direction=6 south_east
    {
        North: { direction: South },
        South: { direction: East },
        East: { direction: South },
        West: { direction: East },
        default_enter: East
    },
    //rail_direction=7 south_west
    {
        North: { direction: South },
        South: { direction: West },
        East: { direction: West },
        West: { direction: South },
        default_enter: West
    },
    //rail_direction=8 north_west
    {
        North: { direction: West },
        South: { direction: North },
        East: { direction: West },
        West: { direction: North },
        default_enter: North
    },
    //rail_direction=9 north_east
    {
        North: { direction: East },
        South: { direction: North },
        East: { direction: North },
        West: { direction: East },
        default_enter: North
    }
];
//# sourceMappingURL=rail_direction.js.map