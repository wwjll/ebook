<template>
  <div class="ebook" ref="ebook">
    <ebook-title></ebook-title>
    <ebook-header></ebook-header>
    <ebook-reader></ebook-reader>
    <ebook-footer></ebook-footer>
    <ebook-menu></ebook-menu>
    <ebook-bookmark></ebook-bookmark>
  </div>
</template>

<script>
  import EbookTitle from '../../components/ebook/EbookTitle'
  import EbookHeader from '../../components/ebook/EbookHeader'
  import EbookReader from '../../components/ebook/EbookReader'
  import EbookFooter from '../../components/ebook/EbookFooter'
  import EbookMenu from '../../components/ebook/EbookMenu'
  import EbookBookmark from '../../components/ebook/EbookBookmark'
  import { getReadTime, saveReadTime } from '../../utils/localStorage'

  import { ebookMixin } from '../../utils/mixin'
  export default {
    mixins: [ ebookMixin ],
    components: {
      EbookTitle,
      EbookHeader,
      EbookReader,
      EbookFooter,
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
        // 清除动画，实现顺畅体验
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
