let watteco = require("../../codec/decode_uplink")

function decodeUplink(input) {

    return result = watteco.watteco_decodeUplink(input);

}

module.exports.decodeUplink = decodeUplink;


let clusters=["basic:0000","lorawan:8004","configuration:0050","simplemetering:0052","ticCBE:0054","ticICE:0053","ticCJE:0055","ticSTD:0056","ticpmi:0057"]