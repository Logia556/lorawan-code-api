let nke = require("../../codec/nke_decodeUplink.js")

let batch_param = [4, [{taglbl: 0,resol: 1, sampletype: 10,lblname: "Index1", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 10,lblname: "Index2", divide: 1},
    { taglbl: 2, resol: 1, sampletype: 10,lblname: "Index3", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 1,lblname: "State1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 1,lblname: "State2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 1,lblname: "State3", divide: 1},
    { taglbl: 6, resol: 100, sampletype: 6,lblname: "BatteryVoltage", divide: 1000},
    { taglbl: 7, resol: 1, sampletype: 6,lblname: "MultiState", divide: 100}]];

let argv= process.argv.slice(2);

let bytes = [];
bytes = nke.strToDecimalArray(argv[1]);
let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,

};
function decodeUplink(input) {
    return result = nke.nke_decodeUplink(input,batch_param);
}