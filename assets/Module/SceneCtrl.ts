import RES from "../Scripts/Managers/RES";
import { showToast } from "./ToastCtrl";
import Scene from "./Scene";
import { hideWaiting, showWaiting } from "./WaitingCtrl";

const {ccclass, property} = cc._decorator;


/**
 * 弹窗框架初版，临时用一下，暂时没时间更新
 */

export function changeScene(cls, data = {}) {
    SceneCtrl.ins.change(cls, data);
}

export function getCurrScene() {
    return SceneCtrl.ins.curScene;
}

@ccclass
class SceneCtrl extends cc.Component {

    static ins: SceneCtrl = null;

    private prefabMap: { [ket in string]: cc.Prefab } = {};

    curScene: cc.Node = null;

    onLoad() {
        SceneCtrl.ins = this;
    }

    change(cls, data = {}) {
        const {skin, group = skin} = cls;

        const createScene = (prefab: cc.Prefab) => {
            const scene = cc.instantiate(prefab);
            // this.node.removeAllChildren();
            this.curScene?.destroy();
            // this.node.removeChild(this.curScene);
            this.node.addChild(scene);
            const ctrl: Scene = scene.getComponent(skin);
            ctrl.data = data;
            this.curScene = scene;
        }

        if (!this.prefabMap[skin]) {

            showWaiting();
            let packageSuc = true;

            const loaderPS: Promise<any>[] = [
                RES.loadRes("Scenes/" + skin),
            ];
            if (Array.isArray(group)) {
                group.forEach((item) => {
                    loaderPS.push(
                        RES.loadDir("assets/" + item)
                            .then((res) => {
                                packageSuc = res;
                            })
                    );
                });
            } else {
                loaderPS.push(
                    RES.loadDir("assets/" + group)
                        .then((res) => {
                            packageSuc = res;
                        })
                );
            }

            Promise.all(loaderPS).then(([prefab]: [cc.Prefab]) => {
                if (prefab && packageSuc) {
                    this.prefabMap[skin] = prefab;
                    hideWaiting();
                    createScene(prefab);
                } else {
                    showToast("场景资源加载失败");
                }
            });
            return;
        }
        createScene(this.prefabMap[skin]);
    }

}
