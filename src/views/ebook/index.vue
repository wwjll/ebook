<template>
  <div class="ebook" ref="ebook">
    <ebook-reader></ebook-reader>
    <ebook-title></ebook-title>
    <ebook-menu></ebook-menu>
    <ebook-bookmark></ebook-bookmark>
  </div>
</template>

<script>
  import EbookReader from '../../components/ebook/EbookReader'
  import EbookTitle from '../../components/ebook/EbookTitle'
  import EbookMenu from '../../components/ebook/EbookMenu'
  import EbookBookmark from '../../components/ebook/EbookBookmark'
  import { getReadTime, saveReadTime } from '../../utils/localStorage'
  // 许多公共属性与方法定义在mixin中，如果没引入会有undefined的值，localStorage中的undefined-info
  import { ebookMixin } from '../../utils/mixin'
  // import { log } from '../../utils/convience'
  export default {
    mixins: [ ebookMixin ],
    components: {
      EbookReader,
      EbookTitle,
      EbookMenu,
      EbookBookmark
    },
    watch: {
      offsetY(v) {
        if (!this.menuVisible && this.bookAvailable) {
          if (v > 0) {
            this.move(v)
          } else if (v === 0) {
            this.restore()
          }
        }
      }
    },
    methods: {
      restore() {
        this.$refs.ebook.style.top = 0
        this.$refs.ebook.style.transition = 'all .2s linear'
        setTimeout(() => {
          this.$refs.ebook.style.transition = ''
        }, 200)
      },
      move(v) {
        this.$refs.ebook.style.top = v + 'px'
      },
      startLoopReadTime() {
        // 记录阅读时间
        let readTime = getReadTime(this.fileName)
        if (!readTime) {
          readTime = 0
        }
        this.task = setInterval(() => {
          readTime++
          if (readTime % 30 === 0) {
            saveReadTime(this.fileName, readTime)
            // log(getReadTime(this.fileName))
          }
        }, 1000)
      }
    },
    mounted() {
      this.startLoopReadTime()
    },
    beforeDestroy () {
      // 清除定时任务
      if (this.task) {
        clearInterval(this.task)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/global";
  .ebook {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 100;
  }
</style>
