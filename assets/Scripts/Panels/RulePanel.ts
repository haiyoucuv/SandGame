import Panel from "../../Module/Panel";
import { LOG_TYPE, sendLog, sendWebNet, WebNetName } from "../Utils/WebNet/WebNet";

const {ccclass, property} = cc._decorator;

@ccclass // 注意修改类名
export default class RulePanel extends Panel {

    static skin = "RulePanel";
    static group = "RulePanel";

    async start() {
        this.addButtonListen('ruleClose', this.hidePanel, this);
        const {success, data} = await sendWebNet(WebNetName.projectRule);
        if (success) {
            const ruleNode = this.view['scrollview/view/content/ruleTxt'];
            const ruleTxt = ruleNode.getComponent(cc.RichText);
            const content = this.view['scrollview/view/content'];
            ruleTxt.string = data.replace(/<p\b.*?(?:\>|\/>)/gi,"").replace(/<\/p\>/gi,"<br/>");
            content.height = ruleNode.height;
        }

        sendLog(LOG_TYPE.EXPOSURE, 4);

        this.view["cdTxt"].active = false;

        // 首次倒计时三秒自动关闭
        if (this.data?.first) {
            this.view["cdTxt"].active = true;
            let cd = 3;
            const cdFunc = () => {
                if (cd <= 0) this.hidePanel();
                cd--;
                this.view["cdTxt"].getComponent(cc.Label).string = cd + "";
            }
            this.schedule(cdFunc, 1);

            // 滑动后只允许点击按钮关闭
            this.view['scrollview'].once("scrolling", () => {
                this.view["cdTxt"].active = false;
                this.unschedule(cdFunc);
            });
        }
    }

}
