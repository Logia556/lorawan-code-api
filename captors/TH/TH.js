let watteco = require("../../codec/watteco_decodeUplink.js")

let batch_param = [2, [{ taglbl: 0, resol: 10, sampletype: 7, lblname: "Temperature", divide: 100 },
    { taglbl: 1, resol: 100, sampletype: 6, lblname: "Humidity", divide: 100 },
    { taglbl: 2, resol: 1, sampletype: 6, lblname: "BatteryVoltage", divide: 1000 }]];

let argv= process.argv.slice(2);

let bytes = [];
bytes = watteco.strToDecimalArray(argv[1]);

let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: new Date(),

};
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);

}
