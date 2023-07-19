/**
 * 道具
 */
export enum BOX {
	NONE = "none", // 无道具
	SHIELD = "shield",  // 护盾(5秒时间)
	BOMB = "bomb",  // 光速提神(炸弹，清楚全屏敌人)
	SCATTER = "scatter",  // 散射
	FREEZE = "freeze",  // 不许动（冰冻，全屏敌人不动5秒）
	FULL_LEVEL = "fullLevel",  // 临时满级提神快满状态(5秒时间)
}
