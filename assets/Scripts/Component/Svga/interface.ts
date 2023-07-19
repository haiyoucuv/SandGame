/**
 * 导出只是当作类型接口用
 */
export interface IVideoEntity {
	/**
	 * SVGA 文件版本
	 */
	version: string;
	/**
	 * 影片尺寸
	 */
	videoSize: {
		width: number;
		height: number;
	};
	/**
	 * 帧率，60，30等每秒
	 */
	FPS: number;
	/**
	 * 总帧数
	 */
	frames: number;
	/**
	 * base64图片数据记录
	 */
	images: { [key: string]: string };
	/**
	 * 缓存的纹理
	 */
	textures: { [key: string]: cc.SpriteFrame };
	// textures: { [key: string]: cc.Node };
	/**
	 * 图片是否已被缓存，缓存全局，注意名字覆盖
	 */
	hasBeenCached: boolean;
	/**
	 * sprite对象数据
	 */
	sprites: ISpriteEntity[];

}

export interface ISpriteEntity {
	/**
	 * 暂时没用
	 */
	matteKey: string;
	/**
	 * 图片key值
	 */
	imageKey: string;
	/**
	 * 帧数据数组
	 */
	frames: IFrameEntity[];
}

/**
 * 还有很多其他数据，暂不需要，比如矢量路径和遮罩路径暂时都无
 */
export interface IFrameEntity {
	/**
	 * 透明度
	 */
	alpha: number;
	/**
	 * 2维矩阵数据
	 */
	transform: {
		a: number,
		b: number,
		c: number,
		d: number,
		tx: number,
		ty: number,
	};
	/**
	 * 遮罩数据
	 */
	maskPath?: { _d: string, _styles: any, _transform: any }
}


/**
 * 就是个时间轴，setValue和resetValue方法自行实现
 */
export interface IAnimationTrack {
	setValue: (time: number) => void
	resetValue: () => void
}