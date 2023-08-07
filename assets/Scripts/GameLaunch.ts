import EventMgr from "./Managers/EventMgr";
import { changeScene } from "../Module/SceneCtrl";
import StartScene from "./Scenes/StartScene";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GameLaunch extends cc.Component {

    onLoad() {
        // 初始化框架
        this.node.addComponent(EventMgr); // 初始化我们的事件发布
        // this.node.addComponent(SoundMgr); // 初始化我们的声音管理模块    // 要在项目设置里勾选声音模块
    }

    async start() {
        // changeScene(LoadingScene, {
        // 	onComplete: () => changeScene(NormalHomeScene),
        // 	pkg: homePkg,
        // });

        changeScene(StartScene);

    }

}
