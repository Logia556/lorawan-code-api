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
        let decoded = batch.brUncompress(3, [{taglbl: 0,resol: 10, sampletype: 10,lblname: "tVOC", divide: 1},
            { taglbl: 1, resol: 10, sampletype: 7,lblname: "Temperature", divide: 100},
            { taglbl: 2, resol: 100, sampletype: 6,lblname: "Humidity", divide: 100},
            { taglbl: 3, resol: 10, sampletype: 6,lblname: "CO2", divide: 1},
            { taglbl: 4, resol: 10, sampletype: 6,lblname: "RIAQ", divide: 1},
            { taglbl: 5, resol: 10, sampletype: 6,lblname: "IAQ", divide: 1},
            { taglbl: 6, resol: 10, sampletype: 6,lblname: "eCO2", divide: 1},
            { taglbl: 7, resol: 1, sampletype: 10,lblname: "RMOX", divide: 1} ] ,bytes, input.date);
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