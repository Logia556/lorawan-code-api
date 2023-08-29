let watteco = require("../../codec/decode_uplink")

function strToDecimalArray(str){
    let hexArray = [];
    for (let i=0; i<str.length; i+=2) {
        hexArray.push(parseInt(str.substring(i, i+2), 16));
    }
    return hexArray;
}
let argv= process.argv.slice(2);


let bytes = [];
bytes = strToDecimalArray(argv[1]);

let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,
};
console.log(input)
function decodeUplink(input) {

    return result = watteco.watteco_decodeUplink(input);

}
let a = decodeUplink(input);
console.log(a);
module.exports.decodeUplink = decodeUplink;

