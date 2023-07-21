/*
 * JavaScript implementation of brUncompress.
 * for NodeRed
 */

// {{{ Constants

var ST_UNDEF = 0;
var ST_BL = 1;
var ST_U4 = 2;
var ST_I4 = 3;
var ST_U8 = 4;
var ST_I8 = 5;
var ST_U16 = 6;
var ST_I16 = 7;
var ST_U24 = 8;
var ST_I24 = 9;
var ST_U32 = 10;
var ST_I32 = 11;
var ST_FL = 12;

var ST = {};
ST[ST_UNDEF] = 0;
ST[ST_BL] = 1;
ST[ST_U4] = 4;
ST[ST_I4] = 4;
ST[ST_U8] = 8;
ST[ST_I8] = 8;
ST[ST_U16] = 16;
ST[ST_I16] = 16;
ST[ST_U24] = 24;
ST[ST_I24] = 24;
ST[ST_U32] = 32;
ST[ST_I32] = 32;
ST[ST_FL] = 32;

var BR_HUFF_MAX_INDEX_TABLE = 14;
var NUMBER_OF_SERIES = 16;

var HUFF = [
    [
        { sz: 2, lbl: 0x000 },
        { sz: 2, lbl: 0x001 },
        { sz: 2, lbl: 0x003 },
        { sz: 3, lbl: 0x005 },
        { sz: 4, lbl: 0x009 },
        { sz: 5, lbl: 0x011 },
        { sz: 6, lbl: 0x021 },
        { sz: 7, lbl: 0x041 },
        { sz: 8, lbl: 0x081 },
        { sz: 10, lbl: 0x200 },
        { sz: 11, lbl: 0x402 },
        { sz: 11, lbl: 0x403 },
        { sz: 11, lbl: 0x404 },
        { sz: 11, lbl: 0x405 },
        { sz: 11, lbl: 0x406 },
        { sz: 11, lbl: 0x407 }
    ],
    [
        { sz: 7, lbl: 0x06f },
        { sz: 5, lbl: 0x01a },
        { sz: 4, lbl: 0x00c },
        { sz: 3, lbl: 0x003 },
        { sz: 3, lbl: 0x007 },
        { sz: 2, lbl: 0x002 },
        { sz: 2, lbl: 0x000 },
        { sz: 3, lbl: 0x002 },
        { sz: 6, lbl: 0x036 },
        { sz: 9, lbl: 0x1bb },
        { sz: 9, lbl: 0x1b9 },
        { sz: 10, lbl: 0x375 },
        { sz: 10, lbl: 0x374 },
        { sz: 10, lbl: 0x370 },
        { sz: 11, lbl: 0x6e3 },
        { sz: 11, lbl: 0x6e2 }
    ],
    [
        { sz: 4, lbl: 0x009 },
        { sz: 3, lbl: 0x005 },
        { sz: 2, lbl: 0x000 },
        { sz: 2, lbl: 0x001 },
        { sz: 2, lbl: 0x003 },
        { sz: 5, lbl: 0x011 },
        { sz: 6, lbl: 0x021 },
        { sz: 7, lbl: 0x041 },
        { sz: 8, lbl: 0x081 },
        { sz: 10, lbl: 0x200 },
        { sz: 11, lbl: 0x402 },
        { sz: 11, lbl: 0x403 },
        { sz: 11, lbl: 0x404 },
        { sz: 11, lbl: 0x405 },
        { sz: 11, lbl: 0x406 },
        { sz: 11, lbl: 0x407 }
    ]
];

// }}}

// {{{ Polyfills
Math.trunc =
    Math.trunc ||
    function(x) {
        if (isNaN(x)) {
            return NaN;
        }
        if (x > 0) {
            return Math.floor(x);
        }
        return Math.ceil(x);
    };
// }}}

/**
 * brUncompress main function
 */


