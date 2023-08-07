import { BlockTpl, SandPool, GameCfg } from "../../Game/config/GameCfg";
import { colorToHexNum, deepClone } from "../../Utils/Utils";

const {ccclass, property} = cc._decorator;

const {MaxRow, MaxCol, SandWidth} = GameCfg;

@ccclass
export default class SandBlock extends cc.Component {

    @property(cc.Prefab)
    sandPrefab: cc.Prefab = null;

    sandArr: cc.Node[][] = [];

    // onLoad () {}

    tpl: number[][] = null;
    color: cc.Color = null;
    colorHex: number = null;

    private _row: number = 0;
    get row(): number {
        return this._row;
    }

    set row(row: number) {
        const min = 0 - this.ralMinRow;
        row = cc.misc.clampf(row, min, MaxRow);
        this._row = row;
        this.node.y = row * SandWidth;
    }

    private _col: number = 0;
    get col(): number {
        return this._col;
    }

    set col(col: number) {
        const min = 0 - this.ralMinCol;
        const max = MaxCol - this.ralMaxCol;
        col = cc.misc.clampf(col, min, max);
        this._col = col;
        this.node.x = col * SandWidth;
    }

    private _ralMinCol: number = 0;
    get ralMinCol(): number {
        return this._ralMinCol;
    }

    private _ralMaxCol: number = 0;
    get ralMaxCol(): number {
        return this._ralMaxCol;
    }

    private _ralMinRow: number = 0;
    get ralMinRow(): number {
        return this._ralMinRow;
    }

    private _ralMaxRow: number = 0;
    get ralMaxRow(): number {
        return this._ralMaxRow;
    }

    calcRal() {
        const len = this.tpl.length;

        let minCol = 0;
        outer:for (let col = 0; col < len; col++) {
            for (let row = 0; row < len; row++) {
                if (this.tpl[col][row]) break outer;
            }
            minCol += 8;
        }
        this._ralMinCol = minCol;

        let maxCol = 8 * len;
        outer: for (let col = len - 1; col >= 0; col--) {
            for (let row = 0; row < len; row++) {
                if (this.tpl[col][row]) break outer;
            }
            maxCol -= 8;
        }
        this._ralMaxCol = maxCol;


        let minRow = 0;
        outer:for (let row = 0; row < len; row++) {
            for (let col = 0; col < len; col++) {
                if (this.tpl[col][row]) break outer;
            }
            minRow += 8;
        }
        this._ralMinRow = minRow;

        let maxRow = 8 * len;
        outer:for (let row = len - 1; row >= 0; row--) {
            for (let col = 0; col < len; col++) {
                if (this.tpl[col][row]) break outer;
            }
            maxRow -= 8;
        }
        this._ralMaxRow = maxRow;
    }

    rotate() {
        this.rotateTpl();

        this.calcRal();

        this.clear();

        this.createBlock();
    }

    /**
     * 顺时针旋转模版
     */
    rotateTpl() {
        const tpl = this.tpl;

        const len = tpl.length;
        // 先沿对角线镜像对称二维矩阵
        for (let col = 0; col < len; col++) {
            for (let row = col; row < len; row++) {
                [tpl[col][row], tpl[row][col]] = [tpl[row][col], tpl[col][row]];
            }
        }
        const reverseCol = (arr) => {
            let i = 0,
                j = arr.length - 1;
            while (i <= j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
                j--;
            }
        };
        // 然后反转二维矩阵的每一列
        for (let col of tpl) reverseCol(col);
    }

    clear() {
        this.node.removeAllChildren();
        const len = this.sandArr.length;
        for (let row = 0; row < len; row++) {
            const rowData = this.sandArr[row];
            if (rowData) {
                for (let col = 0; col < len; col++) {
                    const sand = rowData[col];
                    if (sand) {
                        sand.stopAllActions();
                        SandPool.put(sand);
                    }
                }
            }
        }
        this.sandArr.length = 0;
    }

    random(color: cc.Color) {
        this.tpl = deepClone(BlockTpl[(Math.random() * BlockTpl.length) >> 0]);

        // 随机旋转0-3次
        const rotateTimes = (Math.random() * 4) >> 0;
        // const rotateTimes = 2;
        for (let i = 0; i < rotateTimes; i++) this.rotateTpl();

        this.calcRal();

        this.color = color;
        this.colorHex = color["_val"];

        this.clear();

        this.createBlock();
    }

    createBlock() {
        const blockColLen = this.tpl.length;
        for (let blockCol = 0; blockCol < blockColLen; blockCol++) {

            const rowData = this.tpl[blockCol];

            const blockRowLen = rowData.length;
            for (let blockRow = 0; blockRow < blockRowLen; blockRow++) {

                if (rowData[blockRow]) {
                    this.createSingleSandBlock(blockCol, blockRow);
                }

            }
        }
    }

    createSingleSandBlock(blockCol, blockRow) {

        const blockR = blockRow * 8;
        const blockC = blockCol * 8;

        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 8; row++) {
                const sand = this.createSand();
                const color = this.color.clone();

                const left = this.tpl[blockCol - 1]?.[blockRow];
                const right = this.tpl[blockCol + 1]?.[blockRow];
                const top = this.tpl[blockCol][blockRow - 1];
                const bottom = this.tpl[blockCol][blockRow + 1];
                const leftTop = this.tpl[blockCol - 1]?.[blockRow - 1];
                const rightTop = this.tpl[blockCol + 1]?.[blockRow - 1];
                const leftBottom = this.tpl[blockCol - 1]?.[blockRow + 1];
                const rightBottom = this.tpl[blockCol + 1]?.[blockRow + 1];

                // 如果是边界就加暗，否则就随机波动
                if (
                    !left && col == 0
                    || !right && col == 7
                    || !top && row == 0
                    || !bottom && row == 7
                    || !leftTop && col == 0 && row == 0
                    || !rightTop && col == 7 && row == 0
                    || !leftBottom && col == 0 && row == 7
                    || !rightBottom && col == 7 && row == 7
                ) {
                    const radio = 0.85;
                    color.r *= radio;
                    color.g *= radio;
                    color.b *= radio;
                } else {
                    const keep = 0.9;
                    const random = 0.1;
                    color.r *= (Math.random() * random + keep);
                    color.g *= (Math.random() * random + keep);
                    color.b *= (Math.random() * random + keep);
                }

                if (!this.sandArr[col + blockC]) {
                    this.sandArr[col + blockC] = [];
                }

                sand.color = color;
                sand.setPosition((blockC + col) * SandWidth, (blockR + row) * SandWidth);
                this.node.addChild(sand);
                this.sandArr[col + blockC][row + blockR] = sand;
            }
        }
    }

    createSand(): cc.Node {
        let sand = null;
        if (SandPool.size() > 0) {
            sand = SandPool.get();
        } else {
            sand = cc.instantiate(this.sandPrefab);
        }
        return sand;
    }


    // update (dt) {}
}
