let batch = require("../codec/batch.js")
let standard = require("../codec/standard.js")


let argv= process.argv.slice(2);
console.log(argv);

let bytes = [];
bytes = batch.strToDecimalArray(argv[1]);
console.log(bytes);
let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,

};
console.log("lol")
function decodeUplink(input) {
    let decoded = standard.Decoder(bytes, input.fPort);
    let payload = decoded["lora"]["payload"];
    console.log(payload);
    if (decoded["batch"] !== undefined) {
        let bytes = batch.strToHexArray(payload)
        console.log(bytes)
        let decoded = batch.brUncompress(3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "4_20mA", divide: 1},{ taglbl: 1, resol: 1, sampletype: 12,lblname: "0_10V", divide: 1}, { taglbl: 2, resol: 100, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}, { taglbl: 3, resol: 100, sampletype: 6,lblname: "ExternalPowerVoltage", divide: 1000},{ taglbl: 4, resol: 1, sampletype: 10,lblname: "Index", divide: 1}] ,bytes, input.date)
        console.log(batch.err_msg)
        if (batch.err_msg.length > 0) {
            decoded = null;
            console.log(batch.err_msg[0])
            console.log(batch.err_msg[1])
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

a = decodeUplink(input);
console.log(a);

console.log(a.data)
console.log(a.data.dataset)