function brUncompress(tagsz, argList, hexString, batch_absolute_timestamp) {

    var out = initResult();
    var buffer = createBuffer(parseHexString(hexString));
    var flag = generateFlag(buffer.getNextSample(ST_U8));

    out.batch_counter = buffer.getNextSample(ST_U8, 3);
    buffer.getNextSample(ST_U8, 1);

    var temp = prePopulateOutput(out, buffer, argList, flag, tagsz);
    var last_timestamp = temp.last_timestamp;
    var index_of_the_first_sample = temp.index_of_the_first_sample;

    if (flag.hasSample) {
        last_timestamp = uncompressSamplesData(
            out,
            buffer,
            index_of_the_first_sample,
            argList,
            last_timestamp,
            flag,
            tagsz
        );
    }

    out.batch_relative_timestamp = extractTimestampFromBuffer(
        buffer,
        last_timestamp
    );
    return adaptToExpectedFormat(out, argList, batch_absolute_timestamp);
}

/////////////// Sub functions ///////////////

/**
 * Init br_uncompress result data structure
 */
function initResult() {
    var series = [],
        i = 0;
    while (i < NUMBER_OF_SERIES) {
        series.push({
            codingType: 0,
            codingTable: 0,
            resolution: null,
            uncompressSamples: []
        });
        i += 1;
    }
    return {
        batch_counter: 0,
        batch_relative_timestamp: 0,
        series: series
    };
}

/**
 * Function to create a buffer from a byteArray. Allow to read sample from the
 * byteArray to extract data.
 */
function createBuffer(byteArray) {
    /**
     * Retrieve the pattern for HUFF table lookup
     */
    function bitsBuf2HuffPattern(byteArray, index, nb_bits) {
        var sourceBitStart = index;
        var sz = nb_bits - 1;
        if (byteArray.length * 8 < sourceBitStart + nb_bits) {
            //stock error only once
            /*
            if (myerror.indexOf("Batch : Verify that dest buf is large enough") === -1){
                myerror.push("Batch : Verify that dest buf is large enough");
            }
            return;*/
            throw new Error("Batch : Verify that dest buf is large enough");





        }
        var bittoread = 0;
        var pattern = 0;
        while (nb_bits > 0) {
            if (byteArray[sourceBitStart >> 3] & (1 << (sourceBitStart & 0x07))) {
                pattern |= 1 << (sz - bittoread);
            }
            nb_bits--;
            bittoread++;
            sourceBitStart++;
        }
        return pattern;
    }

    return {
        index: 0,
        byteArray: byteArray,
        getNextSample: function(sampleType, nbBitsInput) {
            var nbBits = nbBitsInput || ST[sampleType];
            var sourceBitStart = this.index;
            this.index += nbBits;
            if (sampleType === ST_FL && nbBits !== 32) {
                //stock error only once
                /*
                if (myerror.indexOf("Batch : Mauvais sampletype") === -1) {
                    myerror.push("Batch : Mauvais sampletype");
                }
                return;*/
                throw new Error("Batch : Mauvais sampletype");
            }

            var u32 = 0;
            var nbytes = Math.trunc((nbBits - 1) / 8) + 1;
            var nbitsfrombyte = nbBits % 8;
            if (nbitsfrombyte === 0 && nbytes > 0) {
                nbitsfrombyte = 8;
            }

            while (nbytes > 0) {
                var bittoread = 0;
                while (nbitsfrombyte > 0) {
                    var idx = sourceBitStart >> 3;
                    if (this.byteArray[idx] & (1 << (sourceBitStart & 0x07))) {
                        u32 |= 1 << ((nbytes - 1) * 8 + bittoread);
                    }
                    nbitsfrombyte--;
                    bittoread++;
                    sourceBitStart += 1;
                }
                nbytes--;
                nbitsfrombyte = 8;
            }
            // Propagate the sign bit if 1
            if (
                (sampleType == ST_I4 || sampleType == ST_I8 ||sampleType == ST_I16 ||sampleType == ST_I24) &&
                u32 & (1 << (nbBits - 1))
            ) {
                for (var i = nbBits; i < 32; i++) {
                    u32 |= 1 << i;
                    nbBits++;
                }
            }

            return u32;
        },

        /**
         * Extract sz and bi from Huff table
         */
        getNextBifromHi: function(huff_coding) {
            for (var i = 2; i < 12; i++) {
                var lhuff = bitsBuf2HuffPattern(this.byteArray, this.index, i);
                for (var j = 0; j < HUFF[huff_coding].length; j++) {
                    if (
                        HUFF[huff_coding][j].sz == i &&
                        lhuff == HUFF[huff_coding][j].lbl
                    ) {
                        this.index += i;
                        return j;
                    }
                }
            }
            //myerror.push("Bi not found in HUFF table");
            throw new Error("Bi not found in HUFF table");
        }
    }
}

