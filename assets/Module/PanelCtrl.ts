import RES from "../Scripts/Managers/RES";
import { showToast } from "./ToastCtrl";
import Panel from "./Panel";
import { hideWaiting, showWaiting } from "./WaitingCtrl";

const { ccclass, property } = cc._decorator;


/**
 * 弹窗框架初版，临时用一下，暂时没时间更新
 */

export function showPanel(cls, data = {}, showMask = true) {
	PanelCtrl.ins.show(cls, data, showMask);
}

export function asyncShowPanel(cls, data = {}, showMask = true) {

	return new Promise(async r => {
		const panel = await PanelCtrl.ins.show(cls, data, showMask);

		panel.node.on('close-panel', r)
	})
}

interface PanelInfo {
	cls: any, data: any, node: cc.Node, showMask: boolean
}


@ccclass
export default class PanelCtrl extends cc.Component {

	static ins: PanelCtrl = null;

	private prefabMap: { [ket in string]: cc.Prefab } = {};
	mask: cc.Node;


	private panelStack: PanelInfo[] = [];

	curPanel: PanelInfo = null;

	onLoad() {
		PanelCtrl.ins = this;
		this.mask = this.node.getChildByName("mask");
	}


	async show(cls, data = {}, showMask = true) {
		const { skin, group = skin } = cls;

		const createPanel = (prefab: cc.Prefab) => {

			// 当前弹窗处理
			if (this.curPanel) {
				this.curPanel.node.active = false;
				this.panelStack.push(this.curPanel)

			}

			if (showMask) {
				this.mask.opacity = 170;
			} else {
				this.mask.opacity = 0;
			}
			this.mask.active = true;
			const panel = cc.instantiate(prefab);
			this.node.addChild(panel);
			const ctrl: Panel = panel.getComponent(skin);
			ctrl.data = data;
			ctrl.onShow();
			this.curPanel = {
				cls, data, showMask, node: panel
			};

			return ctrl;

		}

		if (!this.prefabMap[skin]) {
			showWaiting();

            let packageSuc = true;

            const loaderPS: Promise<any>[] = [
                RES.loadRes("Panels/" + skin),
            ];
            if (Array.isArray(group)) {
                group.forEach((item) => {
                    loaderPS.push(
                        RES.loadDir("assets/" + item)
                            .then((res) => {
                                packageSuc = res;
                            })
                    );
                });
            } else {
                loaderPS.push(
                    RES.loadDir("assets/" + group)
                        .then((res) => {
                            packageSuc = res;
                        })
                );
            }

			return await Promise.all(loaderPS).then(([prefab]: [cc.Prefab]) => {
				if (prefab && packageSuc) {
					this.prefabMap[skin] = prefab;
					hideWaiting();
					return createPanel(prefab);
				} else {
					showToast("弹窗资源加载失败");
				}
			});

		}

		return createPanel(this.prefabMap[skin]);

	}

	hide() {
		if (!this.curPanel) return;
		const { node: currPanelNode } = this.curPanel;

		currPanelNode.destroy();
		this.node.removeChild(currPanelNode);

		this.mask.active = false;
		this.curPanel = null;

		this.curPanel = this.panelStack.pop();
		if (!!this.curPanel) {
			const { node, showMask } = this.curPanel;

			node.active = true;
			if (showMask) {
				this.mask.active = true;
				this.mask.opacity = 170;
			}
		}


	}

	hideAllPanel() {
		this.hide();
		for (let i = 0; i < this.panelStack.length; i++) {
			this.panelStack[i].node.destroy();
			this.node.removeChild(this.panelStack[i].node);
		}
		this.panelStack = [];
		this.mask.active = false;
		this.curPanel = null;
	}
}
