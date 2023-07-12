let nke = require("../../codec/nke_decodeUplink.js")

let batch_param = [3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "4-20mA", divide: 1},{ taglbl: 1, resol: 1, sampletype: 12,lblname: "0-10V", divide: 1}, { taglbl: 2, resol: 100, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}, { taglbl: 3, resol: 100, sampletype: 6,lblname: "ExternalPowerVoltage", divide: 1000},{ taglbl: 4, resol: 1, sampletype: 10,lblname: "Index", divide: 1}]]

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