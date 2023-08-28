let watteco = require("../../codec/decode_uplink")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 4,lblname: "occupancy", divide: 1},
    { taglbl: 1, resol: 10, sampletype: 7,lblname: "temperature_0", divide: 100},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "humidity_0", divide: 100},
    { taglbl: 3, resol: 10, sampletype: 6,lblname: "CO2", divide: 1},
    { taglbl: 4, resol: 10, sampletype: 6,lblname: "TVOC", divide: 1}]];


function decodeUplink(input) {

    return result = watteco.watteco_decodeUplink(input, batch_param);

}

module.exports.decodeUplink = decodeUplink;


