// 按钮选中的样式class
const btnActiveClassName = '__uipx-btn-active'
// 透明色值的 li.className
const opacityClassName = '__uipx-color-item'
// 删除 透明色值 li.className 的按钮的 className
const delOpacityClassName = '__uipx-del-color-btn'
// 微调按钮
const microTopClassName = '__uipx-micro-top'
const microRightClassName = '__uipx-micro-right'
const microBottomClassName = '__uipx-micro-bottom'
const microLeftClassName = '__uipx-micro-left'

const inputFile = $('#__uipx-picfile')
const img = $('#__uipx-img')
const cpi = $('#__uipx-cpi')
const followCheck = $('#__uipx-follow-check')
const carpCheck = $('#__uipx-carp-check')
const sizeCheck = $('#__uipx-size-check')
const sgCheck = $('#__uipx-sg-check')
const colorList = $('#__uipx-color-list')
const bg = chrome.extension.getBackgroundPage()

// #region init
function init () {
  initDomStatus()
  showPic()
}
init()
// #endregion

// 所有的注册监听事件
const listenerList = [
  // 选择上传对比的 UI 图
  { ele: inputFile, listenerName: 'change', fn: inputFileFn },
  // canvas整体透明度调节
  { ele: cpi, listenerName: 'change', fn: cpiFn },
  { ele: $('.__uipx-icon-add')[0], listenerName: 'click', fn () { cpiUpdate(1) } },
  { ele: $('.__uipx-icon-cut')[0], listenerName: 'click', fn () { cpiUpdate(-1) } },
  // canvas 滑动后位置恢复
  { ele: $('#__uipx-reset'), listenerName: 'click', fn: resetPositionFn },
  // canvas 的尺寸是否使用原图的
  {ele: sizeCheck, listenerName: 'click', fn: sizeCheckFn },
  // canvas 跟随页面滚动
  { ele: followCheck, listenerName: 'click', fn: followCheckFn },
  // canvas 反相
  { ele: carpCheck, listenerName: 'click', fn: carpCheckFn },
  // 标尺
  { ele: sgCheck, listenerName: 'click', fn () { sgCheckFn(); } },
  // 管理需要完全透明的颜色值
  { ele: $('#__uipx-add-color-btn'), listenerName: 'click', fn: addOpacityColorFn },
  { ele: $('#__uipx-color-list'), listenerName: 'click', fn: delOpacityColorFn },
  // 删除当前对比的图片
  { ele: $('.__uipx-img-del')[0], listenerName: 'click', fn: delDiffImgFn },
  // canvas 位置微调
  { ele: $('.__uipx-micro-content')[0], listenerName: 'click', fn: microActionFn }
]
const beforeFn = (item, e) => {
  if (item.ele !== inputFile) {
    if (!bg.getDiffImg()) {
      return toast('请选择对比的UI图')
    }
  }
  item.fn.call(item.ele, e)
}
// 遍历注册
listenerList.forEach(item => {
  item.ele.addEventListener(item.listenerName, e => {
    beforeFn(item, e)
  })
})

// #region listener
// 选择上传对比的 UI 图
function inputFileFn () {
  if (inputFile.files.length) {
    const file = inputFile.files[0]
    const reader = new FileReader()
    reader.onload = e => {
      bg.setDiffImg(e.target.result)
      showPic()
    }
    reader.readAsDataURL(file)
  }
}
// canvas整体透明度调节
function cpiFn () {
  if (cpi.value < 0) {
    cpi.value = 0
  } else if (cpi.value > 10) {
    cpi.value = 10
  }
  bg.setCanvasOpacity(cpi.value)
  sendMessage({ name: VARS.opacityChangeName, data: cpi.value / 10 })
}
function cpiUpdate (step) {
  cpi.value = +cpi.value + step
  cpiFn()
}
// canvas 滑动后位置恢复
function resetPositionFn () {
  sendMessage({ name: VARS.canvasPResetName })
}
// canvas 的尺寸是否使用原图的
function sizeCheckFn () {
  this.classList.toggle(btnActiveClassName)
  bg.setIsUseUISize(this.classList.contains(btnActiveClassName))
  imgHandle(VARS.sizeCheckName)
}
// canvas 跟随页面滚动
function followCheckFn (onlyRefresh) {
  if (typeof onlyRefresh === 'boolean') {
    followCheck.classList.toggle(btnActiveClassName, onlyRefresh)
  } else {
    followCheck.classList.toggle(btnActiveClassName)
  }
  const flag = followCheck.classList.contains(btnActiveClassName)
  bg.setFollowScroll(flag)
  sendMessage({ name: VARS.followCheckName, data: flag })
}
// canvas 反相
function carpCheckFn () {
  this.classList.toggle(btnActiveClassName)
  bg.setCarpCheck(this.classList.contains(btnActiveClassName))
  imgHandle(VARS.carpCheckName)
}
// 标尺
function sgCheckFn (onlyRefresh) {
  if (typeof onlyRefresh === 'boolean') {
    sgCheck.classList.toggle(btnActiveClassName, onlyRefresh)
  } else {
    sgCheck.classList.toggle(btnActiveClassName)
  }
  const flag = sgCheck.classList.contains(btnActiveClassName)
  bg.setSgCheck(flag)
  sendMessage({ name: VARS.staffGaugeName, data: flag })
}
// 管理需要完全透明的颜色值
function addOpacityColorFn () {
  colorList.appendChild(createColorItem())
}
function delOpacityColorFn (e) {
  // 删除一个颜色项
  if (e.target.classList.contains(delOpacityClassName)) {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode)
    saveInputColorList()
    imgHandle()
  }
}
// canvas 删除
function delDiffImgFn (e) {
  bg.setDiffImg()
  img.src = ''
  img.style.display = 'none'
  sendMessage({
    name: VARS.diffImgDelName
  })
}
// canvas 位置微调
function microActionFn (e) {
  const classList = e.target.classList
  const data = {
    x: 0,
    y: 0
  }
  if (classList.contains(microTopClassName)) {
    data.y = -1
  } else if (classList.contains(microRightClassName)) {
    data.x = 1
  } else if (classList.contains(microBottomClassName)) {
    data.y = 1
  } else if (classList.contains(microLeftClassName)) {
    data.x = -1
  }
  if (data.x || data.y) {
    sendMessage({
      name: VARS.microActionName,
      data
    })
  }
}
// #endregion

