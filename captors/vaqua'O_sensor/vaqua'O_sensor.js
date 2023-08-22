let watteco = require("../../codec/decode_uplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 4,lblname: "occupancy", divide: 1},
    { taglbl: 1, resol: 10, sampletype: 7,lblname: "temperature", divide: 100},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "humidity", divide: 100},
    { taglbl: 3, resol: 10, sampletype: 6,lblname: "CO2", divide: 1},
    { taglbl: 4, resol: 10, sampletype: 6,lblname: "VOC", divide: 1}]];

let endpointCorresponder = {
    Concentration: ["TVOC", "CO2"],
    temperature: ["temperature: +/- 0,5°C [1/100 °C]","temperature: +/-0,2°C [1/100 °C]"],
    humidity: ["humidity: +/- 3% [1/100 %]","humidity: +/- 2% [1/100 %]"]
}
function strToDecimalArray(str) {
    let arr = [];
    for (let i = 0; i < str.length; i += 2) {
        arr.push(parseInt(str.substr(i, 2), 16));
    }
    return arr;
}
let argv= process.argv.slice(2);
let bytes = [];
bytes = strToDecimalArray(argv[1]);

let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: new Date(),
};
console.log(input)
function decodeUplink(input) {
    if (input.bytes[2] === 0x80 && input.bytes[3] === 0x0C) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    if (input.bytes[2] === 0x04 && input.bytes[3] === 0x02) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    if (input.bytes[2] === 0x04 && input.bytes[3] === 0x05) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input,batch_param);

}
module.exports.decodeUplink = decodeUplink;
let a = decodeUplink(input);
console.log(a);