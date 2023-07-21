let watteco = require("../../codec/watteco_decodeUplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 7,lblname: "mean_differential_pressure_since_last_report"},
    { taglbl: 1, resol: 1, sampletype: 7,lblname: "minimal_differential_pressure_since_last_report"},
    { taglbl: 2, resol: 1, sampletype: 7,lblname: "maximal_differential_pressure_since_last_report"},
    { taglbl: 3, resol: 1, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 4, resol: 10, sampletype: 7,lblname: "temperature", divide: 100},
    { taglbl: 5, resol: 1, sampletype: 7,lblname: "differential_pressure"},
    { taglbl: 6, resol: 1, sampletype: 10,lblname: "index", divide: 1},
    { taglbl: 7, resol: 1, sampletype: 1,lblname: "state", divide: 1}]];

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