/**
 * Convert the hex string given as parameter to a ByteArray
 */
function parseHexString(str) {
    if ( str === undefined || str === null ) {
        //stock error only once
        if (myerror.indexOf("Batch : Invalid hex string") === -1) {
            myerror.push("Batch : Invalid hex string");
        }
        return;
    }
    str = str
        .toString()
        .split("")
        .filter(function(x) {
            return !isNaN(parseInt(x, 16))
        })
        .join("")
    var result = []
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16))
        str = str.substring(2, str.length)
    }
    return result
}

/**
 * Generate a flag object from an integer value.
 */
function generateFlag(flagAsInt) {
    var binbase = flagAsInt.toString(2)

    // leftpad
    while (binbase.length < 8) {
        binbase = "0" + binbase
    }

    return {
        isCommonTimestamp: parseInt(binbase[binbase.length - 2], 2),
        hasSample: !parseInt(binbase[binbase.length - 3], 2),
        batch_req: parseInt(binbase[binbase.length - 4], 2),
        nb_of_type_measure: parseInt(binbase.substring(0, 4), 2)
    }
}

/**
 * Prepopulate output with relative timestamp and measure of the first sample
 * for each series.
 */
function prePopulateOutput(out, buffer, argList, flag, tagsz) {
    var currentTimestamp = 0
    var index_of_the_first_sample = 0
    for (var i = 0; i < flag.nb_of_type_measure; i++) {
        var tag = {
            size: tagsz,
            lbl: buffer.getNextSample(ST_U8, tagsz)
        }
        var sampleIndex = findIndexFromArgList(argList, tag)

        if (i === 0) {
            index_of_the_first_sample = sampleIndex
        }

        currentTimestamp = extractTimestampFromBuffer(buffer, currentTimestamp)
        out.series[sampleIndex] = computeSeries(
            buffer,
            argList[sampleIndex].sampletype,
            tag.lbl,
            currentTimestamp
        )
        if (flag.hasSample) {
            out.series[sampleIndex].codingType = buffer.getNextSample(ST_U8, 2)
            out.series[sampleIndex].codingTable = buffer.getNextSample(ST_U8, 2)
        }
    }
    return {
        last_timestamp: currentTimestamp,
        index_of_the_first_sample: index_of_the_first_sample
    }
}

/**
 * Initialize next series from buffer
 */
function computeSeries(buffer, sampletype, label, currentTimestamp) {
    return {
        uncompressSamples: [
            {
                data_relative_timestamp: currentTimestamp,
                data: {
                    value: getMeasure(buffer, sampletype),
                    label: label
                }
            }
        ],
        codingType: 0,
        codingTable: 0,
        resolution: null
    }
}

/**
 * Return the index of tag lbl in the argument list
 */
function findIndexFromArgList(argList, tag) {
    for (var i = 0; i < argList.length; i++) {
        if (argList[i].taglbl === tag.lbl) {
            return i
        }
    }
    //myerror.push("Batch : Cannot find index in argList");
    throw new Error("Batch : Cannot find index in argList");
}

/**
 * Extract a new time stamp using Huff table, optionnaly from a baseTimestamp
 */
function extractTimestampFromBuffer(buffer, baseTimestamp) {
    if (baseTimestamp) {
        var bi = buffer.getNextBifromHi(1)
        return computeTimestampFromBi(buffer, baseTimestamp, bi)
    }
    return buffer.getNextSample(ST_U32)
}

