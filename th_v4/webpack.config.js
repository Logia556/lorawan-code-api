const path = require("path");

module.exports={
    target: "node",
    mode: "production",
    entry: {
        "bundle":[path.resolve(__dirname,'../codec/standard_minimized.js'),
            path.resolve(__dirname,'../codec/batch_minimized.js'),
            path.resolve(__dirname,'../codec/decode_minimized.js'),
            path.resolve(__dirname,"../codec/captor_minimized.js"),
        ]
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "."),
        library:{ name:"driver", type:"umd"}



    },
    optimization: {
            minimize: false,

    },
}