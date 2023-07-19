import Panel from "../../Module/Panel";
import { getWebData, LOG_TYPE, sendLog, WebNetName } from "../Utils/WebNet/WebNet";

const {ccclass, property} = cc._decorator;

@ccclass // 注意修改类名
export default class NoPrizePanel extends Panel {

    static skin = "PrizePanel";
    static group = "PrizePanel";

    start() {
        this.addButtonListen("按钮", this.goDraw, this);
        this.addButtonListen("关闭", this.hidePanel, this);

        sendLog(LOG_TYPE.EXPOSURE, 2);
    }

    hidePanel() {
        super.hidePanel();
        this.data?.callback && this.data.callback();
    }

    goDraw() {
        location.href = getWebData(WebNetName.index).data.bigTurntableUrl;
    }

}
