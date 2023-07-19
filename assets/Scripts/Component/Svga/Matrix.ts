
const PI: number = Math.PI;
const HalfPI: number = PI >> 1;
const PacPI: number = PI + HalfPI;
const DEG_TO_RAD: number = PI / 180;
const RAD_TO_DEG: number = 180 / PI;
const PI_2: number = PI * 2;

function cos(angle: number): number {
	switch (angle) {
		case HalfPI:
		case -PacPI:
			return 0;
		case PI:
		case -PI:
			return -1;
		case PacPI:
		case -HalfPI:
			return 0;
		default:
			return Math.cos(angle);
	}
}

function sin(angle: number): number {
	switch (angle) {
		case HalfPI:
		case -PacPI:
			return 1;
		case PI:
		case -PI:
			return 0;
		case PacPI:
		case -HalfPI:
			return -1;
		default:
			return Math.sin(angle);
	}
}


/**
 * 2维矩阵
 * @class Matrix
 * @public
 * @since 1.0.0
 */
export class Matrix {
    /**
     * @property a
     * @type {number}
     * @public
     * @default 1
     * @since 1.0.0
     */
    public a: number = 1;
    /**
     * @property b
     * @public
     * @since 1.0.0
     * @type {number}
     */
    public b: number = 0;
    /**
     * @property c
     * @type {number}
     * @public
     * @since 1.0.0
     */
    public c: number = 0;
    /**
     * @property d
     * @type {number}
     * @public
     * @since 1.0.0
     */
    public d: number = 1;
    /**
     * @property tx
     * @type {number}
     * @public
     * @since 1.0.0
     */
    public tx: number = 0;
    /**
     * @property ty
     * @type {number}
     * @since 1.0.0
     * @public
     */
    public ty: number = 0;

