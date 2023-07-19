/**
 * 到时放到Loader里，增加open类型、headers、参数、等等
 * @param options 
 */
export function ajax(options: ajaxParameterInt) {
    /**
     * 默认为GET请求
     */
    options.type = options.type || "GET";
    /**
     * 返回值类型默认为json
     */
    options.dataType = options.dataType || 'json';
    /**
     * 默认为异步请求
     */
    options.async = options.async === false ? false : true;
    /**
     * 对需要传入的参数的处理
     */
    var params = getParams(options.data);
    var xhr: XMLHttpRequest;
    /**
     * 创建一个 ajax请求
     * W3C标准和IE标准
     */
    if (window["XMLHttpRequest"]) {
        //W3C标准
        xhr = new window["XMLHttpRequest"]();
    } else if (window["ActiveXObject"]) {
        //@ts-ignore IE标准
        xhr = new ActiveXObject('Microsoft.XMLHTTP')
    } else {
        console.error("当前浏览器不支持XHR请求")
        return
    }
    //返回类型
    xhr.responseType = options.dataType;

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if ((status >= 200 && status < 300) ||//2XX表示有效响应，其实不加括号不影响判断
                status == 304//304意味着是从缓存读取
            ) {
                options.success && options.success(xhr.response);
            } else {
                options.error && options.error(status || "error");
            }
        }
    };
    //onerror和onloadend是否需要，zepto里貌似没有
    // xhr.onerror = function (reason) {
    //     reject(reason);
    // };
    // xhr.onloadend = function () {
    //     if (xhr.status == 404) {
    //         reject('Not Found');
    //     }
    // };

    if (options.type == 'GET') {
        xhr.open("GET", options.url + '?' + params, options.async);
        //get请求也会需要设置请求头的情况
        if (options.headers) {
            for (let key in options.headers) {
                xhr.setRequestHeader(key, options.headers[key]);
            }
        }
        xhr.send(null)
    } else if (options.type == 'POST') {
        /**
         *打开请求
         */
        xhr.open('POST', options.url, options.async);//待测试，post请求
        /**
         * POST请求设置请求头
         */
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        if (options.headers) {
            for (let key in options.headers) {
                xhr.setRequestHeader(key, options.headers[key]);
            }
        }
        /**
         * 发送请求参数
         */
        xhr.send(params);
    }
}

/**
 * jsonp模拟，不考虑回调
 * @param url 
 * @param params 
 */
export function jsonp(url: string, params: any) {
    const src = url + '?' + getParams(params);
    const scriptEl = document.createElement('script');
    scriptEl.src = src;
    scriptEl.onload = function () {//body考虑改成head
        document.body.removeChild(scriptEl);
    };
    scriptEl.onerror = function () {
        document.body.removeChild(scriptEl);
    };
    document.body.appendChild(scriptEl);
}


/**
 * 对象参数的处理
 * @param data
 * @returns {string}
 */
function getParams(data): string {
    if (!data) return "";//没有就返回空字符
    var arr = [];
    for (var param in data) {
        arr.push(encodeURIComponent(param) + '=' + encodeURIComponent(data[param]));
    }
    //不缓存
    arr.push('_=' + Date.now());
    return arr.join('&');
}
//基本没用到过cache，先不加
interface ajaxParameterInt {
    url: string,
    data?: any,
    type?: "GET" | "POST",
    async?: boolean,
    dataType?: 'text' | 'json' | 'arraybuffer',
    headers?: any,
    success?: (res: any) => void,
    error?: (err: any) => void
}


/**
 * 对封装好的ajax请求进行调用
 * */
// ajax({
//     url: "", //请求地址
//     type: 'GET',   //请求方式
//     data: { name: 'zhangsan', age: '23', email: '2372734044@qq.com' }, //请求参数
//     dataType: "json",     // 返回值类型的设定
//     async: false,   //是否异步
//     headers: {},
//     success: function (response) {
//         console.log(response);   //   此处执行请求成功后的代码
//     },
//     error: function (status) {
//         console.log('状态码为' + status);   // 此处为执行成功后的代码
//     }
// });
