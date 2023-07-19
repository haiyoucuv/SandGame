const path = require("path");
const OSS = require("ali-oss");
const co = require("co");
const ProgressBar = require("progress");
const fs = require("fs");

console.log = Editor.log;
console.error = Editor.error;
console.info = Editor.info;
console.warn = Editor.warn;

module.exports = class AutoUpload {

	constructor(props, type) {
		this.type = type;

		const defaultOptions = {
			dir: undefined,
			originDir: undefined
		}

		this.options = Object.assign({}, defaultOptions, props);

		if (!this.options.dir || !this.options.originDir) {
			Editor.failed("缺少参数，初始化失败");
			return;
		}

		this.init();
	}

	init() {
		this.client = new OSS({
			region: "oss-cn-hangzhou",
			accessKeyId: "LTAI5tAEU43ff2kFkrKRLnxG",
			accessKeySecret: "2qQIPVT3Lgp72s8RShDlE4uVNqZWgy",
			bucket: "duiba",
		});

		this.bar = new ProgressBar(`文件上传中 [:bar] :current/${this.files().length} :percent :elapseds`, {
			complete: "●",
			incomplete: "○",
			width: 20,
			total: this.files().length,
			callback: () => {
				Editor.success("\n  All complete.");
				Editor.success(`\n  本次队列文件共${this.files().length}个，已存在文件${this.existFiles}个，上传文件${this.uploadFiles}个，上传失败文件${this.errorFiles}个\n`);
			}
		})
		return this;
	}

	files() {
		if (this._files) return this._files;
		this._files = [];

		/**
		 * 文件遍历方法
		 * @param filePath 需要遍历的文件路径
		 */
		const fileDisplay = (filePath) => {
			//根据文件路径读取文件，返回文件列表
			const files = fs.readdirSync(filePath);

			files.forEach((filename) => {
				//获取当前文件的绝对路径
				const fileDir = path.join(filePath, filename);
				//根据文件路径获取文件信息，返回一个fs.Stats对象
				const stats = fs.statSync(fileDir);
				const isFile = stats.isFile();//是文件
				const isDir = stats.isDirectory();//是文件夹
				if (isFile) {
					this._files.push(fileDir);
				} else if (isDir) {
					fileDisplay(fileDir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
				}
			});
		}

		//调用文件遍历方法
		fileDisplay(this.options.dir);
		return this._files;
	}

	async start() {
		const ps = this.files().map((file) => {

			const relativePath = file.replace(this.options.dir + "/", "");

			this.existFiles = 0;
			this.uploadFiles = 0;
			this.errorFiles = 0;

			const originPath = `${this.options.originDir}${relativePath}`;

			return (async () => {
				let originFile = null;

				originFile = await this.client.head(originPath)
					.catch((error) => originFile = error);

				try {
					if (originFile.status === 404) {
						await this.client.put(originPath, file);
						this.uploadFiles += 1;
					} else {
						this.existFiles += 1;
					}
				} catch (error) {
					this.errorFiles += 1;
				}
				this.bar.tick();
			})();
		});

		await Promise.all(ps).catch((err) => {
			Editor.error(err);
		});

	}
}