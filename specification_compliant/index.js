function UintToInt(Uint, Size) {
    if ((Size === 2) && ((Uint & 0x8000) > 0)) Uint -= 0x10000;
    if ((Size === 3) && ((Uint & 0x800000) > 0)) Uint -= 0x1000000;
    if ((Size === 4) && ((Uint & 0x80000000) > 0)) Uint -= 0x100000000;
    return Uint;
}
function Bytes2Float32(bytes) {
    let sign = (bytes & 0x80000000) ? -1 : 1;
    let exponent = ((bytes >> 23) & 0xFF) - 127;
    let significand = (bytes & ~(-1 << 23));
    if (exponent == 128) return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);
    if (exponent == -127) {
        if (significand == 0) return sign * 0.0;
        exponent = -126;
        significand /= (1 << 23);
    } else significand = (significand | (1 << 23)) / (1 << 23);
    return sign * significand * Math.pow(2, exponent);
}
function BytesToInt64(InBytes, StartIndex, Type,LittleEndian)
{
    if( typeof(LittleEndian) == 'undefined' ) LittleEndian = false;
    let Signed  = (Type.substr(0,1) != "U");
    let BytesNb = parseInt(Type.substr(1,2), 10)/8;
    let inc, start;
    let nb = BytesNb;
    if (LittleEndian)
    {
        inc = -1;
        start = StartIndex + BytesNb - 1;
    }
    else inc =  1; start = StartIndex ;
    tmpInt64 = 0;
    for (j=start; nb > 0;(j+=inc,nb--))
    {
        tmpInt64 = (tmpInt64 << 8) + InBytes[j];
    }
    if ((Signed) && (BytesNb < 8) && (InBytes[start] & 0x80))
        tmpInt64 = tmpInt64 - (0x01 << (BytesNb * 8));
    return tmpInt64;
}
function decimalToHex(d, padding) {
    let hex = d.toString(16).toUpperCase();
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
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
        batch = !(bytes[0] & 0x01);
        if (batch === false){
            decoded.zclheader = {};
            decoded.zclheader.report =  "standard";
            attributID = -1;
            cmdID = -1;
            clusterdID = -1;
            decoded.zclheader.endpoint = ((bytes[0]&0xE0)>>5) | ((bytes[0]&0x06)<<2);
            cmdID =  bytes[1]; decoded.zclheader.cmdID = decimalToHex(cmdID,2);
            clusterdID = bytes[2]*256 + bytes[3]; decoded.zclheader.clusterdID = decimalToHex(clusterdID,4);
            if((cmdID === 0x0a)|(cmdID === 0x8a)|(cmdID === 0x01)){
                decoded.data = {};
                attributID = bytes[4]*256 + bytes[5];decoded.zclheader.attributID = decimalToHex(attributID,4);
                if (cmdID === 0x8a) decoded.zclheader.alarm = 1;
                if ((cmdID === 0x0a) | (cmdID === 0x8a)) index = 7;
                if (cmdID === 0x01)	{index = 8; decoded.zclheader.status = bytes[6];}
                if ((clusterdID === 0x0402 ) & (attributID === 0x0000)) decoded.data.temperature = (UintToInt(bytes[index]*256+bytes[index+1],2))/100;
                if ((clusterdID === 0x0405 ) & (attributID === 0x0000)) decoded.data.humidity = (bytes[index]*256+bytes[index+1])/100;
                if ((clusterdID === 0x000f ) & (attributID === 0x0402)) decoded.data.counter = (bytes[index]*256*256*256+bytes[index+1]*256*256+bytes[index+2]*256+bytes[index+3]);
                if ((clusterdID === 0x000f ) & (attributID === 0x0055)) decoded.data.pin_state = !(!bytes[index]);
                if ((clusterdID === 0x0013 ) & (attributID === 0x0055)) decoded.data.value = bytes[index];
                if ((clusterdID === 0x0006 ) & (attributID === 0x0000)) {state = bytes[index]; if(state === 1) decoded.data.state = "ON"; else decoded.data.state = "OFF" ; }
                if ((clusterdID === 0x8008 ) & (attributID === 0x0000)) decoded.data.differential_pressure =bytes[index]*256+bytes[index+1];
                if ((clusterdID === 0x8005 ) & (attributID === 0x0000))
                {
                    decoded.data.pin_state_1 = ((bytes[index+1]&0x01) === 0x01);
                    decoded.data.pin_state_2 = ((bytes[index+1]&0x02) === 0x02);
                    decoded.data.pin_state_3 = ((bytes[index+1]&0x04) === 0x04);
                    decoded.data.pin_state_4 = ((bytes[index+1]&0x08) === 0x08);
                    decoded.data.pin_state_5 = ((bytes[index+1]&0x10) === 0x10);
                    decoded.data.pin_state_6 = ((bytes[index+1]&0x20) === 0x20);
                    decoded.data.pin_state_7 = ((bytes[index+1]&0x40) === 0x40);
                    decoded.data.pin_state_8 = ((bytes[index+1]&0x80) === 0x80);
                    decoded.data.pin_state_9 = ((bytes[index]&0x01) === 0x01);
                    decoded.data.pin_state_10 = ((bytes[index]&0x02) === 0x02);
                }
                if ((clusterdID === 0x000c ) & (attributID === 0x0055)) decoded.data.analog = Bytes2Float32(bytes[index]*256*256*256+bytes[index+1]*256*256+bytes[index+2]*256+bytes[index+3]);
                if ((clusterdID === 0x8007 ) & (attributID === 0x0001))
                {
                    decoded.data.payload = "";
                    decoded.data.modbus_payload = "";
                    decoded.data.size = bytes[index];
                    decoded.data.modbus_float = 0;
                    for( let j = 0; j < decoded.data.size; j++ )
                    {
                        temp_hex_str   = bytes[index+j+1].toString( 16 ).toUpperCase();
                        if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                        decoded.data.payload += temp_hex_str;
                        if (j == 0) decoded.data.modbus_address = bytes[index+j+1];
                        else if (j == 1) decoded.data.modbus_commandID = bytes[index+j+1];
                        else if (j == 2) decoded.data.modbus_size = bytes[index+j+1];
                        else{
                            decoded.data.modbus_payload += temp_hex_str;
                            if (decoded.data.modbus_float == 1){ // big endian
                                if (j == 3)		decoded.data.fregister_00 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 7)		decoded.data.fregister_01 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 11)	decoded.data.fregister_02 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 15)	decoded.data.fregister_03 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 19)	decoded.data.fregister_04 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 23)	decoded.data.fregister_05 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 27)	decoded.data.fregister_06 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 31)	decoded.data.fregister_07 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 35)	decoded.data.fregister_08 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                                if (j == 35)	decoded.data.fregister_09 = Bytes2Float32(bytes[index+j+1]*256*256*256+bytes[index+j+1+1]*256*256+bytes[index+j+1+2]*256+bytes[index+j+1+3]);
                            }
                            if (decoded.data.modbus_float == 2){
                                if (j == 3)		decoded.data.fregister_00 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 7)		decoded.data.fregister_01 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 11)	decoded.data.fregister_02 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 15)	decoded.data.fregister_03 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 19)	decoded.data.fregister_04 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 23)	decoded.data.fregister_05 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 27)	decoded.data.fregister_06 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 31)	decoded.data.fregister_07 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 35)	decoded.data.fregister_08 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                                if (j == 35)	decoded.data.fregister_09 = Bytes2Float32(bytes[index+j+1]*256+bytes[index+j+1+1]+bytes[index+j+1+2]*256*256*256+bytes[index+j+1+3]*256*256);
                            }
                        }
                    }
                }
                if ((clusterdID === 0x8009 ) & (attributID === 0x0000))
                {
                    decoded.data.payloads = "";
                    decoded.data.size = bytes[index];
                    decoded.data.multimodbus_frame_series_sent = bytes[index+1];
                    decoded.data.multimodbus_frame_number_in_serie = (bytes[index+2] & 0xE0) >> 5;
                    decoded.data.multimodbus_last_frame_of_serie = (bytes[index+2] & 0x1C ) >> 2;
                    decoded.data.multimodbus_EP9 = ((bytes[index+2]&0x01) === 0x01);
                    decoded.data.multimodbus_EP8 = ((bytes[index+2]&0x02) === 0x02);
                    decoded.data.multimodbus_EP7 = ((bytes[index+3]&0x80) === 0x80);
                    decoded.data.multimodbus_EP6 = ((bytes[index+3]&0x40) === 0x40);
                    decoded.data.multimodbus_EP5 = ((bytes[index+3]&0x20) === 0x20);
                    decoded.data.multimodbus_EP4 = ((bytes[index+3]&0x10) === 0x10);
                    decoded.data.multimodbus_EP3 = ((bytes[index+3]&0x08) === 0x08);
                    decoded.data.multimodbus_EP2 = ((bytes[index+3]&0x04) === 0x04);
                    decoded.data.multimodbus_EP1 = ((bytes[index+3]&0x02) === 0x02);
                    decoded.data.multimodbus_EP0 = ((bytes[index+3]&0x01) === 0x01);
                    index2 = index + 4;
                    without_header = 0;
                    if (decoded.data.multimodbus_EP0 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP0_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP0_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP0_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP0_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for(let j = 0; j < decoded.data.multimodbus_EP0_datasize;j++)
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP0_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP0_datasize;
                    }
                    if (decoded.data.multimodbus_EP1 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP1_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP1_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP1_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP1_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP1_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP1_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP1_datasize;
                    }
                    if (decoded.data.multimodbus_EP2 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP2_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP2_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP2_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP2_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP2_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP2_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP2_datasize;
                    }
                    if (decoded.data.multimodbus_EP3 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP3_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP3_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP3_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP3_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP3_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP3_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP3_datasize;
                    }
                    if (decoded.data.multimodbus_EP4 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP4_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP4_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP4_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP4_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP4_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP4_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP4_datasize;
                    }
                    if (decoded.data.multimodbus_EP5 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP5_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP5_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP5_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP5_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP5_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP5_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP5_datasize;
                    }
                    if (decoded.data.multimodbus_EP6 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP6_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP6_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP6_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP6_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP6_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP6_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP6_datasize;
                    }
                    if (decoded.data.multimodbus_EP7 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP7_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP7_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP7_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP7_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP7_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP7_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP7_datasize;
                    }
                    if (decoded.data.multimodbus_EP8 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP8_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP8_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP8_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP8_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP8_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP8_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP8_datasize;
                    }
                    if (decoded.data.multimodbus_EP9 === true)
                    {
                        if (without_header === 0){
                            decoded.data.multimodbus_EP6_slaveID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP6_fnctID = bytes[index2];
                            index2 = index2 + 1;
                            decoded.data.multimodbus_EP6_datasize = bytes[index2];
                            index2 = index2 + 1;
                        }
                        decoded.data.multimodbus_EP6_payload = ""
                        if (bytes[index2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.multimodbus_EP6_datasize; j++ )
                        {
                            temp_hex_str   = bytes[index2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length == 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.multimodbus_EP6_payload += temp_hex_str;
                        }
                        index2 = index2 + decoded.data.multimodbus_EP6_datasize;
                    }
                }
                if (  (clusterdID === 0x0052 ) & (attributID === 0x0000)) {
                    decoded.data.active_energy_Wh = UintToInt(bytes[index+1]*256*256+bytes[index+2]*256+bytes[index+3],3);
                    decoded.data.reactive_energy_Varh = UintToInt(bytes[index+4]*256*256+bytes[index+5]*256+bytes[index+6],3);
                    decoded.data.nb_samples = (bytes[index+7]*256+bytes[index+8]);
                    decoded.data.active_power_W = UintToInt(bytes[index+9]*256+bytes[index+10],2);
                    decoded.data.reactive_power_let = UintToInt(bytes[index+11]*256+bytes[index+12],2);
                }
                if ((clusterdID === 0x8004 ) & (attributID === 0x0000)) {
                    if (bytes[index] === 1)
                        decoded.data.message_type = "confirmed";
                    if (bytes[index] === 0)
                        decoded.data.message_type = "unconfirmed";
                }
                if ((clusterdID === 0x8004 ) & (attributID === 0x0001)) {
                    decoded.data.nb_retry= bytes[index] ;
                }
                if ((clusterdID === 0x8004 ) & (attributID === 0x0002)) {
                    decoded.data.period_in_minutes = bytes[index+1] *256+bytes[index+2];
                    decoded.data.nb_err_frames = bytes[index+3] *256+bytes[index+4];
                }
                if ((clusterdID === 0x0050 ) && (attributID === 0x0006)) {
                    index2 = index + 3;
                    if ((bytes[index+2] &0x01) === 0x01) {decoded.data.main_or_external_voltage = (bytes[index2]*256+bytes[index2+1])/1000;index2=index2+2;}
                    if ((bytes[index+2] &0x02) === 0x02) {decoded.data.rechargeable_battery_voltage = (bytes[index2]*256+bytes[index2+1])/1000;index2=index2+2;}
                    if ((bytes[index+2] &0x04) === 0x04) {decoded.data.disposable_battery_voltage = (bytes[index2]*256+bytes[index2+1])/1000;index2=index2+2;}
                    if ((bytes[index+2] &0x08) === 0x08) {decoded.data.solar_harvesting_voltage = (bytes[index2]*256+bytes[index2+1])/1000;index2=index2+2;}
                    if ((bytes[index+2] &0x10) === 0x10) {decoded.data.tic_harvesting_voltage = (bytes[index2]*256+bytes[index2+1])/1000;index2=index2+2;}
                }
                if (  (clusterdID === 0x800a) && (attributID === 0x0000)) {
                    index2 = index;
                    decoded.data.sum_positive_active_energy_Wh = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.sum_negative_active_energy_Wh = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.sum_positive_reactive_energy_Wh = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.sum_negative_reactive_energy_Wh = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.positive_active_power_W = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.negative_active_power_W = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.positive_reactive_power_W = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                    index2 = index2 + 4;
                    decoded.data.negative_reactive_power_W = UintToInt(bytes[index2+1]*256*256*256+bytes[index2+2]*256*256+bytes[index2+3]*256+bytes[index2+4],4);
                }
                if (  (clusterdID === 0x8010) & (attributID === 0x0000)) {
                    decoded.data.ActiveEnergyWhPhaseA=Int32UnsignedToSigned(bytes[index+1]*256*256*256+bytes[index+2]*256*256+bytes[index+3]*256+bytes[index+4]);
                    decoded.data.ReactiveEnergyWhPhaseA=Int32UnsignedToSigned(bytes[index+5]*256*256*256+bytes[index+6]*256*256+bytes[index+7]*256+bytes[index+8]);
                    decoded.data.ActiveEnergyWhPhaseB=Int32UnsignedToSigned(bytes[index+9]*256*256*256+bytes[index+10]*256*256+bytes[index+11]*256+bytes[index+12]);
                    decoded.data.ReactiveEnergyWhPhaseB=Int32UnsignedToSigned(bytes[index+13]*256*256*256+bytes[index+14]*256*256+bytes[index+15]*256+bytes[index+16]);
                    decoded.data.ActiveEnergyWhPhaseC=Int32UnsignedToSigned(bytes[index+17]*256*256*256+bytes[index+18]*256*256+bytes[index+19]*256+bytes[index+20]);
                    decoded.data.ReactiveEnergyWhPhaseC=Int32UnsignedToSigned(bytes[index+21]*256*256*256+bytes[index+22]*256*256+bytes[index+23]*256+bytes[index+24]);
                    decoded.data.ActiveEnergyWhPhaseABC=Int32UnsignedToSigned(bytes[index+25]*256*256*256+bytes[index+26]*256*256+bytes[index+27]*256+bytes[index+28]);
                    decoded.data.ReactiveEnergyWhPhaseABC=Int32UnsignedToSigned(bytes[index+29]*256*256*256+bytes[index+30]*256*256+bytes[index+31]*256+bytes[index+32]);
                } else if (  (clusterdID === 0x8010) & (attributID === 0x0001)) {
                    decoded.data.ActivePowerWPhaseA= Int32UnsignedToSigned(bytes[index+1]*256*256*256+bytes[index+2]*256*256+bytes[index+3]*256+bytes[index+4]);
                    decoded.data.ReactivePowerWPhaseA= Int32UnsignedToSigned(bytes[index+5]*256*256*256+bytes[index+6]*256*256+bytes[index+7]*256+bytes[index+8]);
                    decoded.data.ActivePowerWPhaseB=Int32UnsignedToSigned(bytes[index+9]*256*256*256+bytes[index+10]*256*256+bytes[index+11]*256+bytes[index+12]);
                    decoded.data.ReactivePowerWPhaseB=Int32UnsignedToSigned(bytes[index+13]*256*256*256+bytes[index+14]*256*256+bytes[index+15]*256+bytes[index+16]);
                    decoded.data.ActivePowerWPhaseC=Int32UnsignedToSigned(bytes[index+17]*256*256*256+bytes[index+18]*256*256+bytes[index+19]*256+bytes[index+20]);
                    decoded.data.ReactivePowerWPhaseC=Int32UnsignedToSigned(bytes[index+21]*256*256*256+bytes[index+22]*256*256+bytes[index+23]*256+bytes[index+24]);
                    decoded.data.ActivePowerWPhaseABC=Int32UnsignedToSigned(bytes[index+25]*256*256*256+bytes[index+26]*256*256+bytes[index+27]*256+bytes[index+28]);
                    decoded.data.ReactivePowerWPhaseABC=Int32UnsignedToSigned(bytes[index+29]*256*256*256+bytes[index+30]*256*256+bytes[index+31]*256+bytes[index+32]);
                }
                if (  (clusterdID === 0x800b) & (attributID === 0x0000)) {
                    index2 = index;
                    decoded.data.Vrms = UintToInt(bytes[index2+1]*256+bytes[index2+2],2)/10;
                    index2 = index2 + 2;
                    decoded.data.Irms = UintToInt(bytes[index2+1]*256+bytes[index2+2],2)/10;
                    index2 = index2 + 2;
                    decoded.data.phase_angle = UintToInt(bytes[index2+1]*256+bytes[index2+2],2);
                }
                if (  (clusterdID === 0x800d) & (attributID === 0x0000)) {
                    decoded.data.VrmsA=UintToInt(bytes[index+1]*256+bytes[index+2],2)/10;
                    decoded.data.IrmsA=UintToInt(bytes[index+3]*256+bytes[index+4],2)/10;
                    decoded.data.PhaseA=UintToInt(bytes[index+5]*256+bytes[index+6],2);
                    decoded.data.VrmsB=UintToInt(bytes[index+7]*256+bytes[index+8],2)/10;
                    decoded.data.IrmsB=UintToInt(bytes[index+9]*256+bytes[index+10],2)/10;
                    decoded.data.PhaseB=UintToInt(bytes[index+11]*256+bytes[index+12],2);
                    decoded.data.VrmsC=UintToInt(bytes[index+13]*256+bytes[index+14],2)/10;
                    decoded.data.IrmsC=UintToInt(bytes[index+15]*256+bytes[index+16],2)/10;
                    decoded.data.PhaseC=UintToInt(bytes[index+17]*256+bytes[index+18],2);
                }
                if ((clusterdID === 0x800c) & (attributID === 0x0000)) decoded.data.Concentration = (bytes[index]*256+bytes[index+1]);
                if ((clusterdID === 0x0400) & (attributID === 0x0000)) decoded.data.Illuminance = (bytes[index]*256+bytes[index+1]);
                if ((clusterdID === 0x0403) & (attributID === 0x0000)) decoded.data.Pressure = (UintToInt(bytes[index]*256+bytes[index+1],2));
                if ((clusterdID === 0x0406) & (attributID === 0x0000)) decoded.data.Occupancy = !(!bytes[index]);
                if ((clusterdID === 0x8052) & (attributID === 0x0000)) {
                    index2 = index;
                    decoded.data.frequency = (UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2],2) + 22232) / 1000;
                    index2 = index2 + 2;
                    decoded.data.frequency_min = (UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2],2) + 22232) / 1000;
                    index2 = index2 + 2;
                    decoded.data.frequency_max = (UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2],2) + 22232) / 1000;
                    index2 = index2 + 2;
                    decoded.data.Vrms = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2],2) / 10;
                    index2 = index2 + 2;
                    decoded.data.Vrms_min = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2], 2) / 10;
                    index2 = index2 + 2;
                    decoded.data.Vrms_max = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2], 2) / 10;
                    index2 = index2 + 2;
                    decoded.data.Vpeak = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2], 2) / 10;
                    index2 = index2 + 2;
                    decoded.data.Vpeak_min = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2],2) / 10;
                    index2 = index2 + 2;
                    decoded.data.Vpeak_max = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2],2) / 10;
                    index2 = index2 + 2;
                    decoded.data.over_voltage = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2], 2);
                    index2 = index2 + 2;
                    decoded.data.sag_voltage = UintToInt(bytes[index2 + 1] * 256 + bytes[index2 + 2], 2);
                }
                if (  (clusterdID === 0x800f) ) {
                    i = index+1;
                    if (attributID === 0x0000) {
                        o = decoded.data.Last = {};
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
                    } else if (attributID === 0x0001 || (attributID === 0x0002) || (attributID === 0x0003)){
                        ext = (attributID === 0x0001 ? "Stats_X" : (attributID === 0x0002 ? "Stats_Y" : "Stats_Z"));
                        o = decoded.data[ext] = {};
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
                    } else if (attributID === 0x8000) {
                        o = decoded.data.Params = {};
                        o.WaitFreq_Hz       = BytesToInt64(bytes,i,"U16")/10.0; i+=2;
                        o.AcqFreq_Hz        = BytesToInt64(bytes,i,"U16")/10.0; i+=2;
                        delay = BytesToInt64(bytes,i,"U16"); i+=2;
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
                attributID = bytes[6]*256 + bytes[7];decoded.zclheader.attributID = decimalToHex(attributID,4);
                decoded.zclheader.status = bytes[4];
                decoded.zclheader.batch = bytes[5];
            }
            if(cmdID === 0x09){
                attributID = bytes[6]*256 + bytes[7];decoded.zclheader.attributID = decimalToHex(attributID,4);
                decoded.zclheader.status = bytes[4];
                decoded.zclheader.batch = bytes[5];
                decoded.zclheader.attribut_type = bytes[8];
                decoded.zclheader.min = {}
                if ((bytes[9] & 0x80) === 0x80) {decoded.zclheader.min.value = (bytes[9]-0x80)*256+bytes[10];decoded.zclheader.min.unity = "minutes";} else {decoded.zclheader.min.value = bytes[9]*256+bytes[10];decoded.zclheader.min.unity = "seconds";}
                decoded.zclheader.max = {}
                if ((bytes[11] & 0x80) === 0x80) {decoded.zclheader.max.value = (bytes[11]-0x80)*256+bytes[12];decoded.zclheader.max.unity = "minutes";} else {decoded.zclheader.max.value = bytes[11]*256+bytes[12];decoded.zclheader.max.unity = "seconds";}
                decoded.lora.payload  = "";
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
    let decoded = Decoder(bytes, input.fPort);
    if (decoded.zclheader !== undefined){
        if (decoded.zclheader.alarm){
            warning = "événement surveillé déclanché"
        }
    }
    if (bytes[1] === 0x07 && bytes[0]%2 !== 0){
        return{
            data:{variable:"configure reporting response status",
                value: decoded.zclheader.status,
                date: input.recvTime
            },
            warning: warning
        }
    }
    else if (bytes[1] === 0x09){
        return{
            data:{variable:"read reporting configuration response status",
                value: decoded.zclheader.status,
                date: input.recvTime
            },
            warning: warning
        }
    }
    else if (bytes[1] === 0x01){
        if(decoded.zclheader.data === undefined){
            return {
                data: {variable: "read reporting configuration response status",
                    value: "no data",
                    date: input.recvTime
                },
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
let ST_UNDEF = 0;
let ST_BL = 1;
let ST_U4 = 2;
let ST_I4 = 3;
let ST_U8 = 4;
let ST_I8 = 5;
let ST_U16 = 6;
let ST_I16 = 7;
let ST_U24 = 8;
let ST_I24 = 9;
let ST_U32 = 10;
let ST_I32 = 11;
let ST_FL = 12;
let ST = {};
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
let BR_HUFF_MAX_INDEX_TABLE = 14;
let NUMBER_OF_SERIES = 16;
let HUFF = [
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
Math.trunc = Math.trunc || function(x) {
        if (isNaN(x)) return NaN;
        if (x > 0) return Math.floor(x);
        return Math.ceil(x);
    };
function brUncompress(tagsz, argList, hexString, batch_absolute_timestamp) {
    let out = initResult();
    let buffer = createBuffer(parseHexString(hexString));
    let flag = generateFlag(buffer.getNextSample(ST_U8));
    out.batch_counter = buffer.getNextSample(ST_U8, 3);
    buffer.getNextSample(ST_U8, 1);
    let temp = prePopulateOutput(out, buffer, argList, flag, tagsz);
    let last_timestamp = temp.last_timestamp;
    let index_of_the_first_sample = temp.index_of_the_first_sample;
    if (flag.hasSample) {
        last_timestamp = uncompressSamplesData(out, buffer, index_of_the_first_sample, argList, last_timestamp, flag, tagsz);
    }
    out.batch_relative_timestamp = extractTimestampFromBuffer(buffer, last_timestamp);
    return adaptToExpectedFormat(out, argList, batch_absolute_timestamp);
}
function initResult() {
    let series = [],
        i = 0;
    while (i < NUMBER_OF_SERIES) {
        series.push({codingType: 0,
            codingTable: 0,
            resolution: null,
            uncompressSamples: []
        });
        i += 1;
    }
    return {batch_counter: 0,
        batch_relative_timestamp: 0,
        series: series
    };
}
function createBuffer(byteArray) {
    function bitsBuf2HuffPattern(byteArray, index, nb_bits) {
        let sourceBitStart = index;
        let sz = nb_bits - 1;
        if (byteArray.length * 8 < sourceBitStart + nb_bits) {
            throw new Error("Batch : Verify that dest buf is large enough");
        }
        let bittoread = 0;
        let pattern = 0;
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
            let nbBits = nbBitsInput || ST[sampleType];
            let sourceBitStart = this.index;
            this.index += nbBits;
            if (sampleType === ST_FL && nbBits !== 32) {
                throw new Error("Batch : Mauvais sampletype");
            }
            let u32 = 0;
            let nbytes = Math.trunc((nbBits - 1) / 8) + 1;
            let nbitsfrombyte = nbBits % 8;
            if (nbitsfrombyte === 0 && nbytes > 0) {
                nbitsfrombyte = 8;
            }
            while (nbytes > 0) {
                let bittoread = 0;
                while (nbitsfrombyte > 0) {
                    let idx = sourceBitStart >> 3;
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
            if (
                (sampleType == ST_I4 || sampleType == ST_I8 ||sampleType == ST_I16 ||sampleType == ST_I24) &&
                u32 & (1 << (nbBits - 1))
            ) {
                for (let i = nbBits; i < 32; i++) {
                    u32 |= 1 << i;
                    nbBits++;
                }
            }
            return u32;
        },
        getNextBifromHi: function(huff_coding) {
            for (let i = 2; i < 12; i++) {
                let lhuff = bitsBuf2HuffPattern(this.byteArray, this.index, i);
                for (let j = 0; j < HUFF[huff_coding].length; j++) {
                    if (
                        HUFF[huff_coding][j].sz == i &&
                        lhuff == HUFF[huff_coding][j].lbl
                    ) {
                        this.index += i;
                        return j;
                    }
                }
            }
            throw new Error("Bi not found in HUFF table");
        }
    }
}
function generateFlag(flagAsInt) {
    let binbase = flagAsInt.toString(2)
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
function prePopulateOutput(out, buffer, argList, flag, tagsz) {
    let currentTimestamp = 0
    let index_of_the_first_sample = 0
    for (let i = 0; i < flag.nb_of_type_measure; i++) {
        let tag = {
            size: tagsz,
            lbl: buffer.getNextSample(ST_U8, tagsz)
        }
        let sampleIndex = findIndexFromArgList(argList, tag)

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
function findIndexFromArgList(argList, tag) {
    for (let i = 0; i < argList.length; i++) {
        if (argList[i].taglbl === tag.lbl) {
            return i
        }
    }
    throw new Error("Batch : Cannot find index in argList");
}
function extractTimestampFromBuffer(buffer, baseTimestamp) {
    if (baseTimestamp) {
        let bi = buffer.getNextBifromHi(1)
        return computeTimestampFromBi(buffer, baseTimestamp, bi)
    }
    return buffer.getNextSample(ST_U32)
}
function computeTimestampFromBi(buffer, baseTimestamp, bi) {
    if (bi > BR_HUFF_MAX_INDEX_TABLE) {
        return buffer.getNextSample(ST_U32)
    }
    if (bi > 0) {
        return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi)
    }
    return baseTimestamp
}
function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
    return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1
}
function getMeasure(buffer, sampletype) {
    let v = buffer.getNextSample(sampletype)
    return sampletype === ST_FL ? bytes2Float32(v) : v
}
function bytes2Float32(bytes) {
    let sign = bytes & 0x80000000 ? -1 : 1,
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
function uncompressSamplesData(out, buffer, index_of_the_first_sample, argList, last_timestamp, flag, tagsz) {
    if (flag.isCommonTimestamp) {
        return handleCommonTimestamp(out, buffer, index_of_the_first_sample, argList, flag, tagsz)
    }
    return handleSeparateTimestamp(out, buffer, argList, last_timestamp, flag, tagsz)
}
function handleCommonTimestamp(out, buffer, index_of_the_first_sample, argList, flag, tagsz) {
    let nb_sample_to_parse = buffer.getNextSample(ST_U8, 8)
    let tag = {}
    let temp = initTimestampCommonTable(out, buffer, nb_sample_to_parse, index_of_the_first_sample)
    let timestampCommon = temp.timestampCommon
    let lastTimestamp = temp.lastTimestamp
    for (let j = 0; j < flag.nb_of_type_measure; j++) {
        let first_null_delta_value = 1
        tag.lbl = buffer.getNextSample(ST_U8, tagsz)
        let sampleIndex = findIndexFromArgList(argList, tag)
        for (let i = 0; i < nb_sample_to_parse; i++) {
            let available = buffer.getNextSample(ST_U8, 1)
            if (available) {
                let bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable)
                let currentMeasure = {
                    data_relative_timestamp: 0,
                    data: {}
                }
                if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
                    let precedingValue =
                        out.series[sampleIndex].uncompressSamples[
                        out.series[sampleIndex].uncompressSamples.length - 1
                            ].data.value
                    if (bi > 0) {
                        currentMeasure.data.value = completeCurrentMeasure(buffer, precedingValue, out.series[sampleIndex].codingType, argList[sampleIndex].resol, bi)
                    } else {
                        if (first_null_delta_value) {
                            first_null_delta_value = 0
                            continue
                        } else {
                            currentMeasure.data.value = precedingValue
                        }
                    }
                } else {
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
function initTimestampCommonTable(out, buffer, nbSampleToParse, firstSampleIndex) {
    let timestampCommon = []
    let lastTimestamp = 0
    let timestampCoding = buffer.getNextSample(ST_U8, 2)
    for (let i = 0; i < nbSampleToParse; i++) {
        let bi = buffer.getNextBifromHi(timestampCoding)
        if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
            if (i === 0) {
                timestampCommon.push(out.series[firstSampleIndex].uncompressSamples[0].data_relative_timestamp)
            } else {
                if (bi > 0) {
                    let precedingTimestamp = timestampCommon[i - 1]
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
function completeCurrentMeasure(buffer, precedingValue, codingType, resol, bi) {
    let currentValue = buffer.getNextSample(ST_U16, bi)
    if (codingType === 0) {
        return computeAdlcValue(currentValue, resol, precedingValue, bi)
    }
    if (codingType === 1) {
        return (currentValue + Math.pow(2, bi) - 1) * resol + precedingValue
    }
    return precedingValue - (currentValue + (Math.pow(2, bi) - 1)) * resol
}
function computeAdlcValue(currentValue, resol, precedingValue, bi) {
    if (currentValue >= Math.pow(2, bi - 1)) {
        return currentValue * resol + precedingValue
    }
    return (currentValue + 1 - Math.pow(2, bi)) * resol + precedingValue
}
function handleSeparateTimestamp(out, buffer, argList, last_timestamp, flag, tagsz) {
    let tag = {}
    for (let i = 0; i < flag.nb_of_type_measure; i++) {
        tag.lbl = buffer.getNextSample(ST_U8, tagsz)
        let sampleIndex = findIndexFromArgList(argList, tag)
        let compressSampleNb = buffer.getNextSample(ST_U8, 8)
        if (compressSampleNb) {
            let timestampCoding = buffer.getNextSample(ST_U8, 2)
            for (let j = 0; j < compressSampleNb; j++) {
                let precedingRelativeTimestamp =
                    out.series[sampleIndex].uncompressSamples[
                    out.series[sampleIndex].uncompressSamples.length - 1
                        ].data_relative_timestamp
                let currentMeasure = {
                    data_relative_timestamp: 0,
                    data: {}
                }
                let bi = buffer.getNextBifromHi(timestampCoding)
                currentMeasure.data_relative_timestamp = computeTimestampFromBi(buffer, precedingRelativeTimestamp, bi)
                if (currentMeasure.data_relative_timestamp > last_timestamp) {
                    last_timestamp = currentMeasure.data_relative_timestamp
                }
                bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable)
                if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
                    let precedingValue =
                        out.series[sampleIndex].uncompressSamples[
                        out.series[sampleIndex].uncompressSamples.length - 1
                            ].data.value
                    if (bi > 0) {
                        currentMeasure.data.value = completeCurrentMeasure(buffer, precedingValue, out.series[sampleIndex].codingType, argList[sampleIndex].resol, bi)
                    } else {
                        currentMeasure.data.value = precedingValue
                    }
                } else {
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
function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
    let returnedGlobalObject = {
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
                    let returned = {
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
function computeDataAbsoluteTimestamp(bat, brt, drt) {
    return new Date(new Date(bat) - (brt - drt) * 1000).toISOString()
}

try {
    module.exports = brUncompress
} catch (e) {
    exports.err_msg = e
}

function normalisation_batch(input){
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
function watteco_decodeUplink(input, batch_parameters, endpoint_parameters) {
    let bytes = input.bytes;
    let port = input.fPort;
    let date = input.recvTime;

    try {
        let decoded = normalisation_standard(input, endpoint_parameters)
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
                let decoded = normalisation_batch(batchInput)
                return {
                    data: decoded,
                    warnings: [""],
                }
            } catch (error) {
                return {
                    error: error.message,
                    warnings: [""],
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
            warnings: [""],
        };
    }
}
let batch_param = [2, [{ taglbl: 0, resol: 10, sampletype: 7, lblname: "temperature", divide: 100 }, { taglbl: 1, resol: 100, sampletype: 6, lblname: "humidity", divide: 100 }, { taglbl: 2, resol: 1, sampletype: 6, lblname: "battery_voltage", divide: 1000 }, { taglbl: 3, resol: 1, sampletype: 1, lblname: "open_case", divide: 1 }]];
function decodeUplink(input) {
    return result = watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;