/**
 * Compute a new timestamp from a previous one, regarding bi value
 */
function computeTimestampFromBi(buffer, baseTimestamp, bi) {
    if (bi > BR_HUFF_MAX_INDEX_TABLE) {
        return buffer.getNextSample(ST_U32)
    }
    if (bi > 0) {
        return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi)
    }
    return baseTimestamp
}

/**
 * Compute a new timestamp from a previous one, regarding posotive bi value
 */
function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
    return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1
}

/**
 * Extract the measure from the buffer, handling float case
 */

function getMeasure(buffer, sampletype) {
    var v = buffer.getNextSample(sampletype)
    return sampletype === ST_FL ? bytes2Float32(v) : v
}

/**
 * Convert bytes to a float32 representation.
 */
function bytes2Float32(bytes) {
    var sign = bytes & 0x80000000 ? -1 : 1,
        exponent = ((bytes >> 23) & 0xff) - 127,
        significand = bytes & ~(-1 << 23)

    if (exponent == 128) {
        return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY)
    }

    if (exponent == -127) {
        if (significand === 0) {
            return sign * 0.0
        }
        exponent = -126
        significand /= 1 << 22
    } else {
        significand = (significand | (1 << 23)) / (1 << 23)
    }

    return sign * significand * Math.pow(2, exponent)
}

/**
 * Uncompress samples data presenting common timestamp or separate timestamp
 */
function uncompressSamplesData(
    out,
    buffer,
    index_of_the_first_sample,
    argList,
    last_timestamp,
    flag,
    tagsz
) {
    if (flag.isCommonTimestamp) {
        return handleCommonTimestamp(
            out,
            buffer,
            index_of_the_first_sample,
            argList,
            flag,
            tagsz
        )
    }
    return handleSeparateTimestamp(
        out,
        buffer,
        argList,
        last_timestamp,
        flag,
        tagsz
    )
}

/**
 * Uncompress data in case of common timestamp
 */
function handleCommonTimestamp(
    out,
    buffer,
    index_of_the_first_sample,
    argList,
    flag,
    tagsz
) {
    //number of sample
    var nb_sample_to_parse = buffer.getNextSample(ST_U8, 8)
    var tag = {}

    var temp = initTimestampCommonTable(
        out,
        buffer,
        nb_sample_to_parse,
        index_of_the_first_sample
    )
    var timestampCommon = temp.timestampCommon
    var lastTimestamp = temp.lastTimestamp

    for (var j = 0; j < flag.nb_of_type_measure; j++) {
        var first_null_delta_value = 1
        tag.lbl = buffer.getNextSample(ST_U8, tagsz)
        var sampleIndex = findIndexFromArgList(argList, tag)
        for (var i = 0; i < nb_sample_to_parse; i++) {
            //Available bit
            var available = buffer.getNextSample(ST_U8, 1)
            if (available) {
                //Delta value
                var bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable)
                var currentMeasure = {
                    data_relative_timestamp: 0,
                    data: {}
                }
                if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
                    var precedingValue =
                        out.series[sampleIndex].uncompressSamples[
                        out.series[sampleIndex].uncompressSamples.length - 1
                            ].data.value
                    if (bi > 0) {
                        currentMeasure.data.value = completeCurrentMeasure(
                            buffer,
                            precedingValue,
                            out.series[sampleIndex].codingType,
                            argList[sampleIndex].resol,
                            bi
                        )
                    } else {
                        // (bi <= 0)
                        if (first_null_delta_value) {
                            // First value is yet recorded starting from the header
                            first_null_delta_value = 0
                            continue
                        } else {
                            currentMeasure.data.value = precedingValue
                        }
                    }
                } else {
                    // bi > BR_HUFF_MAX_INDEX_TABLE
                    currentMeasure.data.value = buffer.getNextSample(
                        argList[sampleIndex].sampletype
                    )
                }
                currentMeasure.data_relative_timestamp = timestampCommon[i]
                out.series[sampleIndex].uncompressSamples.push(currentMeasure)
            }
        }
    }
    return lastTimestamp
}

