let watteco = require("../../codec/decode_uplink")

let batch_param =[3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "NA", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 12,lblname: "current", divide: 1},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 3, resol: 100, sampletype: 6,lblname: "external_power_voltage", divide: 1000},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "index", divide: 1}]];

let endpointCorresponder={
    analog:["NA","current"]
}
function decodeUplink(input) {
    if (input.bytes[2] === 0x00 && input.bytes[3] === 0x0C) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;

