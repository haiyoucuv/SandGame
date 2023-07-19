import menu = cc._decorator.menu;

const {ccclass, property} = cc._decorator;

// TODO 把编辑器里的实现一下

@ccclass
@menu('自定义组件/位图字')
export default class BitText extends cc.Component {

	private atlas: cc.Node;
	private _w: number;

	get w() {
		return this._w
	}

	set w(value) {
		this._w = value;
	}


	@property
	private _gap: number = 0;

	@property
	get gap() {
		return this._gap;
	};

	set gap(gap: number) {
		this._gap = gap;
		this.permutation();
	};


	@property
	private _text: string = "";

	@property
	get text() {
		return this._text;
	};

	set text(text: string) {
		this._text = text;
		this.node.destroyAllChildren();
		this.node.removeAllChildren()
		text.split("").forEach((v) => {
			const code = this.atlas.getChildByName(v)
			if (!code) return console.warn(`没配置 ${v} 这个字符`);
			const txt = cc.instantiate(code);
			txt.anchorX = 0;
			this.node.addChild(txt);
		});
		this.permutation();
	};

	@property(cc.Prefab)
	texture: cc.Prefab = null;

	onLoad() {
		this.atlas = cc.instantiate(this.texture);
	}

	start() {
	}

	permutation() {
		const {gap} = this;
		let w = 0;
		this.node.children.forEach((v) => {
			v.anchorX = 0;
			v.x = w;
			w += v.width + gap;
		});
		this.w = w;
		const halfW = w / 2;
		this.node.children.forEach((v) => v.x -= halfW);

	}

	// update(dt) {
	//
	// }
}