/**
 * Initialize common timestamp table. Returns the table and last calculated timestamp
 */
function initTimestampCommonTable(
    out,
    buffer,
    nbSampleToParse,
    firstSampleIndex
) {
    var timestampCommon = []
    var lastTimestamp = 0
    var timestampCoding = buffer.getNextSample(ST_U8, 2)
    for (var i = 0; i < nbSampleToParse; i++) {
        //delta timestamp
        var bi = buffer.getNextBifromHi(timestampCoding)
        if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
            if (i === 0) {
                timestampCommon.push(
                    out.series[firstSampleIndex].uncompressSamples[0]
                        .data_relative_timestamp
                )
            } else {
                if (bi > 0) {
                    var precedingTimestamp = timestampCommon[i - 1]
                    timestampCommon.push(
                        buffer.getNextSample(ST_U32, bi) +
                        precedingTimestamp +
                        Math.pow(2, bi) -
                        1
                    )
                } else {
                    timestampCommon.push(precedingTimestamp)
                }
            }
        } else {
            timestampCommon.push(buffer.getNextSample(ST_U32))
        }
        lastTimestamp = timestampCommon[i]
    }
    return {
        timestampCommon: timestampCommon,
        lastTimestamp: lastTimestamp
    }
}

/**
 * Complete current measure from the preceding one
 */
function completeCurrentMeasure(buffer, precedingValue, codingType, resol, bi) {
    var currentValue = buffer.getNextSample(ST_U16, bi)
    if (codingType === 0) {
        // ADLC
        return computeAdlcValue(currentValue, resol, precedingValue, bi)
    }
    if (codingType === 1) {
        // Positive
        return (currentValue + Math.pow(2, bi) - 1) * resol + precedingValue
    }
    // Negative
    return precedingValue - (currentValue + (Math.pow(2, bi) - 1)) * resol
}

/**
 * Return current value in ADLC case
 */
function computeAdlcValue(currentValue, resol, precedingValue, bi) {
    if (currentValue >= Math.pow(2, bi - 1)) {
        return currentValue * resol + precedingValue
    }
    return (currentValue + 1 - Math.pow(2, bi)) * resol + precedingValue
}

/**
 * Uncompress data in case of separate timestamp
 */
function handleSeparateTimestamp(
    out,
    buffer,
    argList,
    last_timestamp,
    flag,
    tagsz
) {
    var tag = {}
    for (var i = 0; i < flag.nb_of_type_measure; i++) {
        tag.lbl = buffer.getNextSample(ST_U8, tagsz)
        var sampleIndex = findIndexFromArgList(argList, tag)
        var compressSampleNb = buffer.getNextSample(ST_U8, 8)
        if (compressSampleNb) {
            var timestampCoding = buffer.getNextSample(ST_U8, 2)
            for (var j = 0; j < compressSampleNb; j++) {
                var precedingRelativeTimestamp =
                    out.series[sampleIndex].uncompressSamples[
                    out.series[sampleIndex].uncompressSamples.length - 1
                        ].data_relative_timestamp
                var currentMeasure = {
                    data_relative_timestamp: 0,
                    data: {}
                }
                var bi = buffer.getNextBifromHi(timestampCoding)
                currentMeasure.data_relative_timestamp = computeTimestampFromBi(
                    buffer,
                    precedingRelativeTimestamp,
                    bi
                )
                if (currentMeasure.data_relative_timestamp > last_timestamp) {
                    last_timestamp = currentMeasure.data_relative_timestamp
                }
                bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable)
                if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
                    var precedingValue =
                        out.series[sampleIndex].uncompressSamples[
                        out.series[sampleIndex].uncompressSamples.length - 1
                            ].data.value
                    if (bi > 0) {
                        currentMeasure.data.value = completeCurrentMeasure(
                            buffer,
                            precedingValue,
                            out.series[sampleIndex].codingType,
                            argList[sampleIndex].resol,
                            bi
                        )
                    } else {
                        // bi <= 0
                        currentMeasure.data.value = precedingValue
                    }
                } else {
                    // bi > BR_HUFF_MAX_INDEX_TABLE
                    currentMeasure.data.value = buffer.getNextSample(
                        argList[sampleIndex].sampletype
                    )
                }
                out.series[sampleIndex].uncompressSamples.push(currentMeasure)
            }
        }
    }
    return last_timestamp
}

