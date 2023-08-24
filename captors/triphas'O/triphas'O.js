let watteco = require("../../codec/decode_uplink")


function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;

let endpointCorresponder ={
    sum_positive_active_energy_Wh: ["sum_positive_active_energy_Wh_1","sum_positive_active_energy_Wh_2","sum_positive_active_energy_Wh_3","sum_positive_active_energy_Wh_4"],
    sum_negative_active_energy_Wh: ["sum_negative_active_energy_Wh_1","sum_negative_active_energy_Wh_2","sum_negative_active_energy_Wh_3","sum_negative_active_energy_Wh_4"],
    sum_positive_reactive_energy_Wh: ["sum_positive_reactive_energy_Wh_1","sum_positive_reactive_energy_Wh_2","sum_positive_reactive_energy_Wh_3","sum_positive_reactive_energy_Wh_4"],
    sum_negative_reactive_energy_Wh: ["sum_negative_reactive_energy_Wh_1","sum_negative_reactive_energy_Wh_2","sum_negative_reactive_energy_Wh_3","sum_negative_reactive_energy_Wh_4"],
    positive_active_power_W: ["positive_active_power_W_1","positive_active_power_W_2","positive_active_power_W_3","positive_active_power_W_4"],
    negative_active_power_W: ["negative_active_power_W_1","negative_active_power_W_2","negative_active_power_W_3","negative_active_power_W_4"],
    positive_reactive_power_W: ["positive_reactive_power_W_1","positive_reactive_power_W_2","positive_reactive_power_W_3","positive_reactive_power_W_4"],
    negative_reactive_power_W: ["negative_reactive_power_W_1","negative_reactive_power_W_2","negative_reactive_power_W_3","negative_reactive_power_W_4"],
    Vrms: ["Vrms_1","Vrms_2","Vrms_3","Vrms_4"],
    Irms: ["Irms_1","Irms_2","Irms_3","Irms_4"],
    phase_angle: ["phase_angle_1","phase_angle_2","phase_angle_3","phase_angle_4"],


}

let clusters=["binary:000F","basic:0000","lorawan:8004","configuration:0050","ON/OFF:0006","energy/power metering:800A/*4","voltage/courrant mettering:800B/*3","multienergy/powermetering:8010","multivoltage/courant:800D"]