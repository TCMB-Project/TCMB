export function findFirstMatch(array, searchString) {
    let match = array.find(element => element.startsWith(searchString));
    if (match) {
        return array.indexOf(match);
    }
    else {
        return -1;
    }
}
export function decimalPart(number) {
    let string_number = number.toString();
    let string_array = string_number.split('.');
    return Number(string_array[1]);
}
// ローカル座標をワールド座標に変換する関数
export function localToWorld(position, local, rotation) {
    // 向きに応じて変換行列を作成
    let yaw = rotation.y * Math.PI / 180; // ヨー角をラジアンに変換
    let pitch = rotation.x * Math.PI / 180; // ピッチ角をラジアンに変換
    let cosYaw = Math.cos(yaw);
    let sinYaw = Math.sin(yaw);
    let cosPitch = Math.cos(pitch);
    let sinPitch = Math.sin(pitch);
    let matrix = [
        [cosYaw, 0, -sinYaw],
        [sinYaw * sinPitch, cosPitch, cosYaw * sinPitch],
        [sinYaw * cosPitch, -sinPitch, cosYaw * cosPitch]
    ]; // 変換行列
    // ローカル座標をワールド座標に変換
    let world = {
        x: position.x + matrix[0][0] * local.x + matrix[0][1] * local.y + matrix[0][2] * local.z,
        y: position.y + matrix[1][0] * local.x + matrix[1][1] * local.y + matrix[1][2] * local.z,
        z: position.z + matrix[2][0] * local.x + matrix[2][1] * local.y + matrix[2][2] * local.z
    }; // ワールド座標
    // ワールド座標を返す
    return world;
}
export function getTrainTypeId(train) {
    return train.body[0].typeId.substring(0, train.body[0].typeId.length - 5);
}
export function getTCManifest(train) {
    if (train.entity.getDynamicPropertyIds().includes('tcmanifest')) {
        let manifest_property = train.entity.getDynamicProperty('tcmanifest');
        if (typeof manifest_property == 'string') {
            return JSON.parse(manifest_property);
        }
        else {
            throw new TypeError('TCManifest on DP is not a string.');
        }
    }
    else {
        return undefined;
    }
}
export function hasTCManifest(train) {
    if (train.entity.getDynamicPropertyIds().includes('tcmanifest')) {
        return true;
    }
    else {
        return false;
    }
}
export function getSpeedSpec(train) {
    if (!hasTCManifest(train))
        return undefined;
    let manifest = getTCManifest(train);
    if (typeof manifest.speed == 'object') {
        return manifest.speed;
    }
    else {
        return undefined;
    }
}
export function toBCD(number) {
    const BCD_LIST = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-'];
    let string_number = number.toString();
    let bcds = [];
    for (const digit of string_number) {
        let bcd = BCD_LIST.indexOf(digit);
        bcds.push(bcd);
    }
    return bcds;
}
export function fromBCD(number) {
    const BCD_LIST = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-'];
    let string_number = '';
    for (const digit of number) {
        string_number += BCD_LIST[digit];
    }
    return Number(string_number);
}
//# sourceMappingURL=util.js.map