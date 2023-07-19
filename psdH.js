var fs = require("fs");
var PSD = require('psd');
var path = require('path');
// const mkdirp = require('mkdirp');
//千万别再执行，否则覆盖
// return
var options = {
    //导出图片的目录，没有就导在psd所在目录
    outImgDir: "./assets/resources/assets/",
    //导出Json的目录，没有就不导出
    outJsonDir: "./assets/resources/assets/",
}
//psd文件所在文件夹目录
var pathName = "./psd";
var files = fs.readdirSync(pathName);

//只输出一个数据，就算多个psd，也按照每个psd的第一级进入root的children
var rootStructure = {
    'x': 0,
    'y': 0,
    'type': "container",
    'children': []
}

files.forEach(async function (psdFileName) {
    //获取当前文件的后缀名
    var extname = path.extname(psdFileName);
    //后缀psd的，进行切图
    if (extname.indexOf(".psd") >= 0) {
        const psdFile = pathName + "/" + psdFileName
        const psdFilePath = path.resolve(psdFile);
        var pathInfo = path.parse(psdFile);

        const psdData = PSD.fromFile(psdFilePath);//open(异步)，fromDroppedFile(异步，拖入文件)，fromFile
        psdData.parse();
        const rootNode = psdData.tree();

        //按照第一层的进行分组导出
        for (let i = 0; i < rootNode._children.length; i++) {
            //一个组，比如开始页面，游戏页面等
            const group111 = rootNode._children[i]
            const queueNodes = [];
            const queueNodesIndex = [];
            const queueNodesName = [];
            const queueNodesStructure = [];

            //如果不是组，直接导common文件夹
            if (!group111._children || !group111._children.length) {
                saveAsPng("common", group111.name, group111)

            } else {
                const groupName = rootNode._children[i].name;
                //颠倒一下
                group111._children.reverse()
                queueNodes.push(group111._children);
                queueNodesIndex.push(0);
                queueNodesName.push(undefined);

                const psdStructure = {
                    // 'ids': "",
                    "name": groupName,
                    'x': 0,
                    'y': 0,
                    'type': "container",
                    'children': []
                };
                //首层的容器默认都是0，0，所以他的left和top修改下
                group111.left = group111.top = 0;
                group111.right = 750;
                group111.bottom = 1624;

                queueNodesStructure.push(psdStructure);
                queueLoop: while (0 < queueNodes.length) {
                    const queueIndex = queueNodes.length - 1;
                    const nodes = queueNodes[queueIndex];
                    const nodesStructure = queueNodesStructure[queueIndex];
                    let nodesIndex = queueNodesIndex[queueIndex];
                    let nodesName = queueNodesName[queueIndex];

                    if (nodesName === undefined) {
                        nodesName = '';
                    } else {
                        nodesName += path.sep;
                    }

                    while (nodesIndex < nodes.length) {
                        const node = nodes[nodesIndex];
                        nodesIndex++;
                        // if (node.layer.visible === false) continue;
                        //分割一下
                        const splitArr = node.name.split("_");
                        if (node.type === 'group') {
                            //如果是按钮的组，就单纯按钮的三种贴图，第一个是正常，第二个是无法点击，第三个down
                            if (splitArr[1] == "btn") {
                                const structure = {
                                    'name': splitArr[0],
                                    'x': node.left - (node.parent ? node.parent.left : 0),
                                    'y': node.top - (node.parent ? node.parent.top : 0),
                                    'type': "button",
                                };
                                structure.props = {}
                                // structure.source = splitArr[0] + ".png"
                                if (splitArr[2]) {
                                    structure.id = splitArr[2];
                                    // psdStructure.ids += splitArr[2] + ":FYGE.Button;"
                                }
                                saveAsPng(groupName, node._children[0].name, node._children[0]);
                                structure.props.tUp = node._children[0].name + ".png";
                                if (node._children[1]) {
                                    saveAsPng(groupName, node._children[1].name, node._children[1]);
                                    structure.props.tDisable = node._children[1].name + ".png";
                                }
                                if (node._children[2]) {
                                    saveAsPng(groupName, node._children[2].name, node._children[2]);
                                    structure.props.tDown = node._children[2].name + ".png";
                                }

                                nodesStructure.children.push(structure);
                            }
                            //单纯的组
                            else {
                                //颠倒一下
                                node._children.reverse()
                                queueNodes.push(node._children);
                                queueNodesIndex[queueIndex] = nodesIndex;
                                queueNodesIndex.push(0);
                                queueNodesName.push(nodesName + node.name);

                                const nodeCenter = getCenter(node);
                                const parentCenter = node.parent ? getCenter(node.parent): {x: 0, y: 0};

                                const structure = {
                                    'name': splitArr[0],
                                    // 'x': node.left - (node.parent ? node.parent.left : 0),
                                    // 'y': node.top - (node.parent ? node.parent.top : 0),
                                    x: nodeCenter.x - parentCenter.x,
                                    y: parentCenter.y - nodeCenter.y,
                                    width: node.right - node.left,
                                    height: node.bottom - node.top,
                                    // 'id': splitArr[2]||,//对于group
                                    'type': "container",
                                    'children': [],
                                };
                                if (splitArr[1] == "skin" || splitArr[1] == "item") {//这种情况不该有id
                                    structure.type = "item"
                                } else if (splitArr[1]) {
                                    structure.id = splitArr[1];
                                    // psdStructure.ids += splitArr[1] + ":FYGE.Container;"
                                }

                                nodesStructure.children.push(structure);
                                queueNodesStructure.push(structure);
                                continue queueLoop;
                            }
                        } else {
                            //如果单纯作为贴图，只保存，不进入节点
                            if (splitArr[1] == "tex") {
                                saveAsPng(groupName, splitArr[0], node)
                                continue;
                            }
                            const nodeCenter = getCenter(node);
                            const parentCenter = node.parent ? getCenter(node.parent): {x: 0, y: 0};

                            const structure = {
                                'name': splitArr[0],
                                x: nodeCenter.x - parentCenter.x,
                                y: parentCenter.y - nodeCenter.y,
                                // 'x': node/*.layer*/.left - (node.parent ? node.parent.left : 0),
                                // 'y': node/*.layer*/.top - (node.parent ? node.parent.top : 0),
                                // 'width': node.layer.width,
                                // 'height': node.layer.height
                                // 'alpha': node.layer.opacity / 255,
                            };
                            //只有不为1才记录alpha
                            if (node.layer.opacity < 255) structure.alpha = node.layer.opacity / 255;
                            //如果是文本
                            if (node.layer.typeTool) {
                                structure.type = "text";
                                const text = node.layer.typeTool();
                                const sizes = text.sizes();
                                // if (splitArr[0] == "20%") console.log(sizes)
                                // var size = sizes && sizes.length > 1 ? sizes[0] || 12 :
                                //     sizes ? (sizes[0] || 24) / 2 : 12
                                var size = (() => {
                                    if (!sizes || !sizes[0]) return 12;
                                    return sizes[0] * text.transform.yy;
                                })();
                                // var size = sizes ? sizes[0] || 12 : 12 //这个psd又是正常的

                                const colors = text.colors()[0];
                                structure.props = {
                                    text: text.textValue.replace("\r", "\n"),
                                    size,
                                    fillColor: rgb2String(colors),
                                    textAlpha: colors[3] / 255 || 1,
                                }
                                if (splitArr[1]) {
                                    //加入全局，方便复制
                                    // psdStructure.ids += splitArr[1] + ":FYGE.TextField;";
                                    structure.id = splitArr[1];
                                }
                            }
                            //如果是矢量图，考虑是否需要，简单点判断吧
                            else if (node.layer.solidColor &&
                                node.layer.vectorMask().paths[2].numPoints == 4 &&
                                (!node.layer.vectorMask().paths[3] || node.layer.vectorMask().paths[3].recordType == 2)
                            ) {
                                const { r, g, b } = node.layer.solidColor();
                                let fillColor = rgb2String([r, g, b]);
                                structure.type = 'rect';
                                structure.props = {
                                    width: node.width,
                                    height: node.height,
                                    fillColor
                                }
                                if (splitArr[1]) {
                                    structure.id = splitArr[1];
                                    // psdStructure.ids += splitArr[1] + ":FYGE.Graphics;"
                                }
                            }
                            //标记过按钮的
                            else if (splitArr[1] == "btn") {
                                structure.type = "button";
                                structure.props = {
                                    tUp: splitArr[0] + ".png"
                                }
                                // structure.source = splitArr[0] + ".png"
                                if (splitArr[2]) {
                                    structure.id = splitArr[2];
                                    // psdStructure.ids += splitArr[2] + ":FYGE.Button;"
                                }
                                saveAsPng(groupName, splitArr[0], node)
                            }
                            //保存图片
                            else {
                                structure.type = "sprite";
                                //如果标记过jpg的
                                if (splitArr[1] == "jpg") {
                                    structure.props = {
                                        source: splitArr[0] + ".jpg"
                                    }
                                    // structure.source = splitArr[0] + ".jpg"
                                    saveAsPng(groupName, splitArr[0], node, "jpg");
                                    if (splitArr[2]) {
                                        structure.id = splitArr[2];
                                        // psdStructure.ids += splitArr[2] + ":FYGE.Sprite;"
                                    }
                                } else {
                                    structure.props = {
                                        source: splitArr[0] + ".png"
                                    }
                                    // structure.source = splitArr[0] + ".png"
                                    saveAsPng(groupName, splitArr[0], node);
                                    if (splitArr[1]) {
                                        structure.id = splitArr[1];
                                        // psdStructure.ids += splitArr[1] + ":FYGE.Sprite;"
                                    }
                                }
                            }

                            nodesStructure.children.push(structure);
                        }
                    }

                    queueNodes.pop();
                    queueNodesIndex.pop();
                    queueNodesName.pop();
                    queueNodesStructure.pop();
                }

                //存入root
                // rootStructure.children.push(psdStructure)
                const outJsonData = JSON.stringify(psdStructure/*.group*/, "", "\t");
                //如果需要导出ui数据
                if (options.outJsonDir) {
                    const outJsonDirPath = path.resolve(options.outJsonDir + groupName);
                    const outJsonPath = path.join(outJsonDirPath, groupName + '.json');
                    // make output directory.
                    if (!fs.existsSync(outJsonDirPath)) {
                        fs.mkdirSync(outJsonDirPath);
                    }
                    // output file.
                    fs.writeFileSync(outJsonPath, outJsonData);
                }
            }
        }
    }
})

