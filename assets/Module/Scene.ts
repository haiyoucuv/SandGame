import ccclass = cc._decorator.ccclass;

@ccclass()
export default class Scene extends cc.Component {

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
		this.loadAllObject(this.node, "");
		this.initEvent();
	}

	loadAllObject(root, path) {
		for (let i = 0; i < root.childrenCount; i++) {
			this.view[path + root.children[i].name] = root.children[i];
			this.loadAllObject(root.children[i], path + root.children[i].name + "/");
		}
	}

	setLabel(viewName: string, label: string | number) {
		const view = this.view[viewName]?.getComponent?.(cc.Label);
		if (view) {
			view.string = `${label}`;
		}
	}

  /**
   * 移动端点击事件
   * @param viewName 节点name
   * @param func
   * @param caller this
   * @returns
   */
  addTouchListen(viewName: string, func: Function, caller: any){
    const viewNode = this.view[viewName];
		if (!viewNode) {
      console.warn(viewName,'节点不存在')
			return;
		}

		viewNode.on(cc.Node.EventType.TOUCH_END, func, caller);
  }

	public addButtonListen(viewName: string, func: Function, caller: any) {
		const viewNode = this.view[viewName];
		if (!viewNode) {
			return;
		}

		// const button = viewNode.getComponent(cc.Button);
		// if (!button) {
		// 	return;
		// }

		viewNode.on("click", func, caller);
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
