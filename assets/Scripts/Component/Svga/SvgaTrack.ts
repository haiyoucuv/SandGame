import {IFrameEntity, IAnimationTrack} from "./interface";

export class SvgaTrack implements IAnimationTrack {

	constructor(
		private node: cc.Node,
		private frames: IFrameEntity[],
	) {
	}

	/**
	 * 这里用的帧数
	 * @param time 帧小数
	 */
	setValue(time: number) {

		const {node, frames} = this;

		// time = time % this.frames.length;

		//处理time
		time = Math.round(cc.misc.clampf(time, 0, frames.length - 1));

		//找对应数据
		const {alpha, transform, maskPath} = frames[time];

		// layout不晓得干嘛用，暂不管

		if (alpha < 0.05) {
			node.opacity = 0;
		} else {
			node.opacity = alpha * 255;

			// 修改临时矩阵
			const {a, b, c, d, tx, ty} = transform;

			const mat: cc.Mat4 = node["_matrix"];
			const trs = node["_trs"];
			const tm = mat.m;
			tm[0] = a;
			tm[1] = b;

			// 以下四个数据要取反，因为cocos坐标系和svga坐标系不一样，y轴相反
			tm[4] = -c;
			tm[5] = -d;
			tm[6] = -tm[6];
			tm[7] = -tm[7];

			trs[0] = tx;
			trs[1] = ty;

			// mat.scale(cc.v3(1, -1, 1), mat);

			// @ts-ignore
			// 增加计算世界矩阵的标记，让渲染器计算世界矩阵
			node._renderFlag |= cc.RenderFlow.FLAG_WORLD_TRANSFORM;

		}
	}

	resetValue() {
		// @ts-ignore
		// 重置计算本地矩阵的标记，让渲染器不计算本地矩阵，不重置的话，会在刚开始的时候计算一次
		this.node._renderFlag &= ~cc.RenderFlow.FLAG_LOCAL_TRANSFORM;

		this.setValue(0);
	}

	destroy() {
		this.node = null;
		// this.frames.length = 0;  // 不能加！！！
	}
}