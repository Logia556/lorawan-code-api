let watteco = require("../../codec/decode_uplink")
let batch_param=[]
let endpointCorresponder={
    analog:["angle"]
}
function decodeUplink(input) {
    if ((input.bytes[2]===0x00)&&(input.bytes[3]===0x0C)){
        return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
    }
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;

