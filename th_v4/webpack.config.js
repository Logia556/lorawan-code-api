const path = require("path");
module.exports={
    entry: {
        "bundle.js":[path.resolve(__dirname,'index.js'),
        ]
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "specification_compliant"),
    },
}