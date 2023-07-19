namespace RES {

	export const bundles: { [key in string]: cc.AssetManager.Bundle } = {};

	export function loadBundle(name: string) {
		const url = window["__remoteAssets__"] || "";
		return new Promise((resolve, reject) => {
			cc.assetManager.loadBundle(url + name, (err, bundle) => {
				if (err !== null) {
					console.log("[RES]:Load AssetsBundle Error: " + name);
					bundles[name] = null;
					reject(err);
				} else {
					console.log("[RES]:Load AssetsBundle Success: " + name);
					bundles[name] = bundle;
					resolve(true);
				}
			});
		});
	}

	export function getRes<T extends cc.Asset>(path: string, type?: typeof cc.Asset ): T {
		// const bundle = bundles["resources"];
		// if (!bundle) {
		// 	console.warn("resources 未初始化");
		// }

		return cc.resources.get(path, type);
	}

	export function loadRes<T extends cc.Asset>(path: string, type?: typeof cc.Asset): Promise<T | null> {
		// const bundle = bundles["resources"];
		// if (!bundle) {
		// 	console.warn("resources 未初始化");
		// }

		return new Promise((resolve) => {
			cc.resources.load(path, type, (err, asset: T) => {
				if (err) {
					console.warn(`资源 ${path} 加载失败:`, err);
					resolve(null);
				} else if (!asset) {
					resolve(null);
				} else {
					resolve(asset);
				}
			});
		});
	}


	export function loadRemote<T extends cc.Asset>(url: string): Promise<T | null> {
		return new Promise(resolve => {
			cc.assetManager.loadRemote(url, (err ,asset: T) => {
				if (err || !asset) {
					console.warn(`资源 ${url} 加载失败:`, err);
					resolve(null);
				}else {
					resolve(asset)
				}
			})
		})
	}

	export async function loadRemoteImg(url: string): Promise<cc.SpriteFrame> {
		return new cc.SpriteFrame(await RES.loadRemote<cc.Texture2D>(url));
	}

	export async function loadLocalImg(url: string): Promise<cc.SpriteFrame> {
		return new Promise(resolve => {
			cc.resources.load<cc.Texture2D>(url, (err ,asset) => {
				if (err || !asset) {
					console.warn(`资源 ${url} 加载失败:`, err);
					resolve(null);
				}else {
					resolve(new cc.SpriteFrame(asset))
				}
			})
		})
	}

	export function loadDir<T extends cc.Asset>(path: string, onProgress: (finish: number, total: number) => void = () => 0): Promise<boolean> {
		// const bundle = bundles["resources"];
		// if (!bundle) {
		// 	console.warn("resources 未初始化");
		// }

		return new Promise((resolve) => {
			cc.resources.loadDir(path, onProgress, (err, assets: Array<T>) => {
				if (err) {
					console.warn(`资源 ${path} 加载失败:`, err);
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
	}
}
export default RES;
