let watteco = require("../../codec/decode_uplink")


function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;

let clusters=["basic:0000","lorawan:8004","configuration:0050","analoginput(angle):000C","chock:800E","occupency:0406"]