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

    sandArr: [cc.Node, number][][] = [];

    onLoad() {
        super.onLoad();

        GameScene._ins = this;

        const {sandPrefab, sandArr} = this;
        for (let i = 0; i < 100; i++) {
            const sand = cc.instantiate(sandPrefab);
            SandPool.put(sand);
        }

        for (let i = 0; i < MaxCol; i++) this.sandArr.push([]);

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
                        sand[0].setPosition(col * SandWidth, downRow * SandWidth);
                    } else {
                        const left = sandArr[leftCol]?.[row];
                        const right = sandArr[rightCol]?.[row];
                        const leftDown = sandArr[leftCol]?.[downRow];
                        const rightDown = sandArr[rightCol]?.[downRow];

                        if (!left && !leftDown && col > 0) {
                            sandArr[leftCol][downRow] = sand;
                            sandArr[col][row] = null;
                            sand[0].setPosition(leftCol * SandWidth, downRow * SandWidth);
                        } else if (!right && !rightDown && col < MaxCol - 1) {
                            sandArr[rightCol][downRow] = sand;
                            sandArr[col][row] = null;
                            sand[0].setPosition(rightCol * SandWidth, downRow * SandWidth);
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
            colorHex,
        } = this.sandBlockTS;

        for (let col = ralMinCol; col <= ralMaxCol; col++) {
            for (let row = ralMinRow; row <= ralMaxRow; row++) {
                const sand = blockArr[col]?.[row];
                if (sand) {
                    sandBlock.removeChild(sand);
                    sandRoot.addChild(sand);
                    sandArr[col + blockCol][row + blockRow] = [sand, colorHex];
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

    doJudgeEliminate() {
        const {sandArr} = this;

        // 在第一列按颜色分区
        const indexArr = [];
        let judgeColor = null;
        for (let row = 0; row < MaxRow; row++) {
            const sand = sandArr[0][row];
            if (sand) {
                const [_, hexColor] = sand;
                if (hexColor !== judgeColor) {
                    indexArr.push(row);
                    judgeColor = hexColor;
                }
            } else {
                judgeColor = null;
            }
        }

        if (indexArr.length === 0) return;

        // 分区的第一个开始，优先深度优先遍历，找到相同颜色的区域，如果区域到最右边了，则表示连通了，消除

        const len = indexArr.length;
        for (let i = 0; i < len; i++) {
            const {coordArr, resArr, isCutThrough} = this.searchSame(0, indexArr[i]);
            if (isCutThrough) {
                const len = coordArr.length;
                for (let j = 0; j < len; j++) {
                    const [sand, color] = resArr[j];
                    const [col, row] = coordArr[j];
                    sand.removeFromParent();
                    sandArr[col][row] = null;
                }
            }
        }
    }

    searchSame(col, row) {

        const {sandArr} = this;

        const sand = sandArr[col][row];
        const color = sand[1];

        const tempArr = [];
        for (let i = 0; i < MaxCol; i++) tempArr.push([]);

        tempArr[col][row] = true;

        // 结果数组
        const resArr = [sand];

        // 坐标数组
        const coordArr = [[col, row]];

        // 是否连通
        let isCutThrough = false;


        for (let i = 0, total = 1; i < total; i++) {
            const [col, row] = coordArr[i];

            const leftCol = col - 1;
            const rightCol = col + 1;
            const downRow = row - 1;
            const upRow = row + 1;

            if (leftCol >= 0 && rightCol < MaxCol) {
                const left = sandArr[leftCol]?.[row];

                if (!tempArr[leftCol][row] && left?.[1] === color) {
                    resArr.push(left);
                    coordArr.push([leftCol, row]);
                    total++;
                }

                tempArr[leftCol][row] = true;
            }

            if (rightCol < MaxCol) {
                const right = sandArr[rightCol]?.[row];

                if (!tempArr[rightCol][row] && right?.[1] === color) {
                    resArr.push(right);
                    coordArr.push([rightCol, row]);
                    total++;
                    if (rightCol === MaxCol - 1) isCutThrough = true;
                }

                tempArr[rightCol][row] = true;
            }

            if (downRow >= 0 && upRow < MaxRow) {
                const down = sandArr[col]?.[downRow];

                if (!tempArr[col][downRow] && down?.[1] === color) {
                    resArr.push(down);
                    coordArr.push([col, downRow]);
                    total++;
                }

                tempArr[col][downRow] = true;
            }

            if (upRow < MaxRow) {
                const up = sandArr[col]?.[upRow];

                if (!tempArr[col][upRow] && up?.[1] === color) {
                    resArr.push(up);
                    coordArr.push([col, upRow]);
                    total++;
                }

                tempArr[col][upRow] = true;
            }

        }

        return {
            resArr,
            isCutThrough,
            coordArr,
        }
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
            this.doJudgeEliminate();
        }

    }
}
