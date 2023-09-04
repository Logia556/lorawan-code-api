let watteco = require("../../codec/decode_uplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 7,lblname: "temperature", divide: 100},
    { taglbl: 1, resol: 1, sampletype: 6,lblname: "humidity", divide: 100},
    { taglbl: 2, resol: 1, sampletype: 7,lblname: "pressure", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "index_2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 6,lblname: "battery_voltage", divide: 1000}]];

let endpointCorresponder={
    count:["index_1","index_2"],
}

function strToDecimalArray(str){
    let hexArray = [];
    for (let i=0; i<str.length; i+=2) {
        hexArray.push(parseInt(str.substring(i, i+2), 16));
    }
    return hexArray;
}
let argv= process.argv.slice(2);


let bytes = [];
bytes = strToDecimalArray(argv[1]);

let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,
};
console.log(input)

function decodeUplink(input) {
    if (input.bytes[2] === 0x00 && input.bytes[3] === 0x0F) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;
let a = decodeUplink(input);
console.log(a);
