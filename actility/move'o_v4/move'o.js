let watteco = require("../../codec/decode_uplink")

let batch_param=[]
function decodeUplink(input) {

    return result = watteco.watteco_decodeUplink(input,batch_param);

}
module.exports.decodeUplink = decodeUplink;