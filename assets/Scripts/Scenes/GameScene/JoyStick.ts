// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class JoyStick extends cc.Component {

    @property(cc.Node)
    outer: cc.Node = null;

    @property(cc.Node)
    inner: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    private _dir: cc.Vec2 = cc.v2();
    get dir() {
        return this._dir;
    }

    // onLoad () {}

    start() {

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEC, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEC, this);

    }

    // update (dt) {}

    setDirection(pos: cc.Vec2) {
        const dir = pos.normalize();

        let dis = pos.len();

        if (dis < 20) {
            dir.set(cc.Vec2.ZERO);
        } else if (dis > 100) {
            dis = 100;
        }

        this.inner.setPosition(dir.mulSelf(dis));

        this._dir.set(dir);

    }

    onTouchStart(touch: cc.Touch) {
        const localPos = this.node.convertToNodeSpaceAR(touch.getLocation());
        this.setDirection(localPos);
    }

    onTouchMove(touch: cc.Touch) {
        const localPos = this.node.convertToNodeSpaceAR(touch.getLocation());
        this.setDirection(localPos);
    }

    onTouchEC(touch: cc.Touch) {
        this.setDirection(cc.Vec2.ZERO);
    }
}
