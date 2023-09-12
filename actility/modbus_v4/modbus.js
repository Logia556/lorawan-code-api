let watteco = require("../../codec/decode_uplink")

let batch_param=[]
let endpointCorresponder={
    modbus_payload:["modbus_payload_1","modbus_payload_2","modbus_payload_3","modbus_payload_4","modbus_payload_5","modbus_payload_6","modbus_payload_7","modbus_payload_8","modbus_payload_9"],
    modbus_slaveID:["modbus_slaveID_1","modbus_slaveID_2","modbus_slaveID_3","modbus_slaveID_4","modbus_slaveID_5","modbus_slaveID_6","modbus_slaveID_7","modbus_slaveID_8","modbus_slaveID_9"],
    modbus_fnctID:["modbus_fnctID_1","modbus_fnctID_2","modbus_fnctID_3","modbus_fnctID_4","modbus_fnctID_5","modbus_fnctID_6","modbus_fnctID_7","modbus_fnctID_8","modbus_fnctID_9"],
    modbus_datasize:["modbus_datasize_1","modbus_datasize_2","modbus_datasize_3","modbus_datasize_4","modbus_datasize_5","modbus_datasize_6","modbus_datasize_7","modbus_datasize_8","modbus_datasize_9"]
}
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input, batch_param, endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

