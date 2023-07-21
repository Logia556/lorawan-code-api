const standard = require("./standard");
const batch = require("./batch");

function strToDecimalArray(str){
    let hexArray = [];
    for (let i=0; i<str.length; i+=2) {
        hexArray.push(parseInt(str.substring(i, i+2), 16));
    }
    return hexArray;
}

function watteco_decodeUplink(input, batch_parameters, endpoint_parameters) {
    let bytes = input.bytes;
    let port = input.fPort;
    let date = input.recvTime;

    try {
        let decoded = standard.normalisation(input, endpoint_parameters)
        let payload = decoded.payload;
        //console.log(decoded)
        if (decoded.type === "batch") {
            let batchInput = {
                batch1: batch_parameters[0],
                batch2: batch_parameters[1],
                payload: payload,
                date: date,
            }
            try {
                let decoded = batch.normalisation(batchInput)
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
                data: decoded.data,
                warnings: [decoded.warning],
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
    watteco_decodeUplink: watteco_decodeUplink,
    strToDecimalArray
}