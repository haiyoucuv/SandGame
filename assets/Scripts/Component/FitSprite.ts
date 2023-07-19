import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import menu = cc._decorator.menu;

export enum FitSpriteType {
    Horizontal,
    Vertical,
}

@ccclass
@menu('渲染组件/FitSprite')
export default class FitSprite extends cc.Component {

    @property({
        type: cc.Enum(FitSpriteType),
        tooltip: '类型'
    })
    private _fitSpriteType = FitSpriteType.Vertical;

    @property("最大宽度")
    maxWidth: number = 0;

    @property("最大高度")
    maxHeight: number = 0;

    set fitSpriteType(type: FitSpriteType) {
        this._fitSpriteType = type;
        this.updateSpriteSize();
    }

    @property({
        type: cc.Enum(FitSpriteType),
        tooltip: '类型'
    })
    get fitSpriteType() {
        return this._fitSpriteType;
    }


    onLoad() {
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this.updateSpriteSize, this);
        // this.updateSpriteSize();
    }

    setTexture(sf: cc.SpriteFrame) {
        this.node.getComponent(cc.Sprite).spriteFrame = sf;
        this.updateSpriteSize();
    }

    /**当尺寸变化时，重置node节点大小 */
    updateSpriteSize() {

        const sprite = this.node.getComponent(cc.Sprite), spriteFrame = sprite.spriteFrame, texture = spriteFrame.getTexture();

        if (this.fitSpriteType === FitSpriteType.Horizontal) {
            this.node.height = texture.height / texture.width * this.maxWidth;
            this.node.width = this.maxWidth;
        }else {
            this.node.width = texture.width / texture.height * this.maxHeight;
            this.node.height = this.maxHeight;
        }

    }
}
