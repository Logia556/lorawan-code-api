let watteco = require("../../codec/watteco_decodeUplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 7,lblname: "Temperature", divide: 100},
    { taglbl: 1, resol: 1, sampletype: 6,lblname: "Humidity", divide: 100},
    { taglbl: 2, resol: 1, sampletype: 7,lblname: "Pressure", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 10,lblname: "Index1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "Index2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}]];


let argv= process.argv.slice(2);

let bytes = [];
bytes = watteco.strToDecimalArray(argv[1]);
let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,

};
console.log(input);
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
let a = decodeUplink(input);

console.log(a);