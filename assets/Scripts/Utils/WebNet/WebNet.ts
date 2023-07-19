import { ajax, jsonp } from "./web/ajax";
import { getUrlParams } from "./web/webTools";
import { showToast } from "../../../Module/ToastCtrl";

const DebugPort = "7456";
// import { isFromShare, newUser } from 'duiba-utils';

// let mergeData = {
//     user_type: newUser ? '0' : '1',
//     is_from_share: isFromShare ? '0' : '1',
// }
export const DEFAULF_ERROR = '网络异常，请稍后重试';
//////////////星速台接口方法集成
/**
 * web接口枚举，mock 文件名类似aaa/homeInfo.do
 */
export enum WebNetName {
    /**
     * 首页
     * 参数a 参数b
     */
    index = "game/index.do",
    start = "game/start.do",
    submit = "game/submit.do",

    /**
     * 获取规则
     */
    projectRule = "projectRule.query",

    /**
     * 预扣积分
     */
    creditsCost = "credits/creditsCost.do",
    /**
     * 检查扣积分状态
     */
    queryStatus = "credits/queryStatus.do",

}

//返回数据类型
interface dataOut {
    success: boolean,
    data?: any
    code?: string,
    message?: string
}

//记录数据
let dataRecord: {
    [name: string]: any
} = {};

/**
 * 发送接口
 * @param netName
 * @param parameter
 * @param callback
 * @param hideMsg
 * @param isGet
 * @param headers
 */
export function sendWebNet(
    netName: WebNetName,
    parameter?: any,
    callback?: (success: boolean, res?: dataOut) => void,
    hideMsg: boolean = false,
    isGet: boolean = true,//这两个参数基本不设置，放后面吧
    headers?: any,
): Promise<dataOut> {
    //处理下参数
    // parameter = { ...parameter, ...mergeData };

    return new Promise((resolve, reject) => {

        // if (/*window["development"]*/window.location.port == DebugPort) {//window.location.port == "8080"；考虑按端口判断TODO
        if (window["__ENV__"] === "development") {//window.location.port == "8080"；考虑按端口判断TODO
            let path = netName.split('/')[1];//后缀名字之前的是文件夹,mock里结构
            if (netName.indexOf('/') <= -1) path = `projectX/${netName}`;
            else path = netName
            const url = "mock/" + path + ".json";
            console.info(url)
            fetchAsync(url)
                .then((data) => {
                    //清除超时
                    // clearWait(waitObj)
                    //记录数据
                    dataRecord[netName] = data;
                    //统一错误信息提示
                    if (!hideMsg && !data.success) showToast(data.message || "网络开小差啦，请稍后再试～")
                    //回调
                    callback && callback(data.success, data);
                    resolve(data)
                    console.log(
                        `\n%c[ mock ]\n`
                        + `NAME  : ${netName} \n`
                        + `STATE : %o \n`
                        + `PARAM : %o \n`
                        + `%cDATA  : %o \n`
                        , `${data.success ? 'color:green' : 'color:red'}`
                        , data.success
                        , parameter
                        , `${data.success ? 'color:green' : 'color:red'}`
                        , data
                    );
                }, () => {
                    //本地模拟下网络未链接或mock数据未创建
                    if (!hideMsg) showToast("网络开小差啦，请稍后再试～");
                    callback && callback(false);
                    resolve({ success: false });
                })
            return
        }

        //网络请求
        ajax({
            url: netName, //请求地址
            type: isGet ? 'GET' : "POST",   //请求方式
            data: parameter || {}, //请求参数
            dataType: "json",     // 返回值类型的设定,暂时只有json
            async: true,   //是否异步
            headers: headers,
            success: function (response) {
                //发现有些接口成功了，但是response为空
                response = response || {}
                //记录数据
                dataRecord[netName] = response;
                //统一错误信息提示，
                if (!hideMsg && !response.success) {
                    showToast(response.message || "网络开小差啦，请稍后再试～")
                }
                callback && callback(response.success, response)
                resolve(response)
                console.log(
                    `\n%c[ request ]\n`
                    + `NAME  : ${netName} \n`
                    + `STATE : %o \n`
                    + `PARAM : %o \n`
                    + `%cDATA  : %o \n`
                    , `${response.success ? 'color:green' : 'color:red'}`
                    , response.success
                    , parameter
                    , `${response.success ? 'color:green' : 'color:red'}`
                    , response
                );
            },
            error: function (status) {
                if (!hideMsg) showToast("网络开小差啦，请稍后再试～");
                callback && callback(false)
                resolve({ success: false });
                console.log("接口" + netName + "：网络超时");
            },
        })
    })
}

