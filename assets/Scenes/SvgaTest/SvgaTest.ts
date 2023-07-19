import {SvgaEvent} from "../../Scripts/Component/Svga/SvgaEvent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SvgaTest extends cc.Component {

	// onLoad () {}

	start() {
		// 结束事件
		this.node.on(SvgaEvent.END_FRAME, (event) => {
			console.log("结束事件", event);
		});
	}

	// update (dt) {}
}
