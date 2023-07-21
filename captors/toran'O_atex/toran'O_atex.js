let watteco = require("../../codec/watteco_decodeUplink.js")

let batch_param = [4,[{taglbl: 0,resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 10,lblname: "index_2", divide: 1},
    { taglbl: 2, resol: 1, sampletype: 10,lblname: "index_3", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 1,lblname: "state_1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 1,lblname: "state_2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 1,lblname: "state_3", divide: 1},
    { taglbl: 6, resol: 0.004, sampletype: 12,lblname: "4-20_mA", divide: 1},
    { taglbl: 7, resol: 1, sampletype: 12,lblname: "0-5V_[1]", divide: 1},
    {taglbl: 8, resol: 1, sampletype: 12, lblname: "0-5V_[2]", divide: 1},
    {taglbl: 9, resol: 1, sampletype: 12, lblname: "ratio_[1]", divide: 1},
    {taglbl: 10, resol: 1, sampletype: 12, lblname: "ratio_[2]", divide: 1},
    {taglbl: 11, resol: 100, sampletype: 6, lblname: "battery_voltage", divide: 1}]];

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
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
let a = decodeUplink(input);