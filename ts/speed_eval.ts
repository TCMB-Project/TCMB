import { MNotch, TCManifest, TrainSpeedSpec } from "./classes";

export function speed_eval(speed: number, mnotch: MNotch, notch: string): number | undefined {
  if(notch.startsWith('p')){
    //power
    let acceleration;
    //speed is not defined
    if(typeof mnotch != 'undefined'){
      acceleration = 4 * (Number(notch.replace('p', '')) / mnotch.power);
    }else{
      acceleration = 4 * (Number(notch.replace('p', '')) / 4);
    }
    //Calculate speed
    let kmh_per_tick = acceleration / 20;
    speed += kmh_per_tick;
    return speed;
  }else if(notch.startsWith('b')){
    //break
  }else{
    return speed;
  }
}