export function sendWebNetWithToken(
    netName: WebNetName,
    parameter?: any,
    callback?: (success: boolean, res?: dataOut) => void,
    hideMsg: boolean = false,
    isGet: boolean = true,//这两个参数基本不设置，放后面吧
    headers?: any,
): Promise<dataOut> {
    return new Promise(async r => {
        const token = await getPxTokenSave();
        // getPxToken(async (msg, token) => {
        if (!token) {
            showToast(DEFAULF_ERROR);
            r({ success: false })
            return;
        }
        const res = await sendWebNet(netName, { token, ...parameter }, callback, hideMsg, isGet, headers);
        r(res);
        // })
    })


}



/**
 * 获取数据
 * @param netName
 */
export function getWebData(netName: WebNetName): dataOut {
    return dataRecord[netName] || {};
}

//销毁数据
export function destroyWebNetData() {
    dataRecord = {}
}


async function fetchAsync(url: string): Promise<any> {

    const res = await fetch(url);
    return await res.json();

    // return new Promise(async (r, j) => {
    //     // TODO 暂时当作静态资源处理
    //     cc.resources.load(url, (e, d) => {
    //         if (e) {
    //             console.warn(`[${url}]获取失败`)
    //             j(null);
    //         }else {
    //             // @ts-ignore
    //             r(d.json);
    //         }
    //         // @ts-ignore
    //         // console.log(33333, d.json, e, url);
    //     })
    // })
}

const projectxString = "projectx/";
let projectId: string;
/**
 * 获取链接上的projectId
 */
export function getProjectId(): string {
    if (projectId) return projectId;

    let windowUrl = window.location.href;
    let splitArr = windowUrl.split(projectxString);
    if (splitArr.length != 2) {

        return projectId = "projectId"
    }

    let start = windowUrl.indexOf(projectxString) + projectxString.length;
    let end = splitArr[1].indexOf("/");
    return projectId = windowUrl.substr(start, end);
}

//这个临时，如星速台链接有变，注意
const isProd = location.href.indexOf(".com.cn/projectx") >= 0;

/**
 * 刷新星速台tokenkey,注意多活动跳转手动执行一边
 * @param callback
 */
export function refreshPxTokenKey(callback?: (success: boolean) => void) {
    if (isProd) {//线上
        var head = document.getElementsByTagName("head")[0];
        const scriptEl = document.createElement('script');
        scriptEl.src = "getTokenKey?_=" + Date.now();
        scriptEl.onload = function () {
            head.removeChild(scriptEl);
            callback && callback(true)
        };
        scriptEl.onerror = function () {
            head.removeChild(scriptEl);
            callback && callback(false)
        };
        head.appendChild(scriptEl);
    } else {//本地环境
        callback && callback(true)
    }
}
//执行一次
refreshPxTokenKey();

/**
 * 带重刷tokenkey功能的获取token，返回token字符串或null
 * @returns
 */
export function getPxTokenSave() {
    return new Promise<string>((reslove, reject) => {
        getPxToken(async (msg, token) => {
            if (token) {
                reslove(token);
                return
            }
            //只重试一次，刷新tokenKey
            var suc = await new Promise((r) => {
                refreshPxTokenKey(r);
            });
            //刷新失败，返回空
            if (!suc) {
                reslove(null);
                return;
            }
            //再次获取
            getPxToken((msg, token) => {
                reslove(token)
            })
        })
    })
}
/**
 * 获取星速台token
 * @param callback
 */
export function getPxToken(callback: (msg: string, token?: string) => void) {
    if (!isProd) {//本地环境
        callback(null, "token")
        return
    }
    if (!window["ohjaiohdf"]) {
        callback("need reload")
        return
    }
    var xml = new XMLHttpRequest;
    xml.open("get", "getToken?_t=" + Date.now(), !0);
    xml.onreadystatechange = function () {
        if (xml.readyState === 4 && xml.status === 200) {
            var e = JSON.parse(xml.response);
            if (e.success) {
                window.eval(e.data);
                callback(null, window["ohjaiohdf"]());
            }
            else {
                var msg = (() => {
                    switch (e.code) {
                        case "100001":
                            return "need login"
                        case "100024":
                            return "state invalid"
                        default:
                            return e.code
                    }
                })();
                callback(msg);
            }
        }
    }
    xml.onerror = function () {
        callback("net error")
    };
    xml.onloadend = function () {
        xml.status === 404 && callback("net error")
    };
    xml.send()
}

export enum LOG_TYPE {
    EXPOSURE = 'exposure',
    CLICK = 'click',
}

/**
 * 埋点  sendLog(LOG_TYPE.EXPOSURE,"4")
 * 注意点击埋点前必有曝光埋点
 * @param type
 * @param data
 */
