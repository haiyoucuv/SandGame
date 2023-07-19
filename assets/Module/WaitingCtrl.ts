const {ccclass, property} = cc._decorator;

/**
 * Toast框架初版，临时用一下，暂时没时间更新
 */

export function showWaiting(blockEvent = true) {
	WaitingCtrl.ins.show(blockEvent);
}


export function hideWaiting() {
	WaitingCtrl.ins.hide();
}

@ccclass
export default class WaitingCtrl extends cc.Component {

	static ins: WaitingCtrl = null;

	private mask: cc.Node = null;

	private waitingRot: cc.Node = null;

	private label: cc.Label = null;

	private bg: cc.Node = null;

	onLoad() {
		WaitingCtrl.ins = this;

		this.mask = this.node.getChildByName("mask");
		this.waitingRot = this.node.getChildByName("waitingRot");
		this.label = this.node.getChildByName("label").getComponent(cc.Label);
		this.bg = this.node.getChildByName("bg");

		this.mask.active = false;
		this.node.active = false;

		// cc.tween(this.waitingRot)
		// 	// .to(1, {angle: 0})
		// 	// .delay(0.5)
		// 	.to(1, {angle: 45})
		// 	.repeatForever()
		// 	.start();

	}

	show(blockEvent = true) {
		this.mask.active = blockEvent;
		this.node.active = true;
	}

	hide() {
		this.mask.active = false;
		this.node.active = false;
	}
}
