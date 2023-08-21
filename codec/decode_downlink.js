let example = "1106040280000029803c803c500000000001"
let commande = {
    0x00: "read attribute",
    0x06: "configure reporting",
    0x08: "read reporting configuration",
}

let status={
    0x00 : "success",
    0x80 : "malformed command",
    0x81 : "unsupported cluster command",
    0x82 : "unsupported general command",
    0x86 : "unsupported attribute",
    0x87 : "invalid field",
    0x88 : "invalid value",
    0x89 : "insufficient space",
    0x8C : "unreportable attribute",
    0x8D : "bad report",
    0x8E : "frame to short",
    0x8F : "frame to long",
    0x90 : "unsupported type",
    0x91 : "bad mode",
    0x92 : "unsupported slot",
    0x93 : "bad event",
    0x94 : "no available action",
    0x95 : "unsupported occurence",
    0xC2 : "batch report : no free slot",
    0xC3 : "batch report : invalid tag size",
    0xC4 : "batch report : duplicate tag label",
    0xC5 : "batch report : label out of range",
}
let cluster_attribute={
    0x0000:{
        name:"basic",
        0x0002:"firmaware version",
        0x0003:"kernel version",
        0x0004:"manufacturer",
        0x0005:"model identifier",
        0x0006:"date code",
        0x0010:"location description",
        0x8001:"application name"
    },
    0x0050:{
        name:"configuration",
        0X0004:"descriptor",
        0x0006:"node power descriptor"
    },
    0x000F:{
        name:"binary input",
        0x0055:"present value",
        0x0402:"count",
        0X0054:"polarity",
        0x0400:"edge selection",
        0x0401:"debounce periode",
        0x0100:"application type",
    },
    0x0006:{
        name:"on/off",
        0x0000:"on/off",
    },
    0x000C:{
        name:"analog input",
        0x0055:"present value",
        0x0100:"application type",
    },
    0x8004:{
        name:"lorawan",
        0x0000:"message type",
        0x0001:"retry confirmed",
        0x0002:"re-association",
        0x0003:"data rate",
        0x0004:"abp devAdress",
        0x0005:"ota appEUI",
    },
    0x0402:{
        name:"temperature measurement",
        0x0000:"measured value",
        0x0001:"min measured value",
        0x0002:"max measured value",
    },
    0x0403:{
        name:"pressure measurement",
        0x0000:"measured value",
        0x0001:"min measured value",
        0x0002:"max measured value",
    },
    0x0405:{
        name:"humidity measurement",
        0x0000:"measured value",
        0x0001:"min measured value",
        0x0002:"max measured value",
    },
    0x800C:{
        name:"concentration measurement",
        0x0000:"measured value",
        0x0001:"min measured value",
        0x0002:"max measured value",
        0x8004:"Unit",
        0x8008:"ABC Min normal level",
        0x8009:"ABC period",
        0x800A:"ABC Activated",
        0x8010:"Classification Levels",
        0x8020:"IAQLeds period (s)",
        0x8031:"BZR period (s)",
        0x8032:"BZR pause (mn)",
        0x8033:"BZR Level High",
        0x8034:"BZR Level low",
        0x8000:"last calibration status"
    },
    0x8005:{
        name:"multi binary input",
        0x0000:"present value",
    },
    0x0052:{
        name:"simple mettering like",
        0x0000:"current metering",
        0x8000:"current calibration",
    },
    0x8052:{
        name:"power quality",
        0x0000:"current",
        0x0001:"Sag cycle Threshold",
        0x0002:"Sag voltage Threshold",
        0x0003:"Over voltage Threshold",
    },
    0x8002:{
        name:"volume meter",
        0x0000:"volume",
        0x0001:"VolumeDisplayMode",
        0x0002:"MinFlow",
        0x0003:"MaxFlow",
        0x0004:"FlowDisplayMode",
    },
    0x8003:{
        name:"senso",
        0x0000:"Status",
        0x0001:"CountDownThresholds",
        0x0002:"InstallationRotation",
        0x0003:"VolumeRotation",
        0x0004:"TemperatureMeterFreeze",
        0x0005:"TemperatureMinTxoff",
        0x0006:"ParametersLeakFlow",
    },
    0x0013:{
        name:"multistate output",
        0x0055:"present value",
        0x004A:"number of state",
        0x0100:"application type",
    },
    0x0406:{
        name:"occupency",
        0x0000:"occupency value",
        0X0010:"Occupied to Unoccupied delay",
        0x0001:"Occupancy Type"
    }

}

let attribute_types={
    0x10:{
        name:"boolean",
        size:1
    },
    0x08:{
        name:"general8",
        size:1
    },
    0x09:{
        name:"general16",
        size:2
    },
    0x0A:{
        name:"general24",
        size:3
    },
    0x0B:{
        name:"general32",
        size:4
    },
    0x18:{
        name:"bitmap8",
        size:1
    },
    0x19:{
        name:"bitmap16",
        size:2
    },
    0x20:{
        name:"uint8",
        size:1
    },
    0x21:{
        name:"uint16",
        size:2
    },
    0x22:{
        name:"uint24",
        size:3
    },
    0x23:{
        name:"uint32",
        size:4
    },
    0x28:{
        name:"int8",
        size:1
    },
    0x29:{
        name:"int16",
        size:2
    },
    0x2B:{
        name:"int32",
        size:4
    },
    0x30:{
        name:"enum8",
        size:1
    },
    0x42:{
        name:"char string",
        size:1
    },
    0x041:{
        name:"bytes string",
        size:1
    },
    0x43:{
        name:"long bytes string",
        size:2
    },
    0x4C:{
        name:"structured ordered sequence",
        size:2
    },
    0x39:{
        name:"single",
        size:4
    }

}


function decodeDownlink(input){
    let bytes = input.bytes;
    console.log(bytes)
    let decoded = {};
    console.log(commande)
    console.log(cluster_attribute)
    let cmdID = -1
    let clustID=-1
    let attID=-1
    let name = "name"
    cmdID =  bytes[1];
    clustID = bytes[2]*256 + bytes[3];

    decoded.type = commande[cmdID]
    decoded.cluster = cluster_attribute[clustID][name]

    if (cmdID === 0x06){
        attID = bytes[5]*256 + bytes[6];
        let reserved = bytes[4]
        if (reserved === 0x00){
            let attribute_type = bytes[7]
            let min_reporting_interval = bytes[8]*256 + bytes[9]
            let max_reporting_interval = bytes[10]*256 + bytes[11]

        }

    }
    decoded.attribute = cluster_attribute[clustID][attID]
    return decoded;

}

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

let objet={
    bytes: [0, 6, 4, 2, 0, 1, 0, 0, 0, 0, 0]
}

let a = decodeDownlink(objet)
console.log(a)