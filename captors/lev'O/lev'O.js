let batch = require("../../codec/batch.js")
let standard = require("../../codec/standard.js")


let argv= process.argv.slice(2);

let bytes = [];
bytes = batch.strToDecimalArray(argv[1]);

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: new Date(),

};
function decodeUplink(input) {
    let decoded = standard.Decoder(bytes, input.fPort);
    let payload = decoded["lora"]["payload"];
    if (decoded["batch"] !== undefined) {
        let bytes = batch.strToHexArray(payload);
        let decoded = batch.brUncompress(3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "DeltaPressure", divide: 1},{ taglbl: 1, resol: 1, sampletype: 12,lblname: "FluidLevel", divide: 1}, { taglbl: 2, resol: 100, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}, { taglbl: 3, resol: 100, sampletype: 6,lblname: "ExternalPowerVoltage", divide: 1000},{ taglbl: 4, resol: 1, sampletype: 10,lblname: "Index", divide: 1}] ,bytes, input.date);
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