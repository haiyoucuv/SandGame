import Panel from "../../Module/Panel";

const {ccclass, property} = cc._decorator;

@ccclass // 注意修改类名
export default class NonePanel extends Panel {

    static group = ["NonePanel"];
    static skin = "NonePanel";

    start() {
        this.addButtonListen("按钮", this.hidePanel, this);
        this.addButtonListen("关闭", this.hidePanel, this);
    }

}
