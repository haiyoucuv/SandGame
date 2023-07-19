const { ccclass, property, menu } = cc._decorator;
 
/**
 * 图片适配大小
 */
@ccclass
@menu("framework/ImgFixedSize")
export default class ImgFixedSize extends cc.Component {
 
    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    public set fixedSize(value) {
        this._fixedSize = value;
        this.onSizeChanged();
    }
 
    public get fixedSize() {
        return this._fixedSize;
    }
 
    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    private _fixedSize: number = 1;
 
    onLoad() {
        this._fixedSize = this.fixedSize;
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        this.onSizeChanged();
    }
 
    /**当尺寸变化时，重置node节点大小 */
    onSizeChanged() {
        var width = this.node.width;
        var height = this.node.height;
        var max = Math.max(width, height);
        this.node.scale = this.fixedSize / max;
    }
}