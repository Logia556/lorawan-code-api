let watteco = require("../../codec/decode_uplink.js")

let batch_param = [1, [{ taglbl: 0, resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 1, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000}]];

function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;

