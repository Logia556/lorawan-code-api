const path = require("path");
module.exports={
    entry: {
        "bundle.js":[path.resolve(__dirname,'codec/batch.js'),
            path.resolve(__dirname,'codec/standard.js'),
            path.resolve(__dirname,'codec/watteco_decodeUplink.js'),
            path.resolve(__dirname,'captors/0debug.js'),
        ]
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
}