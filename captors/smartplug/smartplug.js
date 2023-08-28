let watteco = require("../../codec/decode_uplink")

function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input);
}
module.exports.decodeUplink = decodeUplink;

