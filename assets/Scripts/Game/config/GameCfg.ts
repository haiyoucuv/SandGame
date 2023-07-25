export const GameCfg = {
    MaxCol: 80,
    MaxRow: 140,
    SandWidth: 6,
    BlockDropSpeed: 400,
    SimulateDT: 1 / 25,

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
