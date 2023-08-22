const path = require("path");
module.exports={
    entry: {
        "bundle.js":[path.resolve(__dirname,'codec/standard_minimized.js'),
            path.resolve(__dirname,'codec/batch_minimized.js'),
            path.resolve(__dirname,'codec/decode_uplink.js'),
            path.resolve(__dirname,"codec/captor_minimized.js"),
        ]
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
    optimization: {
        minimize: false
    },
}