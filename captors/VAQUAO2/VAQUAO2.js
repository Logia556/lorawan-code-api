let nke = require("../../codec/nke_decodeUplink.js")

let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 4,lblname: "Occupancy", divide: 1},
    { taglbl: 1, resol: 10, sampletype: 7,lblname: "Temperature", divide: 100},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "Humidity", divide: 100},
    { taglbl: 3, resol: 10, sampletype: 6,lblname: "CO2", divide: 1},
    { taglbl: 4, resol: 10, sampletype: 6,lblname: "VOC", divide: 1},
    { taglbl: 5, resol: 10, sampletype: 6,lblname: "Illuminance", divide: 1},
    { taglbl: 6, resol: 10, sampletype: 6,lblname: "Pressure", divide: 10},
    { taglbl: 7, resol: 10, sampletype: 10,lblname: "bVOC", divide: 1} ]]

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