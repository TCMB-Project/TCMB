export const rail_direction = [
    //rail_direction=0 north_south
    {
        north: { x: 0, y: 0, z: -1 },
        south: { x: 0, y: 0, z: 1 },
        east: { x: 0.5, y: 0, z: 0.5 },
        west: { x: 0, y: 0, z: 1 },
        rotate_north: { x: 0, y: 0 },
        rotate_south: { x: 0, y: 0 },
        rotate_east: { x: 0, y: 90 },
        rotate_west: { x: 0, y: -90 }
    },
    //rail_direction=1 east_west
    {
        north: { x: 1, y: 0, z: 0 },
        south: { x: 1, y: 0, z: 0 },
        east: { x: 1, y: 0, z: 1 },
        west: { x: -1, y: 0, z: 1 },
        rotate_north: { x: 0, y: -90 },
        rotate_south: { x: 0, y: 90 },
        rotate_east: { x: 0, y: 0 },
        rotate_west: { x: 0, y: 0 }
    },
    //rail_direction=2 ascending_east
    {
        north: { x: -1, y: 0, z: 0 },
        south: { x: -1, y: 0, z: 0 },
        east: { x: 1, y: 1, z: 0 },
        west: { x: -1, y: -1, z: 0 },
        rotate_north: { x: 0, y: -90 },
        rotate_south: { x: 0, y: 90 },
        rotate_east: { x: 0, y: 0 },
        rotate_west: { x: 0, y: 0 }
    },
    //rail_direction=3 ascending_west
    {
        north: { x: -1, y: 0, z: 0 },
        south: { x: -1, y: 0, z: 0 },
        east: { x: -1, y: -1, z: 0 },
        west: { x: 1, y: 1, z: 0 },
        rotate_north: { x: 0, y: -90 },
        rotate_south: { x: 0, y: 90 },
        rotate_east: { x: 0, y: 0 },
        rotate_west: { x: 0, y: 0 }
    },
    //rail_direction=4 ascending_north
    {
        north: { x: 0, y: 1, z: -1 },
        south: { x: 0, y: -1, z: 1 },
        east: { x: 0, y: 0, z: 1 },
        west: { x: 0, y: 0, z: 1 },
        rotate_north: { x: 0, y: 0 },
        rotate_south: { x: 0, y: 0 },
        rotate_east: { x: 0, y: 90 },
        rotate_west: { x: 0, y: -90 }
    },
    //rail_direction=5 ascending_south
    {
        north: { x: 0, y: -1, z: -1 },
        south: { x: 0, y: 1, z: 1 },
        east: { x: 0, y: 0, z: -1 },
        west: { x: 0, y: 0, z: -1 },
        rotate_north: { x: 0, y: 0 },
        rotate_south: { x: 0, y: 0 },
        rotate_east: { x: 0, y: -90 },
        rotate_west: { x: 0, y: 90 }
    },
    //rail_direction=6 south_east
    {
        north: { x: 0.5, y: 0, z: -0.5 },
        south: { x: 0, y: 0, z: 1 },
        east: { x: 1, y: 0, z: 0 },
        west: { x: -0.5, y: 0, z: 0.5 },
        rotate_north: { x: 0, y: 90 },
        rotate_south: { x: 0, y: 0 },
        rotate_west: { x: 0, y: -90 },
        rotate_east: { x: 0, y: 0 }
    },
    //rail_direction=7 south_west
    {
        north: { x: -0.5, y: 0, z: 0.5 },
        south: { x: 0, y: 0, z: 1 },
        east: { x: 0.5, y: 0, z: 0.5 },
        west: { x: -1, y: 0, z: 0 },
        rotate_north: { x: 0, y: -90 },
        rotate_south: { x: 0, y: 0 },
        rotate_east: { x: 0, y: 90 },
        rotate_west: { x: 0, y: 0 }
    },
    //rail_direction=8 north_west
    {
        north: { x: 0, y: 0, z: -1 },
        south: { x: -0.5, y: 0, z: 0.5 },
        east: { x: 0.5, y: 0, z: -0.5 },
        west: { x: -1, y: 0, z: 0 },
        rotate_north: { x: 0, y: 0 },
        rotate_south: { x: 0, y: 90 },
        rotate_east: { x: 0, y: -90 },
        rotate_west: { x: 0, y: 0 }
    },
    //rail_direction=9 north_east
    {
        north: { x: 0, y: 0, z: -1 },
        south: { x: 0.5, y: 0, z: 0.5 },
        east: { x: 1, y: 0, z: 0 },
        west: { x: -0.5, y: 0, z: -0.5 },
        rotate_north: { x: 0, y: 0 },
        rotate_south: { x: 0, y: -90 },
        rotate_east: { x: 0, y: 0 },
        rotate_west: { x: 0, y: 90 }
    }
];
//# sourceMappingURL=rail_direction.js.map