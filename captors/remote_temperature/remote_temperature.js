let nke = require("../../codec/nke_decodeUplink.js")

let batch_param = [1, [{taglbl: 0,resol: 10, sampletype: 7,lblname: "Temperature", divide: 100},{ taglbl: 1, resol: 100, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}]]

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