// //导出所有的数据
// if (options.outJsonDir) {
//     //倒转一下所有children的层级
//
//     const outJsonData = JSON.stringify(rootStructure/*.group*/, "", "\t");
//     const outJsonDirPath = path.resolve(options.outJsonDir);
//     const outJsonPath = path.join(outJsonDirPath, 'skin.json');
//     if (!fs.existsSync(outJsonDirPath)) {
//         fs.mkdirSync(outJsonDirPath);
//     }
//     fs.writeFileSync(outJsonPath, outJsonData);
//     //代码也保存
//     var endPath = './src/';
//     var endFile = `export const SkinJson = ${outJsonData}`
//     fs.writeFileSync(endPath + "SkinJson.ts", endFile);
// }

function getCenter(node) {
    return {
        x: (node.right - node.left) / 2 + node.left,
        y: (node.bottom - node.top) / 2 + node.top
    }
}

function rgb2String(rgb) {
    var hex = ((rgb[0] << 16) + (rgb[1] << 8) + (rgb[2] | 0));
    hex = hex.toString(16);
    hex = '000000'.substr(0, 6 - hex.length) + hex;
    return `#${hex}`;
}

/**
 *
 * @param {string} dirName 文件夹名字
 * @param {string} name 图片名称
 * @param {*} node
 * @param {*} format 保存图片格式，默认png
 */
function saveAsPng(dirName, name, node, format = "png") {
    const outImgDirPath = options.outImgDir + dirName;
    // mkdirp.sync(outImgDirPath);
    if (!fs.existsSync(outImgDirPath)) fs.mkdirSync(outImgDirPath);
    console.log('保存图片:' + name + '.' + format);
    //保存成图片
    node.layer.image.saveAsPng(path.join(outImgDirPath, name + '.' + format));
}
