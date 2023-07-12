let batch = require("../../codec/batch.js")
let standard = require("../../codec/standard.js")


let argv= process.argv.slice(2);

let bytes = [];
bytes = batch.strToDecimalArray(argv[1]);
let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,

};
function decodeUplink(input) {
    let decoded = standard.Decoder(bytes, input.fPort);
    let payload = decoded["lora"]["payload"];
    if (decoded["batch"] !== undefined) {
        let bytes = batch.strToHexArray(payload);
        let decoded = batch.brUncompress(3, [{taglbl: 0,resol: 1, sampletype: 7,lblname: "MeanDifferentialPressureSinceLastReport"},{ taglbl: 1, resol: 1, sampletype: 7,lblname: "MinimalDifferentialPressureSinceLastReport"},{ taglbl: 2, resol: 1, sampletype: 7,lblname: "MaximalDifferentialPressureSinceLastReport"}, { taglbl: 3, resol: 1, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}, { taglbl: 4, resol: 10, sampletype: 7,lblname: "Temperature", divide: 100},{ taglbl: 5, resol: 1, sampletype: 7,lblname: "DifferentialPressure"},{ taglbl: 6, resol: 1, sampletype: 10,lblname: "Index", divide: 1},{ taglbl: 7, resol: 1, sampletype: 1,lblname: "State", divide: 1}] ,bytes, input.date);
        if (batch.err_msg.length > 0) {
            decoded = null;
            return {
                error: batch.err_msg,
                warnings: [],
            };
        }
        return {
            data: decoded,
            warnings: [],
        };
    }
    return {
        data: decoded,
        warnings: [],
    };
}