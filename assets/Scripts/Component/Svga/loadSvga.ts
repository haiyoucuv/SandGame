import {IVideoEntity} from "./interface";

export const SvgaCache: { [key in string]: IVideoEntity } = {}

cc.assetManager.downloader.register('.svga', (path, options, onComplete) => {
	// @ts-ignore
	cc.assetManager.downloader.downloadFile(path, {responseType: 'arraybuffer'}, onComplete);
});

export function loadSvga(svga: cc.Asset | string) {
	return new Promise<IVideoEntity>((resolve) => {
		let key = "";
		if (svga instanceof cc.Asset) {
			key = svga["_uuid"];
			svga = svga["_nativeAsset"];
		} else {
			key = svga;
		}
		if (SvgaCache[key]) {
			resolve(SvgaCache[key]);
		} else {
			// @ts-ignore
			SvgaParser.loadSvga(svga, (vm: IVideoEntity) => {
				SvgaCache[key] = vm;
				resolve(vm);
			});
		}
	});
}

export const ImgCache: { [key in string]: HTMLImageElement } = {}

export function createImage(src) {
	return new Promise<HTMLImageElement>((resolve) => {
		if (ImgCache[src]) {
			resolve(ImgCache[src]);
		} else {
			const img = new Image();
			img.onload = () => {
				ImgCache[src] = img;
				resolve(img);
			}
			img.src = src;
		}
	});
}