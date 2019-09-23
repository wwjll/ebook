<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {}
  // DOM加载完毕后设置字体
  document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html')
    let fontSize = window.innerWidth / 10
    // 移动端设置字体最大50px
    fontSize = fontSize > 50 ? 50 : fontSize
    html.style.fontSize = fontSize + 'px'
  })
</script>

<style lang="scss" scoped>
  #app {
    background: #7d8188;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
