import * as babel  from "babel-core";
import  tryCatchWrapper from '../src/index.js'
import * as fs from 'fs'

//const fileName = process.argv[2];
const fileName = './testInput.js'

// read the code from this file
fs.readFile(fileName, (err, data) => {
    if (err) throw err;

// convert from a buffer to a string
    const src = data.toString();
    console.log(src);
// use our plugin to transform the source
    const out = babel.transform(src, {
        plugins: [
            [tryCatchWrapper, {
                filename: fileName,
                reportError: 'reportError',
                rethrow: false
            }]
        ],
    });

// print the generated code to screen
    console.log(out.code);
})