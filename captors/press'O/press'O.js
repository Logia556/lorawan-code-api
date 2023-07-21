let watteco = require("../../codec/watteco_decodeUplink.js")


let batch_param = [3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "4-20_mA", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 12,lblname: "0-10_V", divide: 1},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 3, resol: 100, sampletype: 6,lblname: "external_powerVoltage", divide: 1000},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "index", divide: 1}]];

let endpointCorresponder={
    analog:["4_20mA","0_10V"]
}

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
    return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);

}

