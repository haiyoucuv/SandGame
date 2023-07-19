const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillMgr {
    public static _instance: SkillMgr = null;

    public static get Instance() {
        !this._instance && (this._instance = new SkillMgr());
        return this._instance;
    }

    public skillData = null;

    reset() {
        this.skillData = null;
    }

}
