let watteco = require("../../codec/watteco_decodeUplink.js")


let argv= process.argv.slice(2);

let batch_param = [1, [{ taglbl: 0, resol: 1, sampletype: 9, lblname: "active_energy", divide: 1}]]

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