fs = require('fs');
const sourceMap = require('source-map');
const request = require('request');

const MATCH_SOURCEMAP_PATTERN = /\((.*?)\:(\d+)\:(\d+)\)$/;

const stack = "Error: i am error\n    at e.doError2 (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:125997)\n    at Object.handleEvent (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:276172)\n    at Object.handleEvent (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:97196)\n    at Object.handleEvent (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:118943)\n    at Br (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:70109)\n    at http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:75323\n    at HTMLButtonElement.<anonymous> (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:161189)\n    at e.invokeTask (http://dev5.demo.taskbase.com/polyfills.a9c1408b8b24d052720b.js:1:7960)\n    at Object.onInvokeTask (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:31320)\n    at e.invokeTask (http://dev5.demo.taskbase.com/polyfills.a9c1408b8b24d052720b.js:1:7881)";

const decomposeStacktrace = (stacktrace) => {
    const [message, ...trace] = stacktrace.split('\n');
    return {
        message: message,
        trace: trace
    };
};

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
};

const teardown = (consumers) => {
    Object.keys(consumers).forEach(key => {
        const consumer = consumers[key];
        consumer.destroy();
    });
};

const print = (mappedFrames) => {
  mappedFrames.map((mappedFrame, idx) => {
    const name = mappedFrames[idx+1] ? mappedFrames[idx+1].name : 'null'; // for some weird reason the mapped names are one behind...?
    console.log(`at ${name} (${mappedFrame.source}:${mappedFrame.line})`)
  });
};

const getDecomposedFrames = (decomposedStacktrace) => {
  return decomposedStacktrace.trace.map(frame => decomposeFrame(frame)).filter(f => f != null);
};

const getMappedFrames = (decomposedFrames, consumers) => {
  return decomposedFrames.map(frame => {
    return consumers[frame.file].originalPositionFor({
      line: parseInt(frame.line),
      column: parseInt(frame.column)
    });
  });
};

const fetchFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    })
  });
};

const setupConsumers = async (decomposedFrames, method) => {
  const consumers = {};
  for (const frame of decomposedFrames) {
    if (consumers[frame.file] == null) {
      let file;
      if (method === 'http') {
        const url = `${frame.location}.map`;
        file = await fetchFromUrl(url);
      } else {
        file = fs.readFileSync(`${frame.file}.map`, 'utf8');
      }
      consumers[frame.file] = await new sourceMap.SourceMapConsumer(file);
    }
  }
  return consumers;
};

const start = async () => {
  const decomposedStacktrace = decomposeStacktrace(stack);
  const decomposedFrames = getDecomposedFrames(decomposedStacktrace);
  const consumers = await setupConsumers(decomposedFrames, 'http');
  const mappedFrames = getMappedFrames(decomposedFrames, consumers);
  print(mappedFrames);
  teardown(consumers);
};

start();
