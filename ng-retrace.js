fs = require('fs');
const sourceMap = require('source-map');

const MATCH_SOURCEMAP_PATTERN = /\((.*?)\:(\d+)\:(\d+)\)$/;

const stack = "Error: hi i am error\n    at new <anonymous> (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:133740)\n    at qo (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:89214)\n    at Uo (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:88292)\n    at vi (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:97689)\n    at di (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:96478)\n    at Object.Di [as createRootView] (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:105654)\n    at t.create (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:78819)\n    at t.create (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:31343)\n    at e.bootstrap (http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:44177)\n    at http://localhost:3474/main.c8ae2bdbfe34f0785383.js:1:40812";


const decomposeStacktrace = (stacktrace) => {
    const [message, ...trace] = stacktrace.split('\n');
    return {
        message: message,
        trace: trace
    };
}

const decomposeFrame = (frame) => {
    const re = new RegExp(MATCH_SOURCEMAP_PATTERN);
    const res = re.exec(frame);
    if (res) {
        return {
            location: res[1],
            file: res[1].split('/')[3],
            line: res[2],
            column: res[3]
        };
    } else {
        return null;
    }
}

const doStuff = async () => {
    const decomposedStacktrace = decomposeStacktrace(stack);
    const decomposedFrames = decomposedStacktrace.trace.map(frame => decomposeFrame(frame)).filter(f => f != null);
    const consumers = {}
    for (const frame of decomposedFrames) {
        if (consumers[frame.file] == null) {
            const file = fs.readFileSync(`${frame.file}.map`, 'utf8');
            consumers[frame.file] = await new sourceMap.SourceMapConsumer(file); // todo: try catch?
        }
    }
    mappedFrames = decomposedFrames.map(frame => {
        return consumers[frame.file].originalPositionFor({
            line: parseInt(frame.line),
            column: parseInt(frame.column)
        });
    });
    mappedFrames.map(mappedFrame => {
        console.log(`at ${mappedFrame.name} (${mappedFrame.source}:${mappedFrame.line})`)
    });
}
doStuff();

