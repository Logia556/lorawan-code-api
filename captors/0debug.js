let watteco = require("../codec/watteco_decodeUplink.js")

function strToDecimalArray(str){
    let hexArray = [];
    for (let i=0; i<str.length; i+=2) {
        hexArray.push(parseInt(str.substring(i, i+2), 16));
    }
    return hexArray;
}
let argv= process.argv.slice(2);


let bytes = [];
bytes = strToDecimalArray(argv[1]);

let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: date,
};
console.log(input)

let batch_param = [3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "4_20mA", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 12,lblname: "0_10V", divide: 1},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "BatteryVoltage", divide: 1000},
    { taglbl: 3, resol: 100, sampletype: 6,lblname: "ExternalPowerVoltage", divide: 1000},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "Index", divide: 1}]];

let endpointCorresponder={
    analog:["4_20mA","0_10V"]
}


function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);

}
let a = decodeUplink(input);
console.log(a);







