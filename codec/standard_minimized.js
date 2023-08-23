function UintToInt(Uint, Size) {
    if ((Size === 2) && ((Uint & 0x8000) > 0)) Uint -= 0x10000;
    if ((Size === 3) && ((Uint & 0x800000) > 0)) Uint -= 0x1000000;
    if ((Size === 4) && ((Uint & 0x80000000) > 0)) Uint -= 0x100000000;
    return Uint;
}
function Bytes2Float32(bytes) {
    let sign = (bytes & 0x80000000) ? -1 : 1;
    let exp = ((bytes >> 23) & 0xFF) - 127;
    let signi = (bytes & ~(-1 << 23));
    if (exp === 128) return sign * ((signi) ? Number.NaN : Number.POSITIVE_INFINITY);
    if (exp === -127) {
        if (signi === 0) return 0;
        exp = -126;
        signi /= (1 << 23);
    } else signi = (signi | (1 << 23)) / (1 << 23);
    return sign * signi * Math.pow(2, exp);
}
function BytesToInt64(InBytes, Starti1, Type, LiEnd)
{
    if(typeof(LiEnd) == 'undefined') LiEnd = false;
    let Signed  = (Type.substr(0,1) != "U");
    let BytesNb = parseInt(Type.substr(1,2), 10)/8;
    let inc, start;
    let nb = BytesNb;
    if (LiEnd)
    {
        inc = -1;
        start = Starti1 + BytesNb - 1;
    }
    else inc =  1; start = Starti1 ;
    tmpInt64 = 0;
    for (j=start; nb > 0;(j+=inc,nb--))
    {
        tmpInt64 = (tmpInt64 << 8) + InBytes[j];
    }
    if ((Signed) && (BytesNb < 8) && (InBytes[start] & 0x80))
        tmpInt64 = tmpInt64 - (0x01 << (BytesNb * 8));
    return tmpInt64;
}
function decimalToHex(d, pad) {
    let hex = d.toString(16).toUpperCase();
    pad = typeof (pad) === "undefined" || pad === null ? pad = 2 : pad;
    while (hex.length < pad) {
        hex = "0" + hex;
    }
    return "0x" + hex;
}
function parseHexString(str) {
    let result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}
