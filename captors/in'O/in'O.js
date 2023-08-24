let watteco = require("../../codec/decode_uplink.js");

function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;
let clusters=["basic:0000","lorawan:8004","configuration:0050","binary:000F/*10","ON/OFF:0006/*4","multibinary:8005"]