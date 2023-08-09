function strToDecimalArray(str) {
    let arr = [];
    for (let i = 0; i < str.length; i += 2) {
        arr.push(parseInt(str.substr(i, 2), 16));
    }
    return arr;
}

module.exports = {
    strToDecimalArray: strToDecimalArray

};

/*
 let argv= process.argv.slice(2);


let bytes = [];
bytes = debug.strToDecimalArray(argv[1]);

let date = argv[2];

let input = {
    bytes: bytes,
    fPort: Number(argv[0]),
    recvTime: new Date(),
};
* */