function zeroPad(num, places) {
    return( String(num).padStart(places, '0') );
}
function decimalToBitString(dec){
    var bitString = "";
    var bin = dec.toString(2);
    bitString += zeroPad(bin, 8);
    return bitString;
}
function int(value){
    return parseInt(value, 2)
}
function alarmShort(length, listMess, flag, bytes, decoded, i1){
    let i = 0
    while(flag === 0) {
        let bi = bytes[(i1 + 3 +(length*i))]
        if (bi === undefined){
            console.log(listMess)
            decoded.zclheader.alarmmess = listMess
            flag = 1
            break
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let mode = "threshold"
            let qual = ""
            if (csd[1] === "1") {
                qual = "exceed"
            } else {
                qual = "fall"
            }

            let mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual
            listMess.push(mess)
        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            let mess = "alarm, delta "+index+" triggered"
            listMess.push(mess)
        }
        i+=1

    }
}
function alarmLong(length, listMess, flag, bytes, decoded, i1,divider){
    let i = 0
    let check = 0
    let baseLength = length
    let countUp=0
    let countDown=0
    while(flag===0) {
        let bi = bytes[(i1 + 3 +(length*i))]
        if (bi === undefined){
            console.log(listMess)
            decoded.zclheader.alarmmess = listMess
            flag = 1
            break
        }
        if(length!== baseLength){
            length=baseLength
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let countCheck = decimalToBitString(bytes[i1 + 6 + (length*i)])
            if(countCheck[0] === "1"){
                check = 1
                length+=2
            }
            let mode = "threshold"
            let qual = ""
            if (csd[1] === "1") {
                qual = "exceed"
                countUp= decimalToBitString(bytes[i1 + 7 + (length*i)]) + decimalToBitString(bytes[i1 + 8 + (length*i)])
                countUp = parseInt(countUp, 2)
                if(check===1){
                    countDown= decimalToBitString(bytes[i1 + 9 + (length*i)]) + decimalToBitString(bytes[i1 + 10 + (length*i)])
                    countDown = parseInt(countDown, 2)
                }
            } else {
                qual = "fall"
                if(check===1){
                    countUp= decimalToBitString(bytes[i1 + 7 + (length*i)]) + decimalToBitString(bytes[i1 + 8 + (length*i)])
                    countUp = parseInt(countUp, 2)
                    countDown= decimalToBitString(bytes[i1 + 9 + (length*i)]) + decimalToBitString(bytes[i1 + 10 + (length*i)])
                    countDown = parseInt(countDown, 2)
                }else {
                    countDown = decimalToBitString(bytes[i1 + 7 + (length * i)]) + decimalToBitString(bytes[i1 + 8 + (length * i)])
                    countDown = parseInt(countDown, 2)
                }

            }
            let temp = ((bytes[i1 + 4 + (length*i)] * 256 + bytes[i1 + 5 + (length*i)]) / divider).toString()


            let mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", occurences_up: " + countUp + ", occurences_down: " + countDown
            listMess.push(mess)
            if (check ===1){
                length-=2
                check = 0
            }

        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            length-=3
            let temp = ((bytes[i1 + 4 + (length*i)] * 256 + bytes[i1 + 5 + (length*i)]) / divider).toString()
            let mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp
            listMess.push(mess)

        }
        i+=1
    }

}
function Decoder(bytes, port) {
    let decoded = {};
    decoded.lora = {};
    decoded.lora.port  = port;
    let bytes_len_	= bytes.length;
    let temp_hex_str = ""
    decoded.lora.payload  = "";
    for( let j = 0; j < bytes_len_; j++ )
    {
        temp_hex_str = bytes[j].toString( 16 ).toUpperCase();
        if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
        decoded.lora.payload += temp_hex_str;
        let date = new Date();
        decoded.lora.date = date.toISOString();
    }
    if (port === 125)
    {
       let batch = !(bytes[0] & 0x01);
        if (batch === false){
            decoded.zclheader = {};
            decoded.zclheader.report =  "standard";
            let attID = -1;
            let cmdID = -1;
            let clustID = -1;
            decoded.zclheader.endpoint = ((bytes[0]&0xE0)>>5) | ((bytes[0]&0x06)<<2);
            cmdID =  bytes[1]; decoded.zclheader.cmdID = decimalToHex(cmdID,2);
            clustID = bytes[2]*256 + bytes[3]; decoded.zclheader.clustID = decimalToHex(clustID,4);
            console.log(clustID)
            if((cmdID === 0x0a)|(cmdID === 0x8a)|(cmdID === 0x01)){
                decoded.data = {};
                attID = bytes[4]*256 + bytes[5];decoded.zclheader.attID = decimalToHex(attID,4);
                let firsthalfattID = bytes[4]
                console.log(firsthalfattID)
                let i1 = 0
                if ((cmdID === 0x0a) || (cmdID === 0x8a)) i1 = 7;
                if (cmdID === 0x8a) decoded.zclheader.alarm = 1;
                if (cmdID === 0x01)	{i1 = 8; decoded.zclheader.status = bytes[6];}

                if ((clustID === 0x0000 ) && (attID === 0x0002)){
                    decoded.data.firmware=""
                    for (let i = 0; i < 6; i++) {
                        decoded.data.firmware += String(bytes[i1 + i]);
                        if (i !== 5) decoded.data.firmware += ".";
                    }

                }
                if ((clustID === 0x0000 ) && (attID === 0x0003)){
                    let length = bytes[i1];
                    decoded.data.kernel=""
                    console.log(decoded.data.kernel)
                    for (let i = 0; i < length; i++) {
                        decoded.data.kernel += String.fromCharCode(bytes[i1 + 1 + i]);

                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0004)){
                    let length = bytes[i1];
                    decoded.data.manufacturer=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.manufacturer += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0005)){
                    let length = bytes[i1];
                    decoded.data.model=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.model += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0006)){
                    let length = bytes[i1];
                    decoded.data.date=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.date += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0010)){
                    let length = bytes[i1];
                    decoded.data.position=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.position += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x8001)){
                    let length = bytes[i1];
                    decoded.data.application=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.application += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }

                if ((clustID === 0x0402 ) && (attID === 0x0000)) {
                    decoded.data.temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                    //getions des alarmes
                    if (cmdID === 0x8a){
                        let rc=""
                        let listMess=[]
                        let flag = 0
                        let divider = 100
                        if(bytes[i1+2] === undefined) {
                            rc = "none"
                            console.log("je suis dans le test undefined")

                        }else{
                            rc = decimalToBitString(bytes[i1 + 2])
                            console.log("je suis dans le test defined")
                        }
                        if (rc === "none"){
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmess = listMess
                        };
                        if ((rc[2] === "0") && (rc[3] === "1")){
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, i1)

                        }
                        if ((rc[2]==="1") &&(rc[3]==="0")){
                            let length = 6
                            alarmLong(length, listMess, flag, bytes, decoded, i1, divider)
                        }
                    }
                }
                if ((clustID === 0x0402 ) && (attID === 0x0001)) {
                    decoded.data.min_temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                }
                if ((clustID === 0x0402 ) && (attID === 0x0002)) {
                    decoded.data.max_temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                }
                if ((clustID === 0x0405 ) && (attID === 0x0000)){
                    decoded.data.humidity = (bytes[i1]*256+bytes[i1+1])/100;
                    if (cmdID===0x8a) {
                        if (bytes[i1 + 2] !== undefined) {
                            let rc = decimalToBitString(bytes[i1 + 2])
                        }
                        let listMess = []
                        let flag = 0
                        let divider = 100
                        let rc = ""
                        if (bytes[i1 + 2] === undefined) {
                            rc = "none"
                            console.log("je suis dans le test undefined")

                        } else {
                            rc = decimalToBitString(bytes[i1 + 2])
                            console.log("je suis dans le test defined")
                        }
                        if (rc === "none") {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmess = listMess
                        }
                        ;
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, i1)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(length, listMess, flag, bytes, decoded, i1, divider)
                        }
                    }
                }
                if ((clustID === 0x0405 ) && (attID === 0x0001)) decoded.data.min_humidity = (bytes[i1]*256+bytes[i1+1])/100;
                if ((clustID === 0x0405 ) && (attID === 0x0002)) decoded.data.max_humidity = (bytes[i1]*256+bytes[i1+1])/100;
                if ((clustID === 0x000f ) && (attID === 0x0402)) decoded.data.counter = (bytes[i1]*256*256*256+bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3]);
                if ((clustID === 0x000f ) && (attID === 0x0055)) decoded.data.pin_state = !(!bytes[i1]);
                if ((clustID === 0x000f ) && (attID === 0x0054)){
                    if (bytes[i1] === 0) decoded.data.polarity = "normal";
                    if (bytes[i1] === 1) decoded.data.polarity = "reverse";
                }
                if ((clustID === 0x000f ) && (attID === 0x0400)){
                    if (bytes[i1] === 0) decoded.data.edgeselection = "none";
                    if (bytes[i1] === 1) decoded.data.edgeselection = "falling edge";
                    if (bytes[i1] === 2) decoded.data.edgeselection = "rising edge";
                    if (bytes[i1] === 3) decoded.data.edgeselection = "both edges";
                    if (bytes[i1] === 5) decoded.data.edgeselection = "polling and falling edge";
                    if (bytes[i1] === 6) decoded.data.edgeselection = "polling and rising edge";
                    if (bytes[i1] === 7) decoded.data.edgeselection = "polling and both edges";
                }
                if ((clustID === 0x000f ) && (attID === 0x0401)) decoded.data.debounceperiod = bytes[i1]
                if ((clustID === 0x000f ) && (attID === 0x0403)) decoded.data.pollperiod = bytes[i1]
                if ((clustID === 0x000f ) && (attID === 0x0404)) decoded.data.forcenotify = bytes[i1]
                if ((clustID === 0x0013 ) && (attID === 0x0055)) decoded.data.value = bytes[i1];
                if ((clustID === 0x0006 ) && (attID === 0x0000)) {let state = bytes[i1]; if(state === 1) decoded.data.state = "ON"; else decoded.data.state = "OFF" ; }
                if ((clustID === 0x8008 ) && (attID === 0x0000)) decoded.data.differential_pressure =bytes[i1]*256+bytes[i1+1];
                if ((clustID === 0x8005 ) && (attID === 0x0000))
                {
                    decoded.data.pin_state_1 = ((bytes[i1+1]&0x01) === 0x01);
                    decoded.data.pin_state_2 = ((bytes[i1+1]&0x02) === 0x02);
                    decoded.data.pin_state_3 = ((bytes[i1+1]&0x04) === 0x04);
                    decoded.data.pin_state_4 = ((bytes[i1+1]&0x08) === 0x08);
                    decoded.data.pin_state_5 = ((bytes[i1+1]&0x10) === 0x10);
                    decoded.data.pin_state_6 = ((bytes[i1+1]&0x20) === 0x20);
                    decoded.data.pin_state_7 = ((bytes[i1+1]&0x40) === 0x40);
                    decoded.data.pin_state_8 = ((bytes[i1+1]&0x80) === 0x80);
                    decoded.data.pin_state_9 = ((bytes[i1]&0x01) === 0x01);
                    decoded.data.pin_state_10 = ((bytes[i1]&0x02) === 0x02);
                }
                if ((clustID === 0x000c ) && (attID === 0x0055)){
                    decoded.data.analog = Bytes2Float32(bytes[i1]*256*256*256+bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3]);
                    if (cmdID===0x8a) {
                        if (bytes[i1 + 2] !== undefined) {
                            let rc = decimalToBitString(bytes[i1 + 2])
                        }
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        if (bytes[i1 + 2] === undefined) {
                            rc = "none"
                            console.log("je suis dans le test undefined")

                        } else {
                            rc = decimalToBitString(bytes[i1 + 2])
                            console.log("je suis dans le test defined")
                        }
                        if (rc === "none") {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmess = listMess
                        }
                        ;
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, i1)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 8
                            alarmLong(length, listMess, flag, bytes, decoded, i1, divider)
                        }
                    }
                }
                if ((clustID === 0x000c ) && (attID === 0x0100)){
                    if (bytes[i1+1] === 0x05) decoded.data.type = "ppm";
                    if ((bytes[i1+1] === 0xFF)&&(bytes[i1+3]===0x00)) decoded.data.type = "mA";
                    if ((bytes[i1+1] === 0xFF)&&(bytes[i1+3]===0x01)) decoded.data.type = "mV";
                }
                if ((clustID===0x000C)&&(attID===0x8003)) decoded.data.powerduration = bytes[i1]*256+bytes[i1+1];
                if ((clustID===0x000C)&&(attID===0x8004)){
                    let chockparammetters = {}
                    //byte to bite string
                    let part1 = decimalToBitString(bytes[i1])
                    let part2 = decimalToBitString(bytes[i1+1])
                    let mode = part1[0]*2+part1[1]
                    if (mode === 0) chockparammetters.mode = "idle"
                    if (mode === 1) chockparammetters.mode = "chock"
                    if (mode === 2) chockparammetters.mode = "click"
                    let frequency = part1[2]*8+part1[3]*4+part1[4]*2+part1[5]
                    if (frequency === 0) chockparammetters.frequency = "idle"
                    if (frequency === 1) chockparammetters.frequency = "1Hz"
                    if (frequency === 2) chockparammetters.frequency = "10Hz"
                    if (frequency === 3) chockparammetters.frequency = "25Hz"
                    if (frequency === 4) chockparammetters.frequency = "50Hz"
                    if (frequency === 5) chockparammetters.frequency = "100Hz"
                    if (frequency === 6) chockparammetters.frequency = "200Hz"
                    if (frequency === 7) chockparammetters.frequency = "400Hz"
                    if (frequency === 8) chockparammetters.frequency = "1620Hz"
                    if (frequency === 9) chockparammetters.frequency = "5376Hz"
                    chockparammetters.range={}
                    let range = part1[6]*2+part1[7]
                    if (range === 0) {chockparammetters.range.precision = "+/- 2g"; chockparammetters.range.value = 16}
                    if (range === 1) {chockparammetters.range.precision = "+/- 4g"; chockparammetters.range.value = 32}
                    if (range === 2) {chockparammetters.range.precision = "+/- 8g"; chockparammetters.range.value = 64}
                    if (range === 3) {chockparammetters.range.precision = "+/- 16g"; chockparammetters.range.value = 128}
                    let multiplicator = part2[0]*128+part2[1]*64+part2[2]*32+part2[3]*16+part2[4]*8+part2[5]*4+part2[6]*2+part2[7]
                    chockparammetters.threshold = multiplicator*chockparammetters.range.value
                }
                if ((clustID === 0x8007 ) && (attID === 0x0001))
                {
                    decoded.data.payload = "";
                    decoded.data.modbus_payload = "";
                    decoded.data.size = bytes[i1];
                    decoded.data.modbus_float = 0;
                    for( let j = 0; j < decoded.data.size; j++ )
                    {
                        temp_hex_str   = bytes[i1+j+1].toString( 16 ).toUpperCase();
                        if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                        decoded.data.payload += temp_hex_str;
                        if (j === 0) decoded.data.modbus_address = bytes[i1+j+1];
                        else if (j === 1) decoded.data.modbus_commandID = bytes[i1+j+1];
                        else if (j === 2) decoded.data.modbus_size = bytes[i1+j+1];
                        else{
                            decoded.data.modbus_payload += temp_hex_str;
                            if (decoded.data.modbus_float === 1){ // big endian
                                let a = Bytes2Float32(bytes[i1+j+1]*256*256*256+bytes[i1+j+1+1]*256*256+bytes[i1+j+1+2]*256+bytes[i1+j+1+3])
                                if (j === 3)		decoded.data.fregister_00 = a;
                                if (j === 7)		decoded.data.fregister_01 = a;
                                if (j === 11)	decoded.data.fregister_02 = a;
                                if (j === 15)	decoded.data.fregister_03 = a;
                                if (j === 19)	decoded.data.fregister_04 = a;
                                if (j === 23)	decoded.data.fregister_05 = a;
                                if (j === 27)	decoded.data.fregister_06 = a;
                                if (j === 31)	decoded.data.fregister_07 = a;
                                if (j === 35)	decoded.data.fregister_08 = a;
                                if (j === 35)	decoded.data.fregister_09 = a;
                            }
                            if (decoded.data.modbus_float === 2){
                                let a =Bytes2Float32(bytes[i1+j+1]*256+bytes[i1+j+1+1]+bytes[i1+j+1+2]*256*256*256+bytes[i1+j+1+3]*256*256)
                                if (j === 3)		decoded.data.fregister_00 = a;
                                if (j === 7)		decoded.data.fregister_01 = a;
                                if (j === 11)	decoded.data.fregister_02 = a;
                                if (j === 15)	decoded.data.fregister_03 = a;
                                if (j === 19)	decoded.data.fregister_04 = a;
                                if (j === 23)	decoded.data.fregister_05 = a;
                                if (j === 27)	decoded.data.fregister_06 = a;
                                if (j === 31)	decoded.data.fregister_07 = a;
                                if (j === 35)	decoded.data.fregister_08 = a;
                                if (j === 35)	decoded.data.fregister_09 = a;
                            }
                        }
                    }
                }
                if ((clustID === 0x8009 ) && (attID === 0x0000))
                {
                    let b2 = bytes[i1+2]
                    let b3 = bytes[i1+3]
                    decoded.data.payloads = "";
                    decoded.data.size = bytes[i1];
                    decoded.data.multimodbus_frame_series_sent = bytes[i1+1];
                    decoded.data.multimodbus_frame_number_in_serie = (b2 & 0xE0) >> 5;
                    decoded.data.multimodbus_last_frame_of_serie = (b2 & 0x1C ) >> 2;
                    decoded.data.multimodbus_EP9 = ((b2&0x01) === 0x01);
                    decoded.data.multimodbus_EP8 = ((b2&0x02) === 0x02);
                    decoded.data.multimodbus_EP7 = ((b3&0x80) === 0x80);
                    decoded.data.multimodbus_EP6 = ((b3&0x40) === 0x40);
                    decoded.data.multimodbus_EP5 = ((b3&0x20) === 0x20);
                    decoded.data.multimodbus_EP4 = ((b3&0x10) === 0x10);
                    decoded.data.multimodbus_EP3 = ((b3&0x08) === 0x08);
                    decoded.data.multimodbus_EP2 = ((b3&0x04) === 0x04);
                    decoded.data.multimodbus_EP1 = ((b3&0x02) === 0x02);
                    decoded.data.multimodbus_EP0 = ((b3&0x01) === 0x01);
                    let i2 = i1 + 4;
                    without_header = 0;
                    if (decoded.data.multimodbus_EP0 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP0_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP0_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP0_datasize = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.multimodbus_EP0_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for(let j = 0; j < decoded.data.multimodbus_EP0_datasize;j++)
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP0_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP0_datasize;
                    }
                    if (decoded.data.multimodbus_EP1 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP1_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP1_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP1_datasize = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.multimodbus_EP1_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP1_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP1_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP1_datasize;
                    }
                    if (decoded.data.multimodbus_EP2 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP2_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP2_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP2_datasize = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.multimodbus_EP2_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP2_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP2_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP2_datasize;
                    }
                    if (decoded.data.multimodbus_EP3 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP3_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP3_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP3_datasize = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.multimodbus_EP3_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP3_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP3_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP3_datasize;
                    }
                    if (decoded.data.multimodbus_EP4 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP4_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP4_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP4_datasize = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.multimodbus_EP4_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP4_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP4_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP4_datasize;
                    }
                    if (decoded.data.multimodbus_EP5 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP5_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP5_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP5_datasize = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.multimodbus_EP5_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP5_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP5_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP5_datasize;
                    }
                    if (decoded.data.multimodbus_EP6 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP6_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP6_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP6_datasize = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.multimodbus_EP6_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP6_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP6_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP6_datasize;
                    }
                    if (decoded.data.multimodbus_EP7 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP7_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP7_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP7_datasize = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.multimodbus_EP7_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP7_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP7_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP7_datasize;
                    }
                    if (decoded.data.multimodbus_EP8 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP8_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP8_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP8_datasize = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.multimodbus_EP8_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP8_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP8_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP8_datasize;
                    }
                    if (decoded.data.multimodbus_EP9 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP6_slaveID = bytes[i2];
                            decoded.data.multimodbus_EP6_fnctID = bytes[i2+1];
                            decoded.data.multimodbus_EP6_datasize = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.multimodbus_EP6_payload = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP6_datasize; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP6_payload += temp_hex_str;
                        }
                        i2 += decoded.data.multimodbus_EP6_datasize;
                    }
                }
                if (  (clustID === 0x0052 ) && (attID === 0x0000)) {
                    decoded.data.active_energy_Wh = UintToInt(bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3],3);
                    decoded.data.reactive_energy_Varh = UintToInt(bytes[i1+4]*256*256+bytes[i1+5]*256+bytes[i1+6],3);
                    decoded.data.nb_samples = (bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.active_power_W = UintToInt(bytes[i1+9]*256+bytes[i1+10],2);
                    decoded.data.reactive_power_let = UintToInt(bytes[i1+11]*256+bytes[i1+12],2);
                }
                if ((clustID === 0x8004 ) && (attID === 0x0000)) {
                    if (bytes[i1] === 1)
                        decoded.data.message_type = "confirmed";
                    if (bytes[i1] === 0)
                        decoded.data.message_type = "unconfirmed";
                }
                if ((clustID === 0x8004 ) && (attID === 0x0001)) {
                    decoded.data.nb_retry= bytes[i1] ;
                }
                if ((clustID === 0x8004 ) && (attID === 0x0002)) {
                    decoded.data.automatic_association = {};
                    decoded.data.automatic_association.period_in_minutes = bytes[i1+1] *256+bytes[i1+2];
                    decoded.data.automatic_association.nb_err_frames = bytes[i1+3] *256+bytes[i1+4];
                }
                if ((clustID===0x8004) && (attID===0x0003)){
                    decoded.data.datarate = bytes[i1+2];
                }
                if ((clustID===0x8004) && (attID===0x0004)){
                    decoded.data.ABP_dev_address = "";
                    for (let i = 0; i<4; i++){
                        decoded.data.ABP_dev_address += String(bytes[i1+1+i]);
                        if (i<3) decoded.data.ABP_dev_address += ".";

                    }
                }
                if ((clustID===0x8004) && (attID===0x0005)){
                    decoded.data.OTA_app_EUI = "";
                    for (let i = 0; i<8; i++){
                        decoded.data.OTA_app_EUI += String(bytes[i1+1+i]);
                        if (i<7) decoded.data.OTA_app_EUI += ".";

                    }
                }
                if ((clustID===0x0050) && (attID===0x0004)){
                    let length = bytes[i1]*256+bytes[i1+1];
                    let configuration = {}
                    let nbendpoints = bytes[i1+2];
                    for (let i = 0; i < nbendpoints; i++) {
                        let endpoint = {}
                        endpoint.endpoint = bytes[i1+3+i*7];
                        let nbinput_cluster = bytes[i1+4+i*7];
                        endpoint.input_clusters = []
                        for (let j=0; j < nbinput_cluster; j++){
                            let cluster = {}
                            endpoint.input_clusters[j] = decimalToHex(bytes[i1 + 5 + i * 7 + j * 2] * 256 + bytes[i1 + 6 + i * 7 + j * 2], 4);
                        }
                        let nboutput_cluster = bytes[i1+5+i*7+nbinput_cluster*2];
                        endpoint.output_clusters = []
                        for (let j=0; j < nboutput_cluster; j++){
                            let cluster = {}
                            endpoint.output_clusters[j] = decimalToHex(bytes[i1 + 6 + i * 7 + j * 2] * 256 + bytes[i1 + 7 + i * 7 + j * 2], 4);
                        }
                        configuration[i] = endpoint;
                    }
                    decoded.data.configuration = configuration;
                    console.log("configuration",configuration)
                    console.log(configuration[0].input_clusters)



                }
                if ((clustID === 0x0050 ) && (attID === 0x0006)) {
                    let i2 = i1 + 3;
                    if ((bytes[i1+2] &0x01) === 0x01) {decoded.data.main_or_external_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x02) === 0x02) {decoded.data.rechargeable_battery_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x04) === 0x04) {decoded.data.disposable_battery_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x08) === 0x08) {decoded.data.solar_harvesting_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x10) === 0x10) {decoded.data.tic_harvesting_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                }
                if ((clustID === 0x0050) && (firsthalfattID === 0xFF)){
                    console.log("je suis dans le 0xFF")

                    let secondhalfattID = bytes[5];
                    let action = "action "+secondhalfattID.toString();
                    decoded.data[action]=""
                    let length = bytes[i1+1]
                    let actionvalue = "none"
                    for (let i = 0; i < length; i++) {
                        actionvalue += String.fromCharCode(bytes[i1 + 1 + i])
                    }
                    decoded.data[action] = actionvalue;
                }
                if (  (clustID === 0x800a) && (attID === 0x0000)) {
                    let i2 = i1;
                    decoded.data.sum_positive_active_energy_Wh = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.sum_negative_active_energy_Wh = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.sum_positive_reactive_energy_Wh = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.sum_negative_reactive_energy_Wh = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.positive_active_power_W = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.negative_active_power_W = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.positive_reactive_power_W = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.negative_reactive_power_W = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                }
                if (  (clustID === 0x8010) && (attID === 0x0000)) {
                    decoded.data.ActiveEnergyWhPhaseA=Int32UnsignedToSigned(bytes[i1+1]*256*256*256+bytes[i1+2]*256*256+bytes[i1+3]*256+bytes[i1+4]);
                    decoded.data.ReactiveEnergyWhPhaseA=Int32UnsignedToSigned(bytes[i1+5]*256*256*256+bytes[i1+6]*256*256+bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.ActiveEnergyWhPhaseB=Int32UnsignedToSigned(bytes[i1+9]*256*256*256+bytes[i1+10]*256*256+bytes[i1+11]*256+bytes[i1+12]);
                    decoded.data.ReactiveEnergyWhPhaseB=Int32UnsignedToSigned(bytes[i1+13]*256*256*256+bytes[i1+14]*256*256+bytes[i1+15]*256+bytes[i1+16]);
                    decoded.data.ActiveEnergyWhPhaseC=Int32UnsignedToSigned(bytes[i1+17]*256*256*256+bytes[i1+18]*256*256+bytes[i1+19]*256+bytes[i1+20]);
                    decoded.data.ReactiveEnergyWhPhaseC=Int32UnsignedToSigned(bytes[i1+21]*256*256*256+bytes[i1+22]*256*256+bytes[i1+23]*256+bytes[i1+24]);
                    decoded.data.ActiveEnergyWhPhaseABC=Int32UnsignedToSigned(bytes[i1+25]*256*256*256+bytes[i1+26]*256*256+bytes[i1+27]*256+bytes[i1+28]);
                    decoded.data.ReactiveEnergyWhPhaseABC=Int32UnsignedToSigned(bytes[i1+29]*256*256*256+bytes[i1+30]*256*256+bytes[i1+31]*256+bytes[i1+32]);
                } else if (  (clustID === 0x8010) && (attID === 0x0001)) {
                    decoded.data.ActivePowerWPhaseA= Int32UnsignedToSigned(bytes[i1+1]*256*256*256+bytes[i1+2]*256*256+bytes[i1+3]*256+bytes[i1+4]);
                    decoded.data.ReactivePowerWPhaseA= Int32UnsignedToSigned(bytes[i1+5]*256*256*256+bytes[i1+6]*256*256+bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.ActivePowerWPhaseB=Int32UnsignedToSigned(bytes[i1+9]*256*256*256+bytes[i1+10]*256*256+bytes[i1+11]*256+bytes[i1+12]);
                    decoded.data.ReactivePowerWPhaseB=Int32UnsignedToSigned(bytes[i1+13]*256*256*256+bytes[i1+14]*256*256+bytes[i1+15]*256+bytes[i1+16]);
                    decoded.data.ActivePowerWPhaseC=Int32UnsignedToSigned(bytes[i1+17]*256*256*256+bytes[i1+18]*256*256+bytes[i1+19]*256+bytes[i1+20]);
                    decoded.data.ReactivePowerWPhaseC=Int32UnsignedToSigned(bytes[i1+21]*256*256*256+bytes[i1+22]*256*256+bytes[i1+23]*256+bytes[i1+24]);
                    decoded.data.ActivePowerWPhaseABC=Int32UnsignedToSigned(bytes[i1+25]*256*256*256+bytes[i1+26]*256*256+bytes[i1+27]*256+bytes[i1+28]);
                    decoded.data.ReactivePowerWPhaseABC=Int32UnsignedToSigned(bytes[i1+29]*256*256*256+bytes[i1+30]*256*256+bytes[i1+31]*256+bytes[i1+32]);
                }
                if (  (clustID === 0x800b) && (attID === 0x0000)) {
                    let i2 = i1;
                    decoded.data.Vrms = UintToInt(bytes[i2+1]*256+bytes[i2+2],2)/10;
                    i2 = i2 + 2;
                    decoded.data.Irms = UintToInt(bytes[i2+1]*256+bytes[i2+2],2)/10;
                    i2 = i2 + 2;
                    decoded.data.phase_angle = UintToInt(bytes[i2+1]*256+bytes[i2+2],2);
                }
                if (  (clustID === 0x800d) && (attID === 0x0000)) {
                    decoded.data.VrmsA=UintToInt(bytes[i1+1]*256+bytes[i1+2],2)/10;
                    decoded.data.IrmsA=UintToInt(bytes[i1+3]*256+bytes[i1+4],2)/10;
                    decoded.data.PhaseA=UintToInt(bytes[i1+5]*256+bytes[i1+6],2);
                    decoded.data.VrmsB=UintToInt(bytes[i1+7]*256+bytes[i1+8],2)/10;
                    decoded.data.IrmsB=UintToInt(bytes[i1+9]*256+bytes[i1+10],2)/10;
                    decoded.data.PhaseB=UintToInt(bytes[i1+11]*256+bytes[i1+12],2);
                    decoded.data.VrmsC=UintToInt(bytes[i1+13]*256+bytes[i1+14],2)/10;
                    decoded.data.IrmsC=UintToInt(bytes[i1+15]*256+bytes[i1+16],2)/10;
                    decoded.data.PhaseC=UintToInt(bytes[i1+17]*256+bytes[i1+18],2);
                }
                if ((clustID === 0x800c) && (attID === 0x0000)){
                    decoded.data.Concentration = (bytes[i1]*256+bytes[i1+1]);
                    if (cmdID===0x8a) {
                        if (bytes[i1 + 2] !== undefined) {
                            let rc = decimalToBitString(bytes[i1 + 2])
                        }
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        if (bytes[i1 + 2] === undefined) {
                            rc = "none"
                        } else {
                            rc = decimalToBitString(bytes[i1 + 2])
                        }
                        if (rc === "none") {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmess = listMess
                        }
                        ;
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, i1)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(length, listMess, flag, bytes, decoded, i1, divider)
                        }
                    }


                }
                if ((clustID===0x800C)&&(attID===0x0001)) decoded.data.analog=bytes[i1];
                if ((clustID===0x800C)&&(attID===0x0002)) decoded.data.analog=bytes[i1];
                if ((clustID === 0x0400) && (attID === 0x0000)) decoded.data.Illuminance = (bytes[i1]*256+bytes[i1+1]);
                if ((clustID === 0x0403) && (attID === 0x0000)) decoded.data.Pressure = (UintToInt(bytes[i1]*256+bytes[i1+1],2));
                if ((clustID === 0x0406) && (attID === 0x0000)) decoded.data.Occupancy = !(!bytes[i1]);
                if ((clustID === 0x8052) && (attID === 0x0000)) {
                    let i2 = i1;
                    decoded.data.frequency = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) + 22232) / 1000;
                    i2 = i2 + 2;
                    decoded.data.frequency_min = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) + 22232) / 1000;
                    i2 = i2 + 2;
                    decoded.data.frequency_max = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) + 22232) / 1000;
                    i2 = i2 + 2;
                    decoded.data.Vrms = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vrms_min = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vrms_max = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vpeak = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vpeak_min = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vpeak_max = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) / 10;
                    i2 = i2 + 2;
                    decoded.data.over_voltage = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
                    i2 = i2 + 2;
                    decoded.data.sag_voltage = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
                }
                if (  (clustID === 0x800f) ) {
                    let i = i1+1;
                    if (attID === 0x0000) {
                        let o = decoded.data.Last = {};
                        o.NbTriggedAcq = BytesToInt64(bytes,i,"U32"); i+=4;
                        o.Mean_X_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Max_X_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Dt_X_ms  = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Mean_Y_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Max_Y_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Dt_Y_ms  = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Mean_Z_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Max_Z_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Dt_Z_ms  = BytesToInt64(bytes,i,"U16");
                    } else if (attID === 0x0001 || (attID === 0x0002) || (attID === 0x0003)){
                        let ext = (attID === 0x0001 ? "Stats_X" : (attID === 0x0002 ? "Stats_Y" : "Stats_Z"));
                        let o = decoded.data[ext] = {};
                        o.NbAcq     = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.MinMean_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MinMax_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MinDt     = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.MeanMean_G= BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MeanMax_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MeanDt    = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.MaxMean_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MaxMax_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MaxDt     = BytesToInt64(bytes,i,"U16"); i+=2;
                    } else if (attID === 0x8000) {
                        let o = decoded.data.Params = {};
                        o.WaitFreq_Hz       = BytesToInt64(bytes,i,"U16")/10.0; i+=2;
                        o.AcqFreq_Hz        = BytesToInt64(bytes,i,"U16")/10.0; i+=2;
                        let delay = BytesToInt64(bytes,i,"U16"); i+=2;
                        if (delay & 0x8000) delay = (delay & (~0x8000)) * 60;
                        o.NewWaitDelay_s    = (delay & 0x8000 ? delay = (delay & (~0x8000)) * 60 : delay);
                        o.MaxAcqDuration_ms = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Threshold_X_G     = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Threshold_Y_G     = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Threshold_Z_G     = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.OverThrsh_Dt_ms   = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.UnderThrsh_Dt_ms  = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Range_G           = BytesToInt64(bytes,i,"U16")/100; i+=2;
                        o.FilterSmoothCoef  = BytesToInt64(bytes,i,"U8"); i+=1;
                        o.FilterGainCoef    = BytesToInt64(bytes,i,"U8"); i+=1;
                        o = decoded.data.Params.WorkingModes = {};
                        o.SignalEachAcq     = (bytes[i] & 0x80 ? "true" : "false");
                        o.RstAftStdRpt_X    = (bytes[i] & 0x01 ? "true" : "false");
                        o.RstAftStdRpt_Y    = (bytes[i] & 0x02 ? "true" : "false");
                        o.RstAftStdRpt_7    = (bytes[i] & 0x04 ? "true" : "false");
                    }
                }
            }
            if(cmdID === 0x07){
                attID = bytes[6]*256 + bytes[7];decoded.zclheader.attID = decimalToHex(attID,4);
                decoded.zclheader.status = bytes[4];
                decoded.zclheader.batch = bytes[5];
            }
            if(cmdID === 0x09){
                attID = bytes[6]*256 + bytes[7];decoded.zclheader.attID = decimalToHex(attID,4);
                decoded.zclheader.status = bytes[4];
                decoded.zclheader.batch = bytes[5];
                decoded.zclheader.attribut_type = bytes[8];
                decoded.zclheader.min = {}
                if ((bytes[9] & 0x80) === 0x80) {decoded.zclheader.min.value = (bytes[9]-0x80)*256+bytes[10];decoded.zclheader.min.unit = "minutes";} else {decoded.zclheader.min.value = bytes[9]*256+bytes[10];decoded.zclheader.min.unit = "seconds";}
                decoded.zclheader.max = {}
                if ((bytes[11] & 0x80) === 0x80) {decoded.zclheader.max.value = (bytes[11]-0x80)*256+bytes[12];decoded.zclheader.max.unit = "minutes";} else {decoded.zclheader.max.value = bytes[11]*256+bytes[12];decoded.zclheader.max.unit = "seconds";}
                decoded.lora.payload  = "";

                if ((clustID===0x0050) && (attID===0x0006)){
                    let length = bytes[13];
                    let nb = length/5
                    let i=0
                    while(nb>0){
                        decoded.zclheader.modepower = bytes[14+i*5];
                        decoded.zclheader.powersource = bytes[15+i*5];
                        decoded.zclheader.delta = bytes[16+i*5]*256+bytes[17+i*5];
                        decoded.zclheader.changedpowersource = bytes[18+i*5];
                        i++
                        nb--
                    }
                }
            }
        }
        else
        {
            decoded.batch = {};
            decoded.batch.report = "batch";
        }
    }
    return decoded;
}
function normalisation_standard(input, endpoint_parameters){
    let warning = "";
    let bytes = input.bytes;
    console.log(input)
    let decoded = Decoder(bytes, input.fPort);
    console.log(decoded)
    if (decoded.zclheader !== undefined){
        if (decoded.zclheader.alarm){
            warning = decoded.zclheader.alarmmess
            console.log(warning)
        }
    }
    if (bytes[1] === 0x07 && bytes[0]%2 !== 0){
        return{
            data: decoded.zclheader,
            warning: warning
        }
    }
    else if (bytes[1] === 0x09){
        return{
            data: decoded.zclheader,
            warning: warning
        }
    }
    else if (bytes[1] === 0x01){
        if(decoded.zclheader.data === undefined){
            let firstKey = Object.keys(decoded.data)[0];
            return {
                data:{variable: firstKey,
                    value: decoded.data[firstKey],
                    date: input.recvTime
                },
                type: "standard",
                warning: warning
            }
        }
        else{
            return {
                data: {variable: "read reporting configuration response status",
                    value: decoded.zclheader.data,
                    date: input.recvTime
                },
                warning: warning
            }
        }
    }
    if (decoded.zclheader !== undefined){
        if (endpoint_parameters !== undefined) {
            let access = decoded.zclheader.endpoint;
            let firstKey = Object.keys(decoded.data)[0];
            let type = endpoint_parameters[firstKey][access];
            return {
                data: {variable: type,
                    value: decoded.data[firstKey],
                    date: input.recvTime
                },
                type: "standard",
                warning: warning
            }
        }
        else{
            let firstKey = Object.keys(decoded.data)[0];
            return {
                data:{variable: firstKey,
                    value: decoded.data[firstKey],
                    date: input.recvTime
                },
                type: "standard",
                warning: warning
            }
        }
    }
    return {
        type: decoded.batch.report,
        payload: decoded.lora.payload,
    }
}
module.exports = {normalisation_standard,};