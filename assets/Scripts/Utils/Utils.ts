import array = cc.js.array;

/**
 * 添加url的协议头
 * @param url
 * @returns
 */
export const addHttps = (url = '') => {
  url = url || ""
  if (!url.includes('//')) return ''
  return url?.includes('http') ? url : `https:${url}`
}

/**
 * 获取分秒
 * @param countDown ms
 * @returns
 */
export const getMS = (countDown = 0) => {
  const secondTotal = countDown / 1000
  const minute = String(Math.floor(secondTotal / 60)).padStart(1, '0')// 剩余分钟数
  const second = String(Math.floor(secondTotal % 60)).padStart(1, '0')// 剩余秒数
  return `${minute}分${second}秒`
}


export const dateFormatter = (date: any, format = "yyyy/MM/dd") => {
  if (!date) return "-";
  date = new Date(
    typeof date === "string" && isNaN(+date)
      ? date.replace(/-/g, "/")
      : Number(date)
  );
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
};
export const getWeek = (date: Date) => {
  let week = date.getDay();
  if (week == 0) week = 7;
  return week;
}

/**
 * 链式取余算法
 * @param ori
 * @param dividend
 * @return {(number|number)[]|*}
 */
export const modAndDivide = (ori: number, dividend: number | number[]) => {
  if (typeof ori !== 'number') throw new Error('Error type.')
  if (typeof dividend === 'number')
    return [ori % dividend, Math.floor(ori / dividend)]
  else if (Array.isArray(dividend)) {
    let _tmp = ori;
    // 链式除
    const list = dividend.map(v => {
      const result = _tmp % v;
      _tmp = Math.floor(_tmp / v);
      return result;
    })
    if (_tmp !== 0) list.push(_tmp);
    return list;
  }
}

/**
 * 分割时间
 * @param  {number}leftTIme  单位秒
 * @param target
 * @return {{day: number, hour: number, min: number, sec: number}}
 */
export const sepTime = (leftTIme: number, target?) => {
  const [sec = 0, min = 0, hour = 0, day = 0] = modAndDivide(leftTIme, [60, 60, 24])
  if (target) {
    target.sec = sec;
    target.min = min;
    target.hour = hour;
    target.day = day
  }
  return { sec, min, hour, day }
}

export const zeroizeFormatter = (n: number | string, l = 2) => (Array(l).join("0") + n).slice(`${n}`.length > l ? -(`${n}`.length) : -l);


export const formatScoreDisplay = (num, from = 1000000, format = [10000, 10000]) => {
  if (!from || num > from) return formatUnitDisplay(num, format);
  return num;
}


export const formatUnitDisplay = (num, format = [10000, 10000, 10000, 10000], formatUnits = ["", "万", "亿", "兆", "万兆",]) => {
  const result = modAndDivide(num, format);

  let maxPos = 0;
  // 反向取最大位
  result.forEach((v, i) => {
    if (v !== 0) maxPos = i;
  })

  const intV = result[maxPos];
  // 没有小数位
  if (maxPos < 1) return intV

  const decimalsNum = result[maxPos - 1]

  if (decimalsNum < 100) return formatUnit(intV, "", maxPos, formatUnits);
  // 小数点后数长度
  // const leftLen = 3 - `${intV}`.length
  const leftLen = 2;

  const decimalsStr = zeroizeFormatter(decimalsNum, 4).substr(0, leftLen);

  return formatUnit(intV, decimalsStr, maxPos, formatUnits);
}

export const formatUnit = (int, dec, u, units) => {
  return `${int}${((dec && dec.length) ? '.' : '') + dec}${units[u]}`
}


export const moneyFormatter = (n) => {
  if (isNaN(+n)) n = 0;
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


export function prefixInteger(num: number, length: number) {
  return (Array(length).join('0') + num).slice(-length);
}

/**
 * 解析html文本
 * @ctype PROCESS
 * @description 解析html文本
 * @param {string} htmlText html文本
 * @returns
 * el HTMLElement html节点
 */
export function parseHtml(htmlText) {
  let el = document.createElement('div');
  el.innerHTML = htmlText;
  return el.children[0];
}


export function sleep(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

/**
 * 节点的精灵置灰
 * @param {cc.Node} img
 */
export function setGray(img: cc.Node) {
  img.getComponent(cc.Sprite).setMaterial(0, cc.Material.createWithBuiltin(cc.Material.BUILTIN_NAME.GRAY_SPRITE.toString(), 0))
}
