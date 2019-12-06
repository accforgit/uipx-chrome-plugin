// 存储当前进行对比的 UI 原图数据
let diffImg = null
// 存储需要进行透明的颜色
let opacityColorList = null
// 是否允许 canvas与 页面同步滚动
let followScroll = false
// canvas 透明度
let canvasOpacity = '10'
// canvas 反相
let carpCheck = false
// 标尺
let sgCheck = false
// canvas 尺寸，是否使用UI设计稿原图尺寸，默认使用宽度铺满设备宽度，长度等比例缩放的尺寸
let isUseUISize = false

function setDiffImg (v) {
  diffImg = v
}
function getDiffImg () {
  return diffImg
}

function setOpacityColorList (v) {
  opacityColorList = v
  chrome.storage.sync.set({ [VARS.colorListName]: v }, () => {
    console.log('保存颜色成功')
  })
}
function getOpacityColorList () {
  return new Promise(resolve => {
    if (opacityColorList) {
      resolve(opacityColorList)
    } else {
      // 从本地储存中取值
      chrome.storage.sync.get({ [VARS.colorListName]: [] }, items => {
        setOpacityColorList(items[VARS.colorListName])
        resolve(items[VARS.colorListName])
      })
    }
  })
}

function setFollowScroll (v) {
  followScroll = v
}
function getFollowScroll () {
  return followScroll
}

function setCanvasOpacity (v) {
  canvasOpacity = v
}
function getCanvasOpacity () {
  return canvasOpacity
}

function setCarpCheck (v) {
  carpCheck = v
}
function getCarpCheck () {
  return carpCheck
}

function setSgCheck (v) {
  sgCheck = v
}
function getSgCheck () {
  return sgCheck
}

function setIsUseUISize (v) {
  isUseUISize = v
}
function getIsUseUISize () {
  return isUseUISize
}


