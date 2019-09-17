export function log(args) {
  console.log(args)
}

export function px2rem(px) {
  const ratio = 375 / 10
  return px / ratio
}

export function realPx(px) {
  // 根据当前屏幕rem缩放比例获取真实像素值
  const maxWidth = window.innerWidth > 500 ? 500 : window.innerWidth
  return px * (maxWidth / 375)
}
