function decodeDownlink(input){
    let bytes = input.bytes;
    console.log(bytes)
    let decoded = {};
    let test = {
        0x06: "yis",
    }
    console.log(test)
    let cmdID = -1
    let clustID=-1
    let attID=-1
    cmdID =  bytes[1];
    clustID = bytes[2]*256 + bytes[3];
    attID = bytes[4]*256 + bytes[5];
    decoded.type = test[cmdID]
    return decoded;

}

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

let objet={
    bytes: [0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

let a = decodeDownlink(objet)
console.log(a)