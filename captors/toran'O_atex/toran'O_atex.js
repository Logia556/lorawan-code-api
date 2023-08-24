let watteco = require("../../codec/decode_uplink")

let batch_param = [4,[{taglbl: 0,resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 10,lblname: "index_2", divide: 1},
    { taglbl: 2, resol: 1, sampletype: 10,lblname: "index_3", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 1,lblname: "state_1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 1,lblname: "state_2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 1,lblname: "state_3", divide: 1},
    { taglbl: 6, resol: 0.004, sampletype: 12,lblname: "4-20_mA", divide: 1},
    { taglbl: 7, resol: 1, sampletype: 12,lblname: "0-5_V_1", divide: 1},
    {taglbl: 8, resol: 1, sampletype: 12, lblname: "0-5_V_2", divide: 1},
    {taglbl: 9, resol: 1, sampletype: 12, lblname: "ratiometric_0-5_V_1", divide: 1},
    {taglbl: 10, resol: 1, sampletype: 12, lblname: "ratiometric_0-5_V_2", divide: 1},
    {taglbl: 11, resol: 100, sampletype: 6, lblname: "battery_voltage", divide: 1}]];


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
    recvTime: date,

};
let endpointCorresponder = {
    analog:["4-20_mA","0-5_V_1","0-5_V_2 ","ratiometric_0-5_V_1","ratiometric_0-5_V_2"],
    count:["index_1","index_2","index_3"],
    pin_state:["state_1","state_2","state_3"],
    polarity:["polarity_1","polarity_2","polarity_3"],
    edgeselection:["edge_1","edge_2","edge_3"],
    debounceperiod:["debounce_1","debounce_2","debounce_3"],
    pollperiod:["poll_1","poll_2","poll_3"],
    forcenotify:["force_1","force_2","force_3"],
}

console.log(input);
function decodeUplink(input) {
    if (input.bytes[2] === 0x00 && input.bytes[3] === 0x0C) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    if (input.bytes[2] === 0x00 && input.bytes[3] === 0x0F) {
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;
let a = decodeUplink(input);
console.log(a);

let clusters=["binary:000F/*3","basic:0000","lorawan:8004","configuration:0050","analoginput:000C/*5","multibinary:8005"]