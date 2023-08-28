let watteco = require("../../codec/decode_uplink")

function decodeUplink(input) {

    return result = watteco.watteco_decodeUplink(input);

}

module.exports.decodeUplink = decodeUplink;

let clusters=["binary:000F/*2","basic:0000","lorawan:8004","configuration:0050",]