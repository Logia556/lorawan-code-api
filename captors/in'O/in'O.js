let watteco = require("../../codec/decode_uplink.js");

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

let endpointCorresponder={
    pin_state:["pin_state_1","pin_state_2", "pin_state_3", "pin_state_4", "pin_state_5", "pin_state_6", "pin_state_7", "pin_state_8", "pin_state_9", "pin_state_10"],
    counter:["index_1", "index_2", "index_3", "index_4", "index_5", "index_6", "index_7", "index_8", "index_9", "index_10"],
    state:["output_1", "output_2", "output_3", "output_4"]
}
let batch_param=[]
function decodeUplink(input) {
    if ((input.bytes[2]===0x00)&&(input.bytes[3]===0x0F)){
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    if ((input.bytes[2]===0x00)&&(input.bytes[3]===0x06)){
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input);
}
module.exports.decodeUplink = decodeUplink;
let a = decodeUplink(input);
console.log(a);