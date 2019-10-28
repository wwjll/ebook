<template>
    <div class="popup" v-if="popupVisible">
      <transition name="fade">
        <div class="popup-bg"
             v-show="popupVisible"
             @click.stop.prevent="hide"></div>
      </transition>
      <transition name="popup-slide-up">
        <div class="popup-wrapper" v-show="visible">
          <div class="popup-title" v-if="title && title.length > 0">
            {{title}}
          </div>
          <div class="popup-btn"
               :class="{'danger': item.type ==='danger'}"
               v-for="(item, index) in btn"
               :key="index"
               @click="item.click">
            {{item.text}}
          </div>
        </div>
      </transition>
    </div>
</template>

<script>
  export default {
    // 注意dom的渲染过程，给两段transition内容加v-show才能触发动画
    // 利用setTimeout延迟等待popup-wrapper部分的过渡动画播放完成后再操作
    name: 'PopUp',
    props: {
      title: String,
      btn: Array
    },
    data() {
      return {
        popupVisible: false,
        visible: false
      }
    },
    methods: {
      show() {
        setTimeout(() => {
          // 由于setTimeout是宏任务，会先把 =true后同个事件周期内的事情执行完（包括过渡动画），所以这里不用写时间参数
          this.popupVisible = true
        })
        this.visible = true
      },
      hide() {
        this.visible = false
        setTimeout(() => {
          this.popupVisible = false
        }, 200)
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .4);
    .popup-bg {
      width: 100%;
      height: 100%;
    }
    .popup-wrapper {
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 2000;
      width: 100%;
      background: white;
      .popup-title {
        width: 100%;
        height: px2rem(44);
        border-bottom: px2rem(1) solid #eee;
        font-size: px2rem(12);
        line-height: px2rem(14);
        padding: px2rem(15);
        box-sizing: border-box;
        color: #999;
        @include center;
      }
      .popup-btn {
        width: 100%;
        height: px2rem(60);
        border-bottom: px2rem(1) solid #eee;
        font-size: px2rem(16);
        color: #666;
        font-weight: bold;
        @include center;
        &.danger {
          color: $color-pink;
        }
      }
    }
  }
</style>
