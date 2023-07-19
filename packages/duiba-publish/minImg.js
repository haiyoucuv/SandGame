const fs = require("fs");
const Os = require('os');
const path = require('path');
const { exec } = require('child_process');


/** 压缩引擎路径表 */
const enginePathMap = {
  /** macOS */
  'darwin': 'pngquant/macos/pngquant',
  /** Windows */
  'win32': 'pngquant/windows/pngquant'
}

/**
 * 压缩
 * @param {string[]} pathArr 文件数组
 * @param {object} options 压缩参数
 */
async function compress(pathArr, options) {
  const pngquantPath = this.pngquantPath;
  const tasks = [];

  pathArr.forEach((filePath, i) => {
    if (!filePath) {
      Editor.error(i);
      Editor.error(filePath);
      return;
    }
    // 加入压缩队列
    tasks.push(new Promise((resolve) => {
      try {
        const sizeBefore = fs.statSync(filePath).size,
          command = `"${pngquantPath}" ${options} -- "${filePath}"`;
        // pngquant $OPTIONS -- "$FILE"
        exec(command, (error, stdout, stderr) => {
          const sizeAfter = fs.statSync(filePath).size
          if (!error) {
            const radio = ((1 - sizeAfter / sizeBefore) * 100).toFixed(2);
            // Editor.success(`压缩图片成功: ${filePath}, 压缩率：${radio}`);
          }
          resolve();
        });
      } catch (e) {
        Editor.error(e);
        resolve();
      }
    }));
  });

  await Promise.all(tasks);
}

module.exports = async function compressAllImage(options) {
  const images = [];
  options.bundles.forEach((bundle) => {
    const buildResults = bundle.buildResults;
    // get all textures in build
    if (!buildResults) return;
    const assets = buildResults.getAssetUuids();
    const textureType = cc.js._getClassId(cc.Texture2D);
    for (let i = 0; i < assets.length; ++i) {
      const asset = assets[i];
      if (buildResults.getAssetType(asset) === textureType) {
        images.push(buildResults.getNativeAssetPath(asset));
      }
    }
  });

  const platform = Os.platform(),
    pngquantPath = this.pngquantPath = path.join(__dirname, enginePathMap[platform]);
  // 设置引擎文件的执行权限（仅 macOS）
  if (pngquantPath && platform === 'darwin') {
    if (fs.statSync(pngquantPath).mode != 33261) {
      // 默认为 33188
      fs.chmodSync(pngquantPath, 33261);
    }
  }

  const qualityParam = `--quality 0-99`,
    speedParam = `--speed 3`,
    skipParam = '--skip-if-larger',
    outputParam = '--ext=.png',
    writeParam = '--force',
    // colorsParam = config.colors,
    // compressOptions = `${qualityParam} ${speedParam} ${skipParam} ${outputParam} ${writeParam} ${colorsParam}`;
    compressOptions = `${qualityParam} ${speedParam} ${skipParam} ${outputParam} ${writeParam}`;

  await compress(images, compressOptions);


}