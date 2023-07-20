const path = require("path");
module.exports={
    entry: {
        "bundle.js":[path.resolve(__dirname,'codec/batch.js'),
            path.resolve(__dirname,'codec/standard.js'),
            path.resolve(__dirname,'codec/watteco_decodeUplink.js'),
            path.resolve(__dirname,"captors/vaqua'O_sensor/vaqua'O_sensor.js"),
        ]
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
}