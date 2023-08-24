let watteco = require("../../codec/watteco_decodeUplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 4,lblname: "occupancy", divide: 1},
    { taglbl: 1, resol: 10, sampletype: 7,lblname: "temperature_0", divide: 100},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "humidity_0", divide: 100},
    { taglbl: 3, resol: 10, sampletype: 6,lblname: "CO2", divide: 1},
    { taglbl: 4, resol: 10, sampletype: 6,lblname: "TVOC", divide: 1},
    { taglbl: 5, resol: 10, sampletype: 6,lblname: "illuminance", divide: 1},
    { taglbl: 6, resol: 10, sampletype: 6,lblname: "pressure", divide: 10}]];

let endpointCorresponder = {
    Concentration: ["TVOC", "CO2"],
    temperature: ["temperature_0","temperature_1"],
    humidity: ["humidity_0","humidity_1"]
}
let argv= process.argv.slice(2);

let bytes = [];
bytes = watteco.strToDecimalArray(argv[1]);
let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,

};
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