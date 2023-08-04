let watteco = require("../../codec/decode_minimized.js")

let batch_param = [3, [{taglbl: 0,resol: 10, sampletype: 7,lblname: "temperature", divide: 100},
    { taglbl: 5, resol: 100, sampletype: 6, lblname: "battery_voltage", divide: 1000}]];
/*
let argv= process.argv.slice(2);

let bytes = [];
bytes = watteco.strToDecimalArray(argv[1]);
let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,

};*/
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;