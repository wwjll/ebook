<template>
  <div class="ebook">
    <ebook-title></ebook-title>
    <ebook-reader></ebook-reader>
    <ebook-menu></ebook-menu>
  </div>
</template>

<script>
  import EbookReader from '../../components/ebook/EbookReader'
  import EbookTitle from '../../components/ebook/EbookTitle'
  import EbookMenu from '../../components/ebook/EbookMenu'
  import { getReadTime, saveReadTime } from '../../utils/localStorage'
  // 许多公共属性与方法定义在mixin中，如果没引入会有undefined的值，localStorage中的undefined-info
  import { ebookMixin } from '../../utils/mixin'
  // import { log } from '../../utils/convience'
  export default {
    mixins: [ ebookMixin ],
    components: {
      EbookReader,
      EbookTitle,
      EbookMenu
    },
    methods: {
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
</style>
