const Fs = require('fire-fs');
Editor.Panel.extend({
  // css style for panel
  style: Fs.readFileSync(
    Editor.url("packages://zbw_web_load/panel/index.css"),
    "utf-8"
  ),

  // html template for panel
  template: Fs.readFileSync(
    Editor.url("packages://zbw_web_load/panel/index.html"),
    "utf-8"
  ),

  // element and variable binding
  $: {},

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    const projectPath = Editor.Project.path;
    new window.Vue({
      el: this.shadowRoot,
      data: {
        colorFront: '#fe9275',
        colorRear: '#f37299',
        // 网站标题
        TITLE: '',
        //
        checkbox: true,
        //
        ModelType: 'web-mobile',
        // 进度数值
        progress: 0,
        // 操作日志
        logInfo: ''
      },
      created() { },
      methods: {
        /**
           * 判断文件是否存在
           */
        isFileExist(path) {
          return new Promise(res => {
            Fs.stat(path, (err, info) => {
              err ? res(false) : res(true);
            });
          });
        },
        titleEvent(e){
          this.TITLE = e.detail.value;
        },
        /**
         * 
         * @param {*} e 
         */
        styleEvent(e) {
          console.log(e);
        },
        /**
        * 设置ModelType
        * @param {*} e 
        */
        selectModelType(e) {
          this.ModelType = e.detail.text;
        },
        /**
         * 设置开始颜色值事件
         * @param { CustomEvent } e 
         */
        setColorFrontEvent(e) {
          let _color = e.detail.value;
          _color.splice(3, 1);
          let _r = `RGB(${_color.toString()})`;
          this.colorFront = this.colorHex(_r);
        },
        /**
         * 设置结束颜色值事件
         * @param { CustomEvent } e 
         */
        setColorRearEvent(e) {
          let _color = e.detail.value.toString();
          _color.splice(3, 1);
          let _r = `RGB(${_color.toString()})`;
          this.colorRear = this.colorHex(_r);
        },
        colorHex(color) {
          // RGB颜色值的正则
          let reg = /^(rgb|RGB)/;
          if (reg.test(color)) {
            let strHex = "#";
            // 把RGB的3个数值变成数组
            let colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
            // 转成16进制
            for (let i = 0; i < colorArr.length; i++) {
              let hex = Number(colorArr[i]).toString(16);
              if (hex === "0") {
                hex += hex;
              }
              strHex += hex;
            }
            return strHex;
          } else {
            return String(color);
          }
        },
        /**
         * 生成按钮点击事件
         */
        async isBuildPath() {
          if (!this.checkbox) {
            this.logInfoMgr('请选择样式', 3);
            return;
          }
          let _type = this.ModelType;
          this.logInfoMgr('开始生成', 3);
          // 判断文件是否存在
          this.progress = 10;
          let _is = await this.isFileExist(`${projectPath}\\build\\${_type}\\index.html`);
          if (!_is) {
            this.logInfoMgr('请确认是否构建项目');
            return;
          }
          this.cssCopyFile();
        },
        /**
         * copy Css样式
         */
        async cssCopyFile() {
          let BwCssOpenApiPhat = Editor.url("packages://zbw_web_load/panel/data/web-load.css");
          // 判断插件包内
          let isBwCssOpenApiPhat = await this.isFileExist(BwCssOpenApiPhat);
          if (!isBwCssOpenApiPhat) {
            this.logInfoMgr('web-load.css不存在');
            return;
          };
          // 开始读取css
          this.progress = 20;
          let BwCssOpenString = Fs.readFileSync(BwCssOpenApiPhat, "utf-8");
          let data = BwCssOpenString;
          data = data.split(/\r\n|\n|\r/gm);
          for (let i = 0; i < data.length; i++) {
            // 修改:root中定义的变量
            if (data[i].includes('--bar-color-front:')) {
              data[i] = `    --bar-color-front:${this.colorFront};`;
            }
            if (data[i].includes('--bar-color-rear:')) {
              data[i] = `    --bar-color-rear:${this.colorRear};`;
            }
          }
          // 判断跟目录下有没有css，如果没有 创建->生成 存在 清除-> 写入
          let _cssPath = `${projectPath}\\build\\${this.ModelType}\\web-load.css`;
          Fs.writeFileSync(_cssPath, data.join('\r\n'));
          // css写入完成
          this.progress = 40;
          this.updateIndexHtml();
        },

        async updateIndexHtml() {
          let _type = this.ModelType;
          let _build = `${projectPath}\\build\\`;
          // html 文件路径
          let _htmlPath = `${_build}${_type}\\index.html`;
          let isHtmlIndexPhat = await this.isFileExist(_htmlPath);
          if (!isHtmlIndexPhat) {
            this.logInfoMgr('index.html不存在');
            return;
          };
          // 读取html文件流
          this.progress = 50;
          // 读取文件流
          let BwCssOpenString = Fs.readFileSync(_htmlPath, "utf-8");
          let data = BwCssOpenString;
          data = data.split(/\r\n|\n|\r/gm);
          // 如果等于true表示存在，存在则不进行修改，后期可添加重置
          // 判断标题是否为空
          if (this.TITLE) {
            for (let i = 0; i < data.length; i++) {
              if (data[i].includes('<title>')) {
                data[i] = `<title>${this.TITLE}</title>`;
                console.log(data[i]);
                debugger
                this.logInfoMgr('网站标题修改成功', 3);
                break;
              }
            }
          }
          // 判断是否存在变量名
          if (BwCssOpenString.includes('zbw-web-logo')) {
            this.logInfoMgr('index.html存在自定义id', 3);
            Fs.writeFileSync(_htmlPath, data.join('\r\n'));
            this.progress = 75;
            // // 循环判断
            // for ( let i = 0; i < data.length; i++) {
            //   // 修改:root中定义的变量
            //   if(data[i].includes('zbw-web-logo')){
            //    console.log(i);
            //   }
            // }
          } else {
            // 操作html文件流
            this.progress = 55;
            // 循环判断
            for (let i = 0; i < data.length; i++) {
              //
              if (data[i].includes('</head>')) {
                data.splice((i - 1), 0, `
                <!-- 自定义css样式 -->
                <link rel="stylesheet" type="text/css" href="web-load.css"/>`);
                i += 1;
                this.logInfoMgr('自定义css样式成功', 3);
              }
              // 官方生成canvas下的id为GameCanvas
              if (data[i].includes('GameCanvas')) {
                // 设置canvas为不可见
                data[i] = '<canvas id="GameCanvas" oncontextmenu="event.preventDefault()" tabindex="0" style="visibility:hidden"></canvas>';
                this.logInfoMgr('canvas修改成功', 3);
                // 进行添加
                data.splice((i + 1), 0, `
               <!-- 自定义内容开始 -->
               <div id="zbw-web-logo">
                 <div style="width: 50%;height: 100%;display: contents;">
                   <!-- 图片 -->
                   <img id="zbw-img" src="web-logo.png" alt="">
                   <!-- 加载中进度 -->
                   <div class="zbw-progress" >
                     <div class="zbw-progress-label label" >游戏加载中...</div>
                     <div class="zbw-progress-bar">
                       <span style="width: 0%"></span>
                     </div>
                   </div>
                 </div>
               </div>
               <!-- 自定义内容结束 -->
               `);
                this.logInfoMgr('自定义内容成功', 3);
                // 隐藏掉官方
                for (let k = i; k < data.length; k++) {
                  if (data[k].includes('id="splash"') || data[k].includes('id=" splash "')) {
                    data[k] = `<!-- 注释掉官方内容 ${data[k]}`;
                    data[k + 4] = `${data[k + 4]} -->`;
                    k += 4;
                    continue;
                  }
                  if (data[k].includes('splash')) {
                    data[k] = `// ${data[k]}`;
                  }
                }
                this.logInfoMgr('注释掉官方内容成功', 3);
                break;
              }
            }
            // 写入html文件流
            this.progress = 65;
            // 写入文件
            Fs.writeFileSync(_htmlPath, data.join('\r\n'));
            // 完成写入html文件流
            this.progress = 75;
          }
          // 找到main.js
          const files = Fs.readdirSync(`${_build}${_type}`);
          let _main = '';
          for (let f = 0; f < files.length; f++) {
            if (files[f].includes('main')) {
              _main = files[f];
              this.getJsFile(`${_build}${_type}\\${_main}`);
              break;
            }
          }
        },
        /**
         * 读取并进行修改
         * @param { string } path 
         */
        getJsFile(path) {
          this.progress = 80;
          // 读取js文件流
          let BwJsOpenString = Fs.readFileSync(path, "utf-8");
          BwJsOpenString = BwJsOpenString.split(/\r\n|\n|\r/gm);
          for (let i = 0; i < BwJsOpenString.length; i++) {
            // 暂时不考虑其他因素
            if (BwJsOpenString[i].includes('setLoadingDisplay') && BwJsOpenString[i].includes('{')) {
              // 进行替换
              for (let _i = i + 1; _i < BwJsOpenString.length; _i++) {
                if (BwJsOpenString[_i].includes('splash') && BwJsOpenString[_i].includes('document')) {
                  BwJsOpenString[_i] = "var splash = document.getElementById('zbw-web-logo');";
                  this.logInfoMgr('splash修改成功', 3);
                }
                if (BwJsOpenString[_i].includes('progressBar') && BwJsOpenString[_i].includes('splash')) {
                  BwJsOpenString[_i] = "var progressBar = splash.querySelector('.zbw-progress-bar span');";
                  this.logInfoMgr('progressBar修改成功', 3);
                  
                }
                // 还需要隐藏splash.style.display = 'block';
                if (BwJsOpenString[_i].includes('splash') && BwJsOpenString[_i].includes('block') && !BwJsOpenString[_i].includes('//')){
                  BwJsOpenString[_i] = `// ${BwJsOpenString[_i]}`;
                  break;
                }
              }
              break;
            }
          }
          this.progress = 90;
          Fs.writeFileSync(path, BwJsOpenString.join('\r\n'));
          this.imgCopy();
          this.logInfoMgr('完成', 1);
          // 完成
          this.progress = 100;
        },
        /**
         * 图片拷贝
         */
        async imgCopy(){
          let _webLogo = `${projectPath}\\build\\${this.ModelType}\\web-logo.png`;
          let _is = await this.isFileExist(_webLogo);
          if (_is){
            return;
          }
          let BwImgOpenPhat = Editor.url("packages://zbw_web_load/panel/data/web-logo.png");
          let BwImgOpenBuffer = Fs.readFileSync(BwImgOpenPhat);
          let base64Img = BwImgOpenBuffer.toString("base64");  
          let decodeImg = Buffer.from(base64Img,"base64");
          Fs.writeFileSync(_webLogo, decodeImg);
          this.logInfoMgr('图片拷贝成功', 3);
        },
        /**
         * log打印日志
         * @param {*} content 显示文字
         * @param {*} isType 提示类型 1 表示成功 2表示错误 3表示提示 
         */
        logInfoMgr(content, isType = 2) {
          if (isType === 1) {
            this.logInfo += `Succeed:${content}\n\r`
          }
          if (isType === 2) {
            this.progress = 0;
            this.logInfo += `Error:${content}\n\r`
          }
          if (isType === 3) {
            this.logInfo += `提示:${content}\n\r`
          }
        },

      },
    })
  },

  // register your ipc messages here
  messages: {

  }
});