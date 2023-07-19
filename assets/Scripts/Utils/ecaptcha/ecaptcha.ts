/**
 * Created by rockyl on 2021/1/26.
 *
 * 易盾
 */
import { parseHtml } from '../Utils';
import { jsonp } from '../WebNet/web/ajax';
let inited = false;
let captchaEl;
let initNecSuccess = false;
let captchaIns;
/**
 * 滑块验证
 * @ctype PROCESS
 * @description 极验的滑块验证
 * @param {string} captchaId - 验证id
 * @param {number} [limitTimes=1] - 次数上限(≤0:无限次数直到成功)
 * @param {string} [mode='embed'] - 模式
 * @returns
 * validate string 验证字符串
 * @example 一般用法
 * const validate = await startNecCaptcha('a869bfdfb9bd4cdf88e1ff2f8667a114').catch(e=>{
 *   console.log('验证失败，错误:', e)
 * })
 * if(validate){
 *   console.log('验证成功，验证串:', validate)
 * }
 */
export async function startNecCaptcha(captchaId, limitTimes = 1, mode = 'embed') {
    let times = limitTimes <= 0 ? Number.MAX_VALUE : limitTimes;
    let validate;
    for (let i = 0; i < times; i++) {
        validate = await showNecCaptcha(captchaId, mode).catch(console.info);
        if (validate) {
            return validate;
        }
    }
    return Promise.reject('out of times');
}
async function showNecCaptcha(captchaId, mode = 'embed') {
    await init();
    return new Promise((resolve, reject) => {
        document.body.appendChild(captchaEl);
        let wrapper = captchaEl.children[0];
        wrapper.innerHTML = null;
        wrapper.style.visibility = 'hidden';
        let opts = {
            element: wrapper,
            captchaId,
            width: '100%',
            mode,
            onVerify: function (err, data) {
                removeCaptcha();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.validate);
                }
            },
        };
        window['initNECaptcha'](opts, function (instance) {
            captchaIns = instance;
            initNecSuccess = true;
            wrapper.style.visibility = 'visible';
            captchaEl.addEventListener('click', onClickCaptcha);
        }, function (err) {
            initNecSuccess = false;
            captchaEl.addEventListener('click', onClickCaptcha);
        });
        captchaEl.style.visibility = 'visible';
    });
    function onClickCaptcha(e) {
        if (initNecSuccess) {
            if (e.target == captchaEl) {
                if (captchaIns)
                    captchaIns.refresh();
            }
        }
        else {
            removeCaptcha();
            showNecCaptcha(captchaId, mode);
        }
    }
    function removeCaptcha() {
        captchaEl.removeEventListener('click', onClickCaptcha);
        document.body.removeChild(captchaEl);
    }
}
async function init() {
    if (!inited) {
        await jsonp('//cstaticdun.126.net/load.min.js', null);
        captchaEl = parseHtml(`<div class="sui-captcha"><div class="neCaptcha-dialog"></div></div>`);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window['initNECaptcha']) {
                break;
            }
        }
        inited = true;
    }
}
