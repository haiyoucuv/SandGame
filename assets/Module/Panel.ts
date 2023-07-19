import ccclass = cc._decorator.ccclass;
import PanelCtrl from "./PanelCtrl";

@ccclass()
export default class Panel extends cc.Component {

	data: any = {};

	protected view: { [key in string]: cc.Node } = {};

	onLoad() {
		this.view = {};
		this.loadAllObject(this.node, "");
	}

	onShow() {
		this.node.scale = 0;
		cc.tween(this.node)
			.to(0.188, { scale: 1 }, { easing: cc.easing.quadInOut })
			.start();
	}

	loadAllObject(root, path) {
		for (let i = 0; i < root.childrenCount; i++) {
			this.view[path + root.children[i].name] = root.children[i];
			this.loadAllObject(root.children[i], path + root.children[i].name + "/");
		}
	}


	setLabel(viewName: string, label: string) {
		const view = this.view[viewName]?.getComponent?.(cc.Label);
		if (view) {
			view.string = label;
		}
	}
	public addButtonListen(view_name: string, func: Function, caller?: any) {
		const viewNode = this.view[view_name];
		if (!viewNode) {
			return;
		}

		// const button = viewNode.getComponent(cc.Button);
		// if (!button) {
		// 	return;
		// }

		viewNode.on("click", func, caller);
	}

	hidePanel() {
		this.node.emit('close-panel');
		PanelCtrl.ins.hide();
	}

	btnDelay(node: cc.Node | string, dur = 2) {
		let _node: cc.Node = null;
		if (typeof node === 'string') _node = this.view[node];
		else _node = node;
		if (!_node) return;
		_node.getComponent(cc.Button).interactable = false;
		this.scheduleOnce(() => {
			if (_node) {
				_node.getComponent(cc.Button).interactable = true;
			}
		}, dur)
	}

}
