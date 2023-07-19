import Scene from "../../../Module/Scene";
import { ColorArr, GameCfg, SandPool } from "../../Game/config/GameCfg";
import SandBlock from "./SandBlock";

const {ccclass, property} = cc._decorator;

const {MaxCol, MaxRow, SandWidth, BlockDropSpeed, SimulateDT} = GameCfg;
@ccclass
export default class GameScene extends Scene {

    static group: string[] = ["GameScene"];
    static skin: string = "GameScene";

    private static _ins: GameScene = null;

    static get ins(): GameScene {
        return this._ins;
    }

    @property(cc.Prefab)
    sandPrefab: cc.Prefab = null;

    @property(cc.Node)
    sandBlock: cc.Node = null;

    @property(SandBlock)
    sandBlockTS: SandBlock = null;

    @property(cc.Node)
    sandRoot: cc.Node = null;

    sandArr: cc.Node[][] = [];

    onLoad() {
        super.onLoad();

        GameScene._ins = this;

        const {sandPrefab, sandArr} = this;
        for (let i = 0; i < 100; i++) {
            const sand = cc.instantiate(sandPrefab);
            SandPool.put(sand);
        }

        for (let i = 0; i < MaxCol; i++) {
            sandArr.push([]);
        }

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEC, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEC, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    moveDir: number = 0;

    movieSandBlock() {
        this.sandBlockTS.col += this.moveDir;
    }

    onTouchStart(touch: cc.Event.EventTouch) {
        this.schedule(this.movieSandBlock, 0.016);
    }

    onTouchMove(touch: cc.Event.EventTouch) {
        const {x: startX} = touch.getStartLocation();
        const x = touch.getLocationX();

        if (x < startX) {
            this.moveDir = -1;
        } else {
            this.moveDir = 1;
        }
    }

    onTouchEC(touch: cc.Event.EventTouch) {
        const startPos = touch.getStartLocation();
        const pos = touch.getLocation();

        if (startPos.subtract(pos).len() < 10) {
            this.rotateSandBlock();
        }

        this.unschedule(this.movieSandBlock);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {

        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.sandBlockTS.col -= 4;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.sandBlockTS.col += 4;
                break;
            case cc.macro.KEY.space:
                this.sandBlockTS.rotate();
                break;
        }
    }

    protected start() {
        this.resetSandBlock();
    }

    resetSandBlock() {
        const color = ColorArr[Math.random() * ColorArr.length >> 0];
        this.sandBlockTS.random(color);
        this.sandBlockTS.row = 141;
        this.sandBlockTS.col = 30;
    }


    rotateSandBlock() {
        this.sandBlockTS.rotate();
    }

    doSimulate() {
        const {sandArr} = this;
        for (let col = 0; col < MaxCol; col++) {
            for (let row = 0; row < MaxRow; row++) {

                if (row <= 0) continue;

                const sand = sandArr[col][row];

                if (sand) {

                    const downRow = row - 1;
                    // const upRow = row + 1;
                    const leftCol = col - 1;
                    const rightCol = col + 1;

                    const down = sandArr[col][downRow];
                    // const top = sandArr[col][upRow];
                    // const leftUp = sandArr[leftCol]?.[upRow];
                    // const rightUp = sandArr[rightCol]?.[upRow];

                    if (!down) {
                        sandArr[col][downRow] = sand;
                        sandArr[col][row] = null;
                        sand.setPosition(col * SandWidth, downRow * SandWidth);
                    } else {
                        const left = sandArr[leftCol]?.[row];
                        const right = sandArr[rightCol]?.[row];
                        const leftDown = sandArr[leftCol]?.[downRow];
                        const rightDown = sandArr[rightCol]?.[downRow];

                        if (!left && !leftDown && col > 0) {
                            sandArr[leftCol][downRow] = sand;
                            sandArr[col][row] = null;
                            sand.setPosition(leftCol * SandWidth, downRow * SandWidth);
                        } else if (!right && !rightDown && col < MaxCol - 1) {
                            sandArr[rightCol][downRow] = sand;
                            sandArr[col][row] = null;
                            sand.setPosition(rightCol * SandWidth, downRow * SandWidth);
                        }
                    }

                }
            }
        }
    }


    judgeSandBlock() {

        const {sandArr} = this;

        const {
            sandArr: blockArr,
            col: blockCol,
            row: blockRow,
            ralMinCol,
            ralMaxCol,
            ralMinRow,
            ralMaxRow,
        } = this.sandBlockTS;

        if (blockRow <= -ralMinRow) {
            this.copyBlockToArr();
            this.resetSandBlock();
            return;
        }

        for (let col = ralMinCol; col <= ralMaxCol; col++) {
            for (let row = ralMinRow; row <= ralMaxRow; row++) {
                const sand = blockArr[col]?.[row];
                const hasSand = sandArr[col + blockCol]?.[row - 1 + blockRow];
                if (sand && hasSand) {
                    this.copyBlockToArr();
                    this.resetSandBlock();
                    return;
                }
            }
        }
    }

    copyBlockToArr() {
        const {sandArr, sandRoot, sandBlock} = this;

        const {
            sandArr: blockArr,
            col: blockCol,
            row: blockRow,
            ralMinCol,
            ralMaxCol,
            ralMinRow,
            ralMaxRow,
        } = this.sandBlockTS;

        for (let col = ralMinCol; col <= ralMaxCol; col++) {
            for (let row = ralMinRow; row <= ralMaxRow; row++) {
                const sand = blockArr[col]?.[row];
                if (sand) {
                    sandBlock.removeChild(sand);
                    sandRoot.addChild(sand);
                    sandArr[col + blockCol][row + blockRow] = sand;
                    sand.setPosition((col + blockCol) * SandWidth, (row + blockRow) * SandWidth);
                    blockArr[col][row] = null;
                }
            }
        }
    }


    gameSpeed = 1;

    blockDrop(radioDT) {
        this.sandBlockTS.row -= 1;
    }

    simulateTotal = 0;

    update(dt) {
        const radioDT = dt * this.gameSpeed;

        this.blockDrop(radioDT);

        this.judgeSandBlock();

        this.simulateTotal += radioDT;

        if (this.simulateTotal >= SimulateDT) {
            this.simulateTotal -= SimulateDT;
            this.doSimulate();
        }

    }
}
