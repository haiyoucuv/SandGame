import {IVideoEntity} from "./interface";
import {SvgaTrack} from "./SvgaTrack";
import executeInEditMode = cc._decorator.executeInEditMode;
import playOnFocus = cc._decorator.playOnFocus;
import {SvgaEvent} from "./SvgaEvent";
import {createImage, loadSvga} from "./loadSvga";
import menu = cc._decorator.menu;
import disallowMultiple = cc._decorator.disallowMultiple;

const {ccclass, property} = cc._decorator;

@ccclass
@executeInEditMode
@disallowMultiple
@playOnFocus
@menu('自定义组件/Svga')
export default class Svga extends cc.Component {

	/************************ on Editor ************************/
	private edit_update: boolean = false;

	protected onFocusInEditor() {
		this.edit_update = true;
		this.play(0);
	}

	protected onLostFocusInEditor() {
		this.edit_update = false;
	}

	protected async resetInEditor() {
		await this._load();
		this.edit_update = true;
		this.play(0);
	}

	protected onEnable() {
		this.play(0);
	}

	/************************ on Editor ************************/

	/************************  ************************/

	private aniNode: cc.Node = null;

	@property(cc.Asset)
	private _svga: cc.Asset = null;

	@property(cc.Asset)
	get svga() {
		return this._svga;
	}

	set svga(svga) {
		if (svga !== this._svga) {
			this._svga = svga;
			this._load().then(() => {
				this.play(0);
			});
		}
	}

	private tracks: SvgaTrack[] = [];

	isPlaying: boolean = false;

	vmData: IVideoEntity = null;

	async onLoad() {

		this.aniNode = this.node.getChildByName("aniNode");
		if (!this.aniNode) {
			this.aniNode = new cc.Node("aniNode");
			// this.aniNode.setAnchorPoint(0, 1);
			this.aniNode.scaleY = -1;
			this.node.addChild(this.aniNode);
		}

		await this._load();

		(this.autoPlay || CC_EDITOR) && this.play(0);
	}

	start() {
		// const url = "https://yun.duiba.com.cn/spark/assets/yuyu.6473bb2ef640b556f35096428847216e72499d90.svga";
		// const url = "//yun.duiba.com.cn/polaris/step1-1.f073ab1f1c085c6579cbb6b8a9fc61ee80145beb.svga";
		// const url = "//yun.duiba.com.cn/polaris/ani-coin2.de33d071c7e5138c862812099d818f108c7e88f7.svga";
	}

	play(frame = 0) {
		this.curFrame = frame;
		this.isPlaying = true;
	}

	stop(isReset: boolean = false) {
		if (isReset) this.curFrame = 0;
		this.isPlaying = false;
	}


	// 初始化就播放
	@property({tooltip: "是否自动播放"})
	private autoPlay: boolean = true;


	// 是否循环
	@property
	private _loop: boolean = false;

	@property({tooltip: "是否循环"})
	get loop() {
		return this._loop;
	}

	set loop(loop) {
		this._loop = loop;
		CC_EDITOR && this.play();
	}

	// 总时间，秒计
	get totalTime(): number {
		return this._totalFrames * (1 / this.fps) || 0;
	};

	// 总帧数
	private _totalFrames: number = 0;
	get totalFrames() {
		return this._totalFrames;
	}

	// 帧时间
	private _frameTime = 0;

	// fps 没设置就会用vmData里的帧率
	@property
	private _fps: number = 0;

	@property
	get fps() {
		return this._fps || this.vmData?.FPS || 0;
	}

	set fps(fps) {
		this._fps = fps;
		this._frameTime = 1 / fps;
	}


	// 当前时间
	private _curTime = 0;

	get curTime() {
		return this._curTime;
	}

	set curTime(time) {
		this._curTime = time;
		this._curFrame = time * this.fps;
	}


	// 当前帧
	private _curFrame = 0;

	get curFrame() {
		return this._curFrame;
	}

	set curFrame(frame) {
		this._curFrame = frame;
		this._curTime = frame / this.fps;
	}


	update(dt) {
		if (
			(CC_EDITOR && !this.edit_update)
			|| !this.isPlaying
		) return;

		this.curTime += dt;

		if (this._curFrame > this.totalFrames) {
			this.node.emit(SvgaEvent.END_FRAME);    // 触发结束事件
			if (this.loop) {
				this.curTime = (this._curFrame - this.totalFrames) * this._frameTime;
			} else {
				this.stop(true);
			}
		}

		this.tracks.forEach((v) => {
			v.setValue(this._curFrame);
		});
	}

	protected onDestroy() {
		for (let i = 0; i < this.tracks.length; i++) {
			this.tracks[i].destroy();
		}
		this.tracks = [];
	}

	async _load() {
		if (!this.svga) return;

		this.aniNode.removeAllChildren(true);
		return new Promise<void>(async (resolve, reject) => {

			const vm = await loadSvga(this.svga);

			vm.textures = {};
			this.vmData = vm;

			const {FPS, videoSize, images, sprites, textures, frames,} = vm;
			if (!this.fps) this.fps = FPS;
			this._totalFrames = frames;
			this.node.setContentSize(videoSize.width, videoSize.height);
			// this.aniNode.setContentSize(videoSize.width, videoSize.height);
			this.aniNode.setPosition(-videoSize.width / 2, videoSize.height / 2);

			const ps = [];

			for (let key in images) {
				let src = images[key];
				if (
					src.indexOf("iVBO") === 0
					|| src.indexOf("/9j/2w") === 0
				) {
					src = 'data:image/png;base64,' + src;
				}

				ps.push(new Promise<void>(async (r) => {

					const img = await createImage(src);
					const texture = new cc.Texture2D();
					texture.initWithElement(img);
					textures[key] = new cc.SpriteFrame(texture);
					r();

					// 编辑器里用不了
					// cc.assetManager.loadRemote<cc.Texture2D>(
					// 	base64, {ext: ".png"},
					// 	(err, texture) => {
					// 		textures[key] = new cc.SpriteFrame(texture);
					// 		r();
					// 	}
					// );
				}));

			}

			await Promise.all(ps);

			for (let i = 0; i < sprites.length; i++) {
				const {imageKey, frames} = sprites[i];

				if (!imageKey) return;

				const node = new cc.Node(imageKey);
				node.setAnchorPoint(0, 1);

				this.aniNode.addChild(node);

				const sp = node.addComponent(cc.Sprite);
				sp.spriteFrame = textures[imageKey];

				const track = new SvgaTrack(node, frames);
				track.resetValue();
				this.tracks.push(track);
			}

			resolve();

		});

	}

}

