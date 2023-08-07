export enum TRAVERSAL_BY {
    R_C,    // 先行后列
    RR_C,   // 先行后列，行反向遍历
    R_CR,   // 先行后列，列反向遍历
    RR_CR,  // 先行后列，行列都反向遍历

    C_R,    // 先列后行
    CR_R,   // 先列后行, 列反向遍历
    C_RR,   // 先列后行, 行反向遍历
    CR_RR,  // 先列后行，行列都反向遍历
}


export const GameCfg = {
    MaxCol: 80,
    MaxRow: 140,
    SandWidth: 5,
    SimulateDT: 1 / 25,
    DropDT: 1 / 50,
}

export const SandPool: cc.NodePool = new cc.NodePool();

export const ColorArr = [
    cc.color(206, 82, 57),    // 红
    cc.color(252, 188, 60),   // 黄
    cc.color(61, 106, 175),   // 蓝
    cc.color(110, 177, 81),   // 绿
    // cc.color(255, 255, 255),

];


/**
 * 方块配置，一定要是行列数相等的矩阵
 * Tips: 从左往右是从下到上，一维是列，二维是行
 */
export const BlockTpl = [
    /**
     * 田
     */
    [
        [1, 1],
        [1, 1],
    ],
    /**
     * 一
     */
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    /**
     * L
     */
    [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
    ],
    /**
     * z
     */
    [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
    ],
    /**
     * 土
     */
    [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
    ],
]
