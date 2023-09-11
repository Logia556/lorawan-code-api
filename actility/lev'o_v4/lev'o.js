let watteco = require("../../codec/decode_uplink")

let batch_param = [3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "delta_pressure", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 12,lblname: "fluid_level", divide: 1},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 3, resol: 100, sampletype: 6,lblname: "external_power_voltage", divide: 1000},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "index", divide: 1}]];
let endpointCorresponder={
    analog:["delta_pressure","fluid_level"]
}
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;
