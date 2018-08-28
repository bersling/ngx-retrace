const fs = require('fs');
const sourceMap = require('source-map');
const request = require('request');
const debug = require('@google-cloud/debug-agent').start({ allowExpressions: true });

const MATCH_SOURCEMAP_PATTERN = /\((.*?)\:(\d+)\:(\d+)\)$/;

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

const serializeMappedFrames = (mappedFrames) => {
  let str = '';
  mappedFrames.map((mappedFrame, idx) => {
    const name = mappedFrames[idx+1] ? mappedFrames[idx+1].name : 'null'; // for some weird reason the mapped names are one behind...?
    str = str + `at ${name} (${mappedFrame.source}:${mappedFrame.line})\n`;
  });
  return str;
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

const retrace = async (stack) => {
  const decomposedStacktrace = decomposeStacktrace(stack);
  const decomposedFrames = getDecomposedFrames(decomposedStacktrace);
  const consumers = await setupConsumers(decomposedFrames, 'http');
  const mappedFrames = getMappedFrames(decomposedFrames, consumers);
  // print(mappedFrames);
  const mappedTrace = serializeMappedFrames(mappedFrames);
  teardown(consumers);
  return mappedTrace;
};

exports.retrace = async (req, res) => {
  await debug.isReady();
  res.set('Access-Control-Allow-Origin', "*");
  res.set('Access-Control-Allow-Headers', "Content-Type, Authorization");
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  const postData = req.body;
  try {
    const mappedTrace = await retrace(postData.stacktrace);
    res.status(200).send({
      mappedStacktrace: mappedTrace
    });
  } catch(err) {
    res.status(500).send({
      err: err
    })
  }
};