function initDomStatus () {
  followCheck.classList.toggle(btnActiveClassName, bg.getFollowScroll())
  carpCheck.classList.toggle(btnActiveClassName, bg.getCarpCheck())
  sgCheck.classList.toggle(btnActiveClassName, bg.getSgCheck())
  sizeCheck.classList.toggle(btnActiveClassName, bg.getIsUseUISize())
  cpi.value = bg.getCanvasOpacity()
  initColorItem()
}

// 透明色值
async function initColorItem () {
  const list = await bg.getOpacityColorList()
  if (list && list.length) {
    list.forEach(item => {
      colorList.appendChild(createColorItem(item))
    })
  }
}

// 改变 inputColorList，input元素 blur 事件触发
function inputColorChange (e) {
  const inputHandlers = [].every.call(e.parentNode.childNodes, item => {
    return item.tagName.toLowerCase() === 'input' ? item.value : true
  })
  if (inputHandlers) {
    this.saveInputColorList()
  }
}
// 保存当前输入的需要进行完全透明处理的色值列表
async function saveInputColorList () {
  const newInputColorList = [].map.call($('.' + opacityClassName), item => {
    return [].reduce.call(item.querySelectorAll('input'), (t, c) => {
      return c.value ? t.concat(+c.value) : t
    }, [])
  })
  if (JSON.stringify(newInputColorList) !== JSON.stringify(await bg.getOpacityColorList())) {
    bg.setOpacityColorList(newInputColorList)
    imgHandle()
  }
}

// 创建 li.colorItem
function createColorItem (rgbArr = null) {
  let colorItem = document.createElement('li')
  colorItem.className = opacityClassName
  let itemInput = document.createElement('input')
  itemInput.type = 'number'
  let delColorBtn = document.createElement('button')
  delColorBtn.className = `__uipx-btn-default ${delOpacityClassName}`
  delColorBtn.textContent = 'Delete'
  ;['r', 'g', 'b'].forEach((name, index) => {
    itemInput = itemInput.cloneNode(true)
    itemInput.name = name
    itemInput.placeholder = name
    if (rgbArr) {
      itemInput.value = rgbArr[index]
    }
    itemInput.addEventListener('blur', function () {
      inputColorChange(this)
    })
    colorItem.appendChild(itemInput)
  })
  colorItem.appendChild(delColorBtn)
  return colorItem
}

// 处理对比的 UI图片
async function imgHandle (name = VARS.imgBase64Name) {
  sendMessage({ name, data: {
    base64: bg.getDiffImg(),
    opacityColorList: await bg.getOpacityColorList(),
    isColorReverse: bg.getCarpCheck(),
    isUseUISize: bg.getIsUseUISize()
  }}, () => {
    // 标尺
    sgCheckFn(bg.getSgCheck())
    // 透明度 opacity
    cpiFn()
    // 同步滚动
    followCheckFn(bg.getFollowScroll())
  })
}

// 向其他模块发送消息
function sendMessage (paramData, cb) {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, paramData, response => {
      console.log('popup _sendMessage_', response)
      cb && cb()
    })
  })
}

// 显示当前进行对比的 UI图片
function showPic () {
  if (!bg.getDiffImg()) return
  img.src = bg.getDiffImg()
  img.style.display = 'inline-block'
  // 交给 content.js 进行图像处理
  imgHandle()
}