/**
 * Translate brUncompress output data to expected structure
 */
function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
    var returnedGlobalObject = {
        batch_counter: out.batch_counter,
        batch_relative_timestamp: out.batch_relative_timestamp
    }
    if (batchAbsoluteTimestamp) {
        returnedGlobalObject.batch_absolute_timestamp = batchAbsoluteTimestamp
    }
    returnedGlobalObject.dataset = out.series.reduce(function(
            acc,
            current,
            index
        ) {
            return acc.concat(
                current.uncompressSamples.map(function(item) {
                    var returned = {
                        data_relative_timestamp: item.data_relative_timestamp,
                        data: {
                            value: argList[index].divide
                                ? item.data.value / argList[index].divide
                                : item.data.value,
                            label: argList[index].taglbl
                        }
                    }
                    if (argList[index].lblname) {
                        returned.data.label_name = argList[index].lblname
                    }
                    if (batchAbsoluteTimestamp) {
                        returned.data_absolute_timestamp = computeDataAbsoluteTimestamp(
                            batchAbsoluteTimestamp,
                            out.batch_relative_timestamp,
                            item.data_relative_timestamp
                        )
                    }
                    return returned
                })
            )
        },
        [])
    return returnedGlobalObject
}

/**
 * Compute data absolute timestamp from batch absolute timestamp (bat), batch
 * relative timestamp (brt) and data relative timestamp (drt)
 */
function computeDataAbsoluteTimestamp(bat, brt, drt) {
    return new Date(new Date(bat) - (brt - drt) * 1000).toISOString()
}

try {
    module.exports = brUncompress
} catch (e) {
    // when called from nashorn,  module.exports is unavailableâ€¦
    exports.err_msg = e
}


// vim: fdm=marker

/*
var time = new Date().toLocaleString(); //current time in right time format

var data = brUncompress(
        3,  // <<==  the Batch Tag size
        // From here the batch fileds parameter list
        [
            {
                taglbl: 1,
                resol: 10,
                sampletype: 7,
                divide: 100,
                lblname: "Temperature"
            },
            {
                taglbl: 2,
                resol: 100,
                sampletype: 6,
                divide: 100,
                lblname: "Humidity"
            },
            {
                taglbl: 3,
                resol: 10,
                sampletype: 6,
                lblname: "CO2"
            },
            {
                taglbl: 4,
                resol: 10,
                sampletype: 6,
                lblname: "COV"
            },
            {
                taglbl: 5,
                resol: 10,
                sampletype: 6,
                lblname: "Lux"
            }
        ],

    "42338080a84f011da0e800dc91fd815368f742060e51682ffa6626fad692167d6b498bbe9844b14551141571689e20149b19", // This is the batch frame
        time // Variable fÃ¼r aktuelle Zeit
    //TODO trouver quoi mettre pour que ca plante pas
    )
;
msg = {payload:data};
console.log(msg)
console.log(msg.payload.dataset)*/

function normalisation(input){
    let date = input.date;
    let decoded = brUncompress(input.batch1, input.batch2, input.payload, date)
    console.log(decoded)
    let dataListe = []
    for (let i = 0; i < decoded.dataset.length; i++) {
        let data = decoded.dataset[i]
        let dataObject = {
            "variable": data.data.label_name,
            "value": data.data.value,
            "date": data.data_absolute_timestamp
        }
        dataListe.push(dataObject)
    }

    return dataListe


}

module.exports = {
    brUncompress,
    normalisation

};









