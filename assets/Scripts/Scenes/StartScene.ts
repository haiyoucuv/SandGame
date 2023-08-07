import Scene from "../../Module/Scene";
import { changeScene } from "../../Module/SceneCtrl";
import GameScene from "./GameScene/GameScene";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StartScene extends Scene {

    static group: string[] = ["StartScene"];
    static skin: string = "StartScene";

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.addButtonListen("startBtn", this.clickStart, this);
    }

    clickStart() {
        changeScene(GameScene);
    }

    // update (dt) {}
}
