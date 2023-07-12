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
        let decoded = batch.brUncompress(4,[{taglbl: 0,resol: 1, sampletype: 10,lblname: "Index1", divide: 1},{ taglbl: 1, resol: 1, sampletype: 10,lblname: "Index2", divide: 1}, { taglbl: 2, resol: 1, sampletype: 10,lblname: "Index3", divide: 1}, { taglbl: 3, resol: 1, sampletype: 1,lblname: "State1", divide: 1},{ taglbl: 4, resol: 1, sampletype: 1,lblname: "State2", divide: 1}, { taglbl: 5, resol: 1, sampletype: 1,lblname: "State3", divide: 1}, { taglbl: 6, resol: 0.004, sampletype: 12,lblname: "4-20mA", divide: 1}, { taglbl: 7, resol: 1, sampletype: 12,lblname: "0-5V[Measure-1]", divide: 1}, {taglbl: 8, resol: 1, sampletype: 12, lblname: "0-5V[Measure-2]", divide: 1}, {taglbl: 9, resol: 1, sampletype: 12, lblname: "ratio[Measure-1]", divide: 1}, {taglbl: 10, resol: 1, sampletype: 12, lblname: "ratio[Measure-2]", divide: 1}, {taglbl: 11, resol: 100, sampletype: 6, lblname: "BatteryVoltage", divide: 1}] ,bytes, input.date);
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