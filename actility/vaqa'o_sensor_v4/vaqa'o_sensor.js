let watteco = require("../../codec/decode_uplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 4,lblname: "occupancy", divide: 1},
    { taglbl: 1, resol: 10, sampletype: 7,lblname: "temperature_1", divide: 100},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "humidity_1", divide: 100},
    { taglbl: 3, resol: 10, sampletype: 6,lblname: "CO2", divide: 1},
    { taglbl: 4, resol: 10, sampletype: 6,lblname: "TVOC", divide: 1}]];

let endpointCorresponder = {
    Concentration: ["TVOC", "CO2"],
    temperature: ["temperature_1","temperature_2"],
    humidity: ["humidity_1","humidity_2"]
}
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


