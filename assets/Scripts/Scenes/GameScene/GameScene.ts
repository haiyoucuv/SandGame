import Scene from "../../../Module/Scene";
import { ColorArr, GameCfg, SandPool } from "../../Game/config/GameCfg";
import SandBlock from "./SandBlock";
import { wait } from "../../Utils/Utils";

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

    pause: boolean = false;
    pauseDelArr = [];

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

        this.addButtonListen("暂停", this.doPause, this);
    }

    doPause = () => {
        this.pause = !this.pause;
        // for (let i = this.pauseDelArr.length - 1; i >= 0; i--) {
        //     if (!this.pauseDelArr[i][0].parent) this.debugSand(this.pauseDelArr[i][0].x, this.pauseDelArr[i][0].y);
        //     this.pauseDelArr[i][0].removeFromParent();
        // }
        // this.pauseDelArr.length = 0;
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
            this.sandBlockTS.rotate();
        }

        this.unschedule(this.movieSandBlock);
    }

    protected start() {
        this.resetSandBlock();
    }

    /**
     * 初始化一个沙堆
     */
    resetSandBlock() {
        const color = ColorArr[Math.random() * ColorArr.length >> 0];
        // if (Math.random() < 0.6) {
        //     this.sandBlockTS.random(ColorArr[0]);
        // } else {
        this.sandBlockTS.random(color);
        // }
        this.sandBlockTS.row = 141;
        this.sandBlockTS.col = 30;
    }

    /**
     * 模拟沙子
     */
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


    /**
     * 判断是否可以放到主沙堆中
     */
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
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 将沙块放到主沙堆中
     */
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


    blockDrop(radioDT) {
        this.sandBlockTS.row -= 1;
    }

    /**
     * 判断并消除左右连通的方块
     */
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

        // 分区的第一个开始，找到相同颜色的区域，如果区域到最右边了，则表示连通了，切执行消除

        let eliminateArr: [[cc.Node, number], number, number, cc.Color][] = [];

        const len = indexArr.length;
        for (let i = 0; i < len; i++) {
            const {resArr, isCutThrough} = this.searchSame(0, indexArr[i]);
            if (isCutThrough) {
                eliminateArr = eliminateArr.concat(resArr);
            }
        }

        this.doEliminate(eliminateArr);
    }

    /**
     * 查找同颜色的区域
     * @param col
     * @param row
     * @return {resArr: [], isCutThrough: boolean}
     */
    searchSame(col, row): { resArr: [[cc.Node, number], number, number, cc.Color][], isCutThrough: boolean } {

        const {sandArr} = this;

        const sand = sandArr[col][row];

        // 如果不存在，说明已经被消除了，直接return效率最高
        if (!sand) return {resArr: [], isCutThrough: false}

        const hex = sand[1];

        const tempArr = [];
        for (let i = 0; i < MaxCol; i++) tempArr.push([]);

        tempArr[col][row] = true;

        // 结果数组
        const resArr: [
            [cc.Node, number],
            number,
            number,
            cc.Color,
        ][] = [
            [sand, col, row, sand[0].color],
        ];

        // 是否连通
        let isCutThrough = false;


        for (let i = 0, total = 1; i < total; i++) {
            const [_, col, row] = resArr[i];

            if (col === MaxCol - 1) isCutThrough = true;

            const leftCol = col - 1;
            const rightCol = col + 1;
            const downRow = row - 1;
            const upRow = row + 1;

            // left
            if (leftCol >= 0) {
                const left = sandArr[leftCol]?.[row];

                if (!tempArr[leftCol][row] && left?.[1] === hex) {
                    resArr.push([left, leftCol, row, left[0].color]);
                    total++;
                }

                tempArr[leftCol][row] = true;

                if (downRow >= 0) {
                    const leftDown = sandArr[leftCol]?.[downRow];
                    if (!tempArr[leftCol][downRow] && leftDown?.[1] === hex) {
                        resArr.push([leftDown, leftCol, downRow, leftDown[0].color]);
                        total++;
                    }
                    tempArr[leftCol][downRow] = true;
                }

                if (upRow < MaxRow) {
                    const leftUp = sandArr[leftCol]?.[upRow];
                    if (!tempArr[leftCol][upRow] && leftUp?.[1] === hex) {
                        resArr.push([leftUp, leftCol, upRow, leftUp[0].color]);
                        total++;
                    }
                    tempArr[leftCol][upRow] = true;
                }
            }

            // right
            if (rightCol < MaxCol) {
                const right = sandArr[rightCol]?.[row];

                if (!tempArr[rightCol][row] && right?.[1] === hex) {
                    resArr.push([right, rightCol, row, right[0].color]);
                    total++;
                }

                tempArr[rightCol][row] = true;

                if (downRow >= 0) {
                    const rightDown = sandArr[rightCol]?.[downRow];
                    if (!tempArr[rightCol][downRow] && rightDown?.[1] === hex) {
                        resArr.push([rightDown, rightCol, downRow, rightDown[0].color]);
                        total++;
                    }
                    tempArr[rightCol][downRow] = true;
                }

                if (upRow < MaxRow) {
                    const rightUp = sandArr[rightCol]?.[upRow];
                    if (!tempArr[rightCol][upRow] && rightUp?.[1] === hex) {
                        resArr.push([rightUp, rightCol, upRow, rightUp[0].color]);
                        total++;
                    }
                    tempArr[rightCol][upRow] = true;
                }
            }

            if (downRow >= 0) {
                const down = sandArr[col]?.[downRow];

                if (!tempArr[col][downRow] && down?.[1] === hex) {
                    resArr.push([down, col, downRow, down[0].color]);
                    total++;
                }

                tempArr[col][downRow] = true;
            }

            if (upRow < MaxRow) {
                const up = sandArr[col]?.[upRow];

                if (!tempArr[col][upRow] && up?.[1] === hex) {
                    resArr.push([up, col, upRow, up[0].color]);
                    total++;
                }

                tempArr[col][upRow] = true;
            }

        }

        return {
            resArr,
            isCutThrough,
        }

    }


    async doEliminate(eliminateArr: [[cc.Node, number], number, number, cc.Color][]) {
        const len = eliminateArr.length;

        if (len) {
            this.pause = true;

            for (let i = 0; i < 2; i++) {
                for (let i = 0; i < len; i++) {
                    const [[sand]] = eliminateArr[i];
                    sand.color = cc.Color.WHITE;
                }

                await wait(50);

                for (let i = 0; i < len; i++) {
                    const [[sand, hex], col, row, color] = eliminateArr[i];
                    sand.color = color;
                }

                await wait(50);
            }

            for (let i = 0; i < len; i++) {
                const [[sand]] = eliminateArr[i];
                sand.color = cc.Color.WHITE;
            }

            await wait(50);


            for (let i = 0; i < len; i++) {
                const [[sand, hex], col, row] = eliminateArr[i];
                sand.removeFromParent();
                SandPool.put(sand);
                this.sandArr[col][row] = null;
            }

            await wait(50);

            this.pause = false;
        }

    }


    gameSpeed = 1;
    simulateTotal = 0;

    update(dt) {

        if (this.pause) return;

        const radioDT = dt * this.gameSpeed;

        // 方块掉落
        this.blockDrop(radioDT);
        // this.debug("方块掉落");

        // 判断并复制方块
        const canCopy = this.judgeSandBlock();
        if (canCopy) {
            this.copyBlockToArr();
            this.resetSandBlock();
        }

        // this.debug("方块判断");

        // 模拟时间
        this.simulateTotal += radioDT;

        if (this.simulateTotal >= SimulateDT) {
            this.simulateTotal -= SimulateDT;

            // 模拟
            this.doSimulate();
            // this.debug("方块模拟");

            // 判断并消除
            this.doJudgeEliminate();
            // this.debug("方块消除");

        }

    }


    /************** debug函数 **************/
    debugSand = (x, y, color = cc.Color.BLACK) => {
        this.pause = true;
        const debugSand = cc.instantiate(this.sandPrefab);
        this.view["BlockRoot"].addChild(debugSand);
        debugSand.setPosition(x, y);
    }

    debug(flag) {
        const {sandArr} = this;

        let childLen = 0;
        for (let col = 0; col < MaxCol; col++) {
            for (let row = 0; row < MaxRow; row++) {
                if (sandArr[col][row]) {
                    childLen++;
                    const [sand, color] = sandArr[col][row];
                    if (sand && !sand.parent) {
                        console.warn(flag);
                        this.debugSand(col * SandWidth, row * SandWidth, cc.Color.BLACK);
                    }
                }
            }
        }

        if (this.sandRoot.children.length !== childLen) {
            console.warn(flag);
            this.pause = true;
            console.log("childLen", childLen, this.sandRoot.children.length);

            const tempArr = [...this.sandRoot.children];
            for (let col = 0; col < MaxCol; col++) {
                for (let row = 0; row < MaxRow; row++) {
                    if (sandArr[col][row]) {
                        const [sand, color] = sandArr[col][row];
                        tempArr.splice(tempArr.indexOf(sand), 1);
                    }
                }
            }

            tempArr.forEach(sand => {
                console.warn(flag);
                this.debugSand(sand.x, sand.y, cc.Color.CYAN);
            });


        }
    }

}
