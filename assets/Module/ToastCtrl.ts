const {ccclass, property} = cc._decorator;

/**
 * Toast框架初版，临时用一下，暂时没时间更新
 */

export function showToast(content: any, blockEvent = false) {
	ToastCtrl.ins.show(content, blockEvent);
}

@ccclass
export default class ToastCtrl extends cc.Component {

	static ins: ToastCtrl = null;

	private mask: cc.Node = null;

	private label: cc.Label = null;

	private bg: cc.Node = null;

	tw: cc.Tween;

	onLoad() {
		ToastCtrl.ins = this;

		this.mask = this.node.getChildByName("mask");
		this.label = this.node.getChildByName("label").getComponent(cc.Label);
		this.bg = this.node.getChildByName("bg");

		this.mask.active = false;
		this.node.active = false;

		this.tw = cc.tween(this.node);
	}

	show(content: any, blockEvent = false) {
		this.mask.active = blockEvent;
		this.node.active = true;
		this.label.string = content.toString();
		this.node.opacity = 0;

		this.bg.width = 0;
		this.bg.height = 0;

		this.tw.stop()
			.to(0.25, {opacity: 255})
			.delay(1.7)
			.to(0.25, {opacity: 0})
			.call(() => this.hide())
			.start();

		// TODO 等一个有缘人优化
		this.scheduleOnce(() => {
			let {width, height} = this.label.node.getBoundingBox();
			if (width < 200) width = 200;
			if (height < 100) height = 100;
			this.bg.width = width + 100;
			this.bg.height = height + 50;
		}, 0.1);
	}

	hide() {
		this.mask.active = false;
		this.node.active = false;
		this.tw.stop();
	}
}
