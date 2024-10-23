export function randomId() {
    let time = new Date().getTime().toString(16).padStart(14, '0');
    let random = Math.floor(Math.random() * 2097152).toString(16).padStart(6, '0');
    return time + random;
}
export function randomId_no_duplication(id) {
    while (true) {
        let random = randomId();
        if (!id.includes(random)) {
            return random;
        }
    }
}
export function between(number, min, max) {
    return number >= min && number <= max;
}
export function encodeBinURI(str) {
    let bytes = [];
    let uri_encoded_str = encodeURIComponent(str);
    while (uri_encoded_str) {
        if (uri_encoded_str.startsWith('%')) {
            let hex = uri_encoded_str.slice(1, 3);
            console.log(hex);
            bytes.push(parseInt(hex, 16));
            uri_encoded_str = uri_encoded_str.slice(3);
        }
        else {
            let char_code = uri_encoded_str.charCodeAt(0);
            bytes.push(char_code);
            uri_encoded_str = uri_encoded_str.slice(1);
        }
    }
    return new Uint8Array(bytes);
}
export function decodeBinURI(uri) {
    let uri_str = '';
    for (const byte of uri) {
        uri_str += '%' + byte.toString(16).toUpperCase();
    }
    return decodeURIComponent(uri_str);
}
//# sourceMappingURL=functions.js.map