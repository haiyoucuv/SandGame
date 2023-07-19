import ccclass = cc._decorator.ccclass;

@ccclass()
export default class Module extends cc.Component {

	data: any = {};

	protected view: { [key in string]: cc.Node } = {};

	initEvent() {

	}

	removeEvent() {

	}

	onDestroy() {
		this.removeEvent();
	}

	onLoad() {
		this.view = {};
		this.load_all_object(this.node, "");
		this.initEvent();
	}

	load_all_object(root, path) {
		for (let i = 0; i < root.childrenCount; i++) {
			this.view[path + root.children[i].name] = root.children[i];
			this.load_all_object(root.children[i], path + root.children[i].name + "/");
		}
	}

	public add_button_listen(view_name, caller, func) {
		const view_node = this.view[view_name];
		if (!view_node) {
			return;
		}

		const button = view_node.getComponent(cc.Button);
		if (!button) {
			return;
		}

		view_node.on("click", func, caller);
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