export function sendLog(type: LOG_TYPE | 'exposure' | 'click', area: number, dpm_d: number = 1, dcm_c = 0) {
    const projectID = getProjectId();
    const appID = getUrlParams("appID");
    //给个提示
    if (!appID) console.error("appID不存在，检查链接")
    var dpm = `${appID || 'appID'}.110.${area}.${dpm_d}`;// TODO appID注意默认写死一个，已防链接没有
    var dcm = `202.${projectID || 'projectID'}.${dcm_c}.0`;
    //看需求
    // var dom = `${isWxClient() ? '2' : '1'}.0.0.0`;
    let params: any = {
        dpm,
        dcm,
        appId: appID
    };
    //看需求
    // if (dom) params.dom = dom;
    let isExposure = (type == LOG_TYPE.EXPOSURE);
    if (isExposure) {
        //曝光
        jsonp('//embedlog.duiba.com.cn/exposure/standard', params);
    } else {
        //点击
        jsonp('/log/click', params);
    }
    // console.log('try log', {type, ...params});
}

export const sendLogList = (type: LOG_TYPE | 'exposure' | 'click', areaList: (number| {area: number, dpm_d: number, dcm_c: number})[]) => {
    areaList.forEach(v => {
        if (typeof v === "object") {
            sendLog(type, v.area, v.dpm_d, v?.dcm_c || 0)
        }else {
            sendLog(type, v);
        }
    })
}


/**
 * 根据规则id获取奖品列表
 * @param strategyId 规则id
 * @param optionId 不传表示返回所有奖品
 */
export function queryPrizeList(strategyId: string, optionId?: string): Promise<dataOut> {
    let url = `/projectx/${getProjectId()}/${strategyId}.query`;
    return new Promise((resolve) => {
        if (window.location.port == DebugPort) {//本地环境
            resolve({//自定义数据。暂时这样
                "success": true,
                "message": "consequat ea",
                "data": [
                    {
                        "prizeType": "dolore culpa in tempor",
                        "name": "ka3",
                        "refType": "Excepteur adipisicing sint",
                        "icon": "//yun.duiba.com.cn/spark/assets/58184d8d965c556b412026acf7a5d5d9e7a975f5.png",
                        "index": "Ut in pariatur",
                        "id": "et",
                        "refId": "minim culpa veniam aliqua ut",
                        "prizeId": "aa",
                        "icon2": "aliquip consectetur laborum Duis"
                    }
                ],
                "code": "fugiat velit in esse aute"
            })
        } else {
            ajax({
                url,
                type: 'GET',
                data: optionId ? { optionId } : {},
                dataType: "json",
                async: true,
                success: function (response) {
                    resolve(response)
                },
                error: function () {
                    resolve({ success: false })
                }
            })
        }
    })
}

/**
     * 扣积分流程，带轮询
     * @param toPlaywayId
     * @param toActionId
     * @param credits
     * @param desc?
     * @return {Promise<{ success: boolean, ticket?: any,pollingData }>}
     */
export async function creditsCost(toPlaywayId, toActionId, desc, credits = "") {
    // 预扣积分
    const param = {
        toPlaywayId,
        toActionId,
        credits,
    };
    //@ts-ignore
    desc && (param.desc = desc);
    const { success, data: ticket } = await sendWebNet(WebNetName.creditsCost, param);

    if (!success) return { success: false };

    // 轮询
    const pollingData = await pollingWebNet(
        { ticketNum: ticket },
        (success, res) => {
            return res.data != 0; // 0 是处理中
        }
    );
    //@ts-ignore
    return { success: pollingData.data == 1, ticket, pollingData };
}

/**
 * 封装一个轮询
 * @param param
 * @param {(success: boolean, res?: dataOut) => boolean} progress 这个函数必须返回一个bool值 用于是否结束轮询的标志 true则会结束轮询
 * @param { (res) => void} complete
 * @param {number} count
 * @param {number} timeOut
 * @return {Promise<{success: boolean, res: any}>}
 */
export async function pollingWebNet(param, progress, complete?, count = 10, timeOut = 200) {
    return new Promise(async (resolve, reject) => {
        // Loading.show();
        let _count = 0;

        async function pollingOnce() {
            const res = await sendWebNet(WebNetName.queryStatus, param)

            // 如果是true则结束轮询
            if (progress(res.success, res)) {
                // Loading.hide();
                resolve(res);
                complete && complete(res);
                return;
            }

            _count++;

            // 到达次数上限结束轮询
            if (_count >= count) {
                // Loading.hide();
                resolve(res);
                complete && complete(res);
                return;
            }

            setTimeout(() => {
                pollingOnce();
            }, timeOut);
        }

        await pollingOnce();
    });
}
