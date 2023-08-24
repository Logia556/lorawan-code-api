let watteco = require("../../codec/decode_uplink")

let batch_param = [4, [{taglbl: 0,resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 10,lblname: "index_2", divide: 1},
    { taglbl: 2, resol: 1, sampletype: 10,lblname: "index_3", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 1,lblname: "state_1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 1,lblname: "state_2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 1,lblname: "state_3", divide: 1},
    { taglbl: 6, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 7, resol: 1, sampletype: 6,lblname: "multi_state", divide: 100}]];

let endpointCorresponder={
    count:["index_1","index_2","index_3"],
    pin_state:["state_1","state_2","state_3"],
    polarity:["polarity_1","polarity_2","polarity_3"],
    edgeselection:["edge_1","edge_2","edge_3"],
    debounceperiod:["debounce_1","debounce_2","debounce_3"],
    pollperiod:["poll_1","poll_2","poll_3"],
    forcenotify:["force_1","force_2","force_3"],
}
function decodeUplink(input) {
    if (input.bytes[2] === 0x00 && input.bytes[3] === 0x0F) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;