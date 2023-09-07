let watteco = require("../../codec/decode_uplink")
let batch_param=[]
let endpointCorresponder={
    analog:["angle"]
}
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

