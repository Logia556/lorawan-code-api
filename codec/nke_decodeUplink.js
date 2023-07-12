const standard = require("./standard");
const batch = require("./batch");


function strToDecimalArray(str){
    let hexArray = [];
    for (let i=0; i<str.length; i+=2) {
        hexArray.push(parseInt(str.substring(i, i+2), 16));
    }
    return hexArray;
}

function strToHexArray(str){
    let hexArray = [];
    for (let i=0; i<str.length; i+=2) {
        hexArray.push(str.substring(i, i+2));
    }
    return hexArray;
}
function nke_decodeUplink(input,batch_parmaeters) {
    let bytes = input.bytes;
    try {
        let decoded = standard.Decoder(bytes, input.fPort);
        let payload = decoded["lora"]["payload"];
        console.log(payload);
        if (decoded["batch"] !== undefined) {
            let bytes = strToHexArray(payload)
            console.log(bytes)
            try {
                let decoded = batch.brUncompress(batch_parmaeters[0], batch_parmaeters[1], bytes, input.date)
                return {
                    data: decoded,
                    warnings: [],
                }
            } catch (error) {
                return {
                    error: error.message,
                    warnings: [],
                }
            }
        } else {
            return {
                data: decoded,
                warnings: [],
            };
        }
    } catch (error) {
        return {
            error: error.message,
            warnings: [],
        };
    }
}

module.exports = {
    nke_decodeUplink,
    strToHexArray,
    strToDecimalArray
}