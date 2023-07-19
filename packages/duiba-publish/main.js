const path = require("path");
const fs = require("fs");
const AutoUpload = require("./upload");
const compressAllImage = require("./minImg");
const { Uploader } = require("spark-assets");


let buildVersion = 0;

function getRemotePath() {
	return `/db_games/ccc_game/template/${buildVersion}`;
}

function getRemoteUrl() {
	return `https://yun.duiba.com.cn${getRemotePath()}/`;
}

/**
 * 开始打包
 * @param options
 * @param callback
 */
function onBuildStart(options, callback) {
	if (options.platform !== "web-mobile") return callback();

	buildVersion = Date.now();

	callback();
}

/**
 * 打包结束之前
 * @param options
 * @param callback
 */
async function onBeforeBuildFinish(options, callback) {
	if (options.platform !== "web-mobile") return callback();

	const remoteUrl = getRemoteUrl();

	Editor.success("兑吧发布插件 >> 开始修改脚本");

	// main.js 所在路径
	const mainJsPath = path.join(options.dest, "main.js");

	// 读取 main.js
	let script = fs.readFileSync(mainJsPath, "utf8");

	// 添加一点脚本
	script = `window.__remoteUrl__ = \"${remoteUrl}\";\n`
		+ `window.__remoteAssets__ = window.__remoteUrl__ + \"assets/\";\n`
		+ `window.__version__ = ${buildVersion};\n`
		+ `window.__ENV__ = "prod";\n`
		+ script;

	// 保存
	fs.writeFileSync(mainJsPath, script);

	Editor.success("兑吧发布插件 >> 修改脚本完成");

  Editor.success("兑吧发布插件 >> 开始压缩图片");

  await compressAllImage(options);

  Editor.success("兑吧发布插件 >> 压缩图片结束");

	callback();
}

/**
 * 打包完成
 * @param options
 * @param callback
 */
async function onBuildFinish(options, callback) {
	if (options.platform !== "web-mobile") return callback();

	const remoteUrl = getRemoteUrl();

	Editor.success("兑吧发布插件 >> 开始生成皮肤模版");

	const htmlPath = path.join(options.dest, "index.html");

	const indexHtml = fs.readFileSync(htmlPath, "utf8")
		.replace(/{{__remoteUrl__}}/g, remoteUrl);

	fs.writeFileSync(htmlPath, indexHtml);

	Editor.success("兑吧发布插件 >> 生成皮肤模版完成");


	Editor.success("兑吧发布插件 >> 打包完成，开始上传");

	const dir = path.join(Editor.Project.path, "build/web-mobile");

  const uploader = new Uploader();
  await uploader.uploadDir(
    dir,
    getRemotePath(),
    /.(map|DS_Store)$/
  );

	// const autoUpload = new AutoUpload({
	// 	dir: dir,
	// 	originDir: getRemotePath(),
	// });
  //
	// await autoUpload.start();

	Editor.success("兑吧发布插件 >> 上传完成");
	Editor.success("兑吧发布插件 >> 版本号:" + buildVersion);

	callback();
}

module.exports = {
	load() {
		Editor.Builder.on("build-start", onBuildStart);
		Editor.Builder.on("before-change-files", onBeforeBuildFinish);
		Editor.Builder.on("build-finished", onBuildFinish);
	},

	unload() {
		Editor.Builder.removeListener("build-start", onBuildStart);
		Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
		Editor.Builder.removeListener("build-finished", onBuildFinish);
	},

	messages: {
		"duiba-publish:test": function (event, question) {

			// const dir = path.resolve(Editor.Project.path, "build/web-mobile");
			//
			// const autoUpload = new AutoUpload({
			// 	dir: dir,
			// 	originDir: `/db_games/cocosTest/${Date.now()}/`
			// });
			//
			// autoUpload.start();


			// const tempDir = Editor.url("packages://duiba-publish/index.html");
			// let indexHtml = fs.readFileSync(tempDir, "utf8");
			// indexHtml = indexHtml.replace(/{{__remoteUrl__}}/g, "1231231");
			// fs.writeFileSync(path.join(Editor.Project.path, "build-templates/web-mobile/index1.html"), indexHtml);
		}
	}
};

