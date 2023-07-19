const chokidar = require("chokidar");
const path = require("path");

function _debounce(fn, delay = 1000) {
  let timer = null;
  return function (...args) {
    timer && clearTimeout(timer);
    timer = setTimeout(fn, delay, ...args);
  };
}

let watcher = null;

const autoRefreshType = [
  "ts",
  "js",
];

const requestCocosRefreshApi = _debounce(async (filePath) => {
  const type = filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length);
  if (autoRefreshType.indexOf(type) > -1) {
    // Editor.Ipc.sendToPanel('scene', 'scene:stash-and-save');
    Editor.assetdb.refresh("db://assets" + filePath.split("assets")[1], function (err, results) {
      console.log(err, results);
    });
  }
});

module.exports = {
  load() {
    watcher = chokidar.watch(path.join(Editor.Project.path, './assets'), {
      ignored: "*.meta",
      persistent: true,
      // awaitWriteFinish: true,
    }).on('change', requestCocosRefreshApi)
      .on('add', requestCocosRefreshApi);
  },

  async unload() {
    await watcher.close();
  },

  messages: {
    "auto-refresh:test": (event, question) => {
      Editor.Ipc.sendToPanel('scene', 'scene:stash-and-save');
    }
  }
};