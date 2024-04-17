export function speed_eval(speed_spec, speed, mnotch, notch) {
    if (notch.startsWith('p')) {
        //power
        let acceleration;
        if (typeof speed_spec != 'undefined') {
            // speed is defined
            if (speed_spec.evaluation == false) {
                acceleration = 0;
            }
            else if (Array.isArray(speed_spec.acceleration)) {
                //mnotch to sysnotch
                let sysnotch = Number(notch.replace('p', ''));
                if (typeof mnotch != 'undefined') {
                    sysnotch = speed_spec.acceleration.length * (sysnotch / mnotch.power);
                }
                //Determination of acceleration
                let acceleration_list = speed_spec.acceleration[sysnotch - 1];
                if (Array.isArray(acceleration_list)) {
                    acceleration = acceleration_list[speed];
                }
            }
        }
        else {
            //speed is not defined
            if (typeof mnotch != 'undefined') {
                acceleration = 4 * (mnotch.power / Number(notch.replace('p', '')));
            }
            else {
                acceleration = 4 * (4 / Number(notch.replace('p', '')));
            }
        }
        //Calculate speed
        let kmh_per_tick = acceleration / 20;
        speed += kmh_per_tick;
        return speed;
    }
    else if (notch.startsWith('b')) {
        //break
    }
}
//# sourceMappingURL=speed_eval.js.map