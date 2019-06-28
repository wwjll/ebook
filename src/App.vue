<template>
  <div id="app">
    <span class="test">ABCDEFG</span>
    <router-view/>
  </div>
</template>

<script>
  export default {}
  document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html')
    let fontSize = window.innerWidth / 10
    fontSize = fontSize > 50 ? 50 : fontSize
    html.style.fontSize = fontSize + 'px'
  })
</script>

<style lang="scss" scoped>
  @import "./assets/styles/global";
  .test{
    font-family: 'Days One';
    font-size: px2rem(20px);
    color: orange;
  }
</style>
