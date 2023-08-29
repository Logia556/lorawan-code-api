let watteco = require("../../codec/decode_uplink.js");

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