    //数组形式
    public array = null;
    /**
     * 构造函数
     * @method Matrix
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
     * @param {number} tx
     * @param {number} ty
     * @public
     * @since 1.0.0
     */
    public constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
        const s = this;
        s.a = a;
        s.b = b;
        s.c = c;
        s.d = d;
        s.tx = tx;
        s.ty = ty;
    }

    /**
     * 复制一个矩阵
     * @method clone
     * @since 1.0.0
     * @public
     * @return {Matrix}
     */
    public clone(): Matrix {
        let s = this;
        return new Matrix(s.a, s.b, s.c, s.d, s.tx, s.ty);
    }

    /**
     * 复制一个矩阵的所有属性
     * @param matrix 
     */
    copy(matrix: Matrix | any) {
        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;

        return this;
    }


    /**
     * 将一个点通过矩阵变换后的点，世界矩阵应用于局部坐标，转化为世界坐标
     * @method transformVec2
     * @param {number} x
     * @param {number} y
     * @param bp
     * @public
     * @since 1.0.0
     */
    public transformVec2(x: number, y: number, bp: cc.Vec2 = null): cc.Vec2 {
        let s = this;
        if (!bp) {
            bp = new cc.Vec2();
        }
        bp.x = x * s.a + y * s.c + s.tx;
        bp.y = x * s.b + y * s.d + s.ty;
        return bp
    };

    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     * 用于世界坐标转化为局部坐标
     * @param {number} x
     * @param {number} y
     * @param bp
     */
    public transformVec2Inverse(x: number, y: number, bp: cc.Vec2 = null): cc.Vec2 {
        let s = this;
        if (!bp) {
            bp = new cc.Vec2();
        }

        const id = 1 / ((this.a * this.d) + (this.c * -this.b));

        bp.x = (this.d * id * x) + (-this.c * id * y) + (((this.ty * this.c) - (this.tx * this.d)) * id);
        bp.y = (this.a * id * y) + (-this.b * id * x) + (((-this.ty * this.a) + (this.tx * this.b)) * id);

        return bp;
    }

    /**
     * 从一个矩阵里赋值给这个矩阵
     * @method setFrom
     * @param {Matrix} mtx
     * @public
     * @since 1.0.0
     */
    public setFrom(mtx: Matrix): void {
        let s = this;
        s.a = mtx.a;
        s.b = mtx.b;
        s.c = mtx.c;
        s.d = mtx.d;
        s.tx = mtx.tx;
        s.ty = mtx.ty;
    }

    /**
     * 将矩阵恢复成原始矩阵
     * @method identity
     * @public
     * @since 1.0.0
     */
    public identity(): void {
        let s = this;
        s.a = s.d = 1;
        s.b = s.c = s.tx = s.ty = 0;
    }

    /**
     * 反转一个矩阵
     * @method invert
     * @return {Matrix}
     * @since 1.0.0
     * @public
     */
    public invert(): Matrix {
        let s = this;
        let a = s.a;
        let b = s.b;
        let c = s.c;
        let d = s.d;
        let tx = s.tx;
        let ty = s.ty;

        if (b == 0 && c == 0) {
            if (a == 0 || d == 0) {
                s.a = s.d = s.tx = s.ty = 0;
            }
            else {
                a = s.a = 1 / a;
                d = s.d = 1 / d;
                s.tx = -a * tx;
                s.ty = -d * ty;
            }
            return s;
        }
        let determinant = a * d - b * c;
        if (determinant == 0) {
            s.identity();
            return s;
        }
        determinant = 1 / determinant;
        let k = s.a = d * determinant;
        b = s.b = -b * determinant;
        c = s.c = -c * determinant;
        d = s.d = a * determinant;
        s.tx = -(k * tx + c * ty);
        s.ty = -(b * tx + d * ty);
        return s;
    }

    /**
     * 设置一个矩阵通过普通的显示对象的相关九大属性，锚点不影响坐标原点,暂时不用
     * @method createBox
     * @param {number} x
     * @param {number} y
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} rotation 角度制
     * @param {number} skewX 角度制
     * @param {number} skewY 角度制
     * @param {number} ax
     * @param {number} ay
     * @since 1.0.0
     * @public
     */
    public createBox(x: number, y: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number, ax: number, ay: number): void {
        let s = this;
        if (rotation != 0) {
            skewX = skewY = rotation % 360;
        } else {
            skewX %= 360;
            skewY %= 360;
        }
        if ((skewX == 0) && (skewY == 0)) {
            s.a = scaleX;
            s.b = s.c = 0;
            s.d = scaleY;
        } else {
            skewX *= DEG_TO_RAD;
            skewY *= DEG_TO_RAD;
            let u = cos(skewX);
            let v = sin(skewX);
            if (skewX == skewY) {
                s.a = u * scaleX;
                s.b = v * scaleX;
            }
            else {
                s.a = cos(skewY) * scaleX;
                s.b = sin(skewY) * scaleX;
            }
            s.c = -v * scaleY;
            s.d = u * scaleY;
        };
        s.tx = x + ax - (ax * s.a + ay * s.c);
        s.ty = y + ay - (ax * s.b + ay * s.d);
    }

    /**
     * 矩阵相乘
     * @method prepend
     * @public
     * @since 1.0.0
     * @param {Matrix} mtx
     */
    public prepend = function (mtx: Matrix): void {
        let s = this;
        let a = mtx.a;
        let b = mtx.b;
        let c = mtx.c;
        let d = mtx.d;
        let tx = mtx.tx;
        let ty = mtx.ty;
        let a1 = s.a;
        let c1 = s.c;
        let tx1 = s.tx;
        s.a = a * a1 + c * s.b;
        s.b = b * a1 + d * s.b;
        s.c = a * c1 + c * s.d;
        s.d = b * c1 + d * s.d;
        s.tx = a * tx1 + c * s.ty + tx;
        s.ty = b * tx1 + d * s.ty + ty;
        return this
    };
    /**
    * Appends the given Matrix to this Matrix.
    *
    * @param {Matrix} matrix - The matrix to append.
    * @return {Matrix} This matrix. Good for chaining method calls.
    */
    public append(matrix: Matrix) {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;

        this.a = (matrix.a * a1) + (matrix.b * c1);
        this.b = (matrix.a * b1) + (matrix.b * d1);
        this.c = (matrix.c * a1) + (matrix.d * c1);
        this.d = (matrix.c * b1) + (matrix.d * d1);

        this.tx = (matrix.tx * a1) + (matrix.ty * c1) + this.tx;
        this.ty = (matrix.tx * b1) + (matrix.ty * d1) + this.ty;

        // return this;
    }

    /**
     * 判断两个矩阵是否相等
     * @method isEqual
     * @static
     * @public
     * @since 1.0.0
     * @param {Matrix} m1
     * @param {Matrix} m2
     * @return {boolean}
     */
    public static isEqual(m1: Matrix, m2: Matrix): boolean {
        return m1.tx == m2.tx && m1.ty == m2.ty && m1.a == m2.a && m1.b == m2.b && m1.c == m2.c && m1.d == m2.d;
    }
    public concat(mtx: Matrix): void {
        let s = this;
        let a = s.a, b = s.b, c = s.c, d = s.d,
            tx = s.tx, ty = s.ty;
        let ma = mtx.a, mb = mtx.b, mc = mtx.c, md = mtx.d,
            mx = mtx.tx, my = mtx.ty;
        s.a = a * ma + b * mc;
        s.b = a * mb + b * md;
        s.c = c * ma + d * mc;
        s.d = c * mb + d * md;
        s.tx = tx * ma + ty * mc + mx;
        s.ty = tx * mb + ty * md + my;
    }
    /**
     * 对矩阵应用旋转转换。
     * @method rotate
     * @param angle 弧度制
     * @since 1.0.3
     * @public
     */
    public rotate(angle: number): void {
        let s = this;
        let sin = Math.sin(angle), cos = Math.cos(angle),
            a = s.a, b = s.b, c = s.c, d = s.d,
            tx = s.tx, ty = s.ty;
        s.a = a * cos - b * sin;
        s.b = a * sin + b * cos;
        s.c = c * cos - d * sin;
        s.d = c * sin + d * cos;
        s.tx = tx * cos - ty * sin;
        s.ty = tx * sin + ty * cos;
    }

    /**
     * 对矩阵应用缩放转换。
     * @method scale
     * @param {Number} sx 用于沿 x 轴缩放对象的乘数。
     * @param {Number} sy 用于沿 y 轴缩放对象的乘数。
     * @since 1.0.3
     * @public
     */
    public scale(sx: number, sy: number): void {
        let s = this;
        s.a *= sx;
        s.d *= sy;
        s.c *= sx;
        s.b *= sy;
        s.tx *= sx;
        s.ty *= sy;
    }
    /**
     * 沿 x 和 y 轴平移矩阵，由 dx 和 dy 参数指定。
     * @method translate
     * @public
     * @since 1.0.3
     * @param {Number} dx 沿 x 轴向右移动的量（以像素为单位
     * @param {Number} dy 沿 y 轴向右移动的量（以像素为单位
     */
    public translate(dx: number, dy: number) {
        let s = this;
        s.tx += dx;
        s.ty += dy;
    }


    public set(a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;

        return this;
    }

    /**
     * 获得角度,角度制,
     * 其他的x,y,就是tx,ty
     * scale就是a,d
     * skew基本不用
     */
    public getRotation() {
        return Math.round(Math.atan2(this.b, this.a) * RAD_TO_DEG);
    }

    /**
     * 输出数组.与glsl中的mat3对应,注意行列主序执行transpose;
     * 参数与3d的区别很大
     * @param {boolean} transpose - 是否转置,默认false,glsl中传入需要true
     * @param {Float32Array} [out=new Float32Array(9)] - 输出数组,如不传使用自身的array
     * @return {number[]} 返回数组
     */
    public toArray(transpose = false, out?) {
        if (!this.array) {
            this.array = new Float32Array(9);
        }

        const array = out || this.array;

        if (transpose) {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
        } else {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        }

        return array;
    }
    /**
     * 从矩阵数据转成tansform的数据
     */
    decompose() {
    	const transform = {
		    rotation: 0,
		    skew: cc.v2(),
		    scale: cc.v2(),
		    position: cc.v2(),
	    };

        const a = this.a;
        const b = this.b;
        const c = this.c;
        const d = this.d;
        //取斜切
        const skewX = -Math.atan2(-c, d);
        const skewY = Math.atan2(b, a);

        const delta = Math.abs(skewX + skewY);
        //斜切值和旋转不唯一，所以设定条件只取其一
        if (delta < 0.00001 || Math.abs(Math.PI * 2 - delta) < 0.00001) {
            transform.rotation = skewY;
            //考虑是否必要
            if (a < 0 && d >= 0) {
                transform.rotation += (transform.rotation <= 0) ? Math.PI : -Math.PI;
            }
            transform.skew.x = transform.skew.y = 0;
        }
        else {
            transform.rotation = 0;
            transform.skew.x = skewX;
            transform.skew.y = skewY;
        }

        //取缩放
        transform.scale.x = Math.sqrt((a * a) + (b * b));
        transform.scale.y = Math.sqrt((c * c) + (d * d));

        //取位置
        transform.position.x = this.tx;
        transform.position.y = this.ty;

        return transform;
    }
    /**
     * 获取一个初始化矩阵，返回新的实例
     * @static
     * @const
     */
    public static get IDENTITY() {
        return new Matrix();
    }

    /**
     * 获取一个临时矩阵，返回新的实例
     * @static
     * @const
     */
    public static get TEMP_MATRIX() {
        return new Matrix();
    }

    destroy(): void {
    }
}