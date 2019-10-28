// eslint-disable-next-line no-extend-native
Array.prototype.pushWithoutDuplicate = function () {
  // 为数组定义一个无重复添加元素的方法
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    if (this.indexOf(arg) === -1) {
      this.push(arg)
    }
  }
}
