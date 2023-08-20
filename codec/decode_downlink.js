let commande = {
    0x06: "yis",
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
    attID = bytes[4]*256 + bytes[5];
    decoded.type = commande[cmdID]
    decoded.cluster = cluster_attribute[clustID][name]
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
    bytes: [0, 6, 4, 6, 0, 1, 0, 0, 0, 0, 0]
}

let a = decodeDownlink(objet)
console.log(a)