<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
  import { ebookMixin } from '../../utils/mixin'
  import {
    getFontFamily,
    getFontSize,
    getTheme,
    saveFontFamily,
    saveFontSize,
    saveTheme
  } from '../../utils/localStorage'
  import Epub from 'epubjs'
  global.ePub = Epub
  export default {
    mixins: [ebookMixin],
    methods: {
      prevPage () {
        if (this.rendition) {
          this.rendition.prev()
          this.hideTitleAndMenu()
        }
      },
      nextPage () {
        if (this.rendition) {
          this.rendition.next()
          this.hideTitleAndMenu()
        }
      },
      toggleTitleAndMenu () {
        // console.log('menu and title')
        if (this.menuVisible) {
          this.setSettingVisible(-1)
          this.setFontFamilyVisible(false)
        }
        this.setMenuVisible(!this.menuVisible)
      },
      hideTitleAndMenu () {
        this.setMenuVisible(false)
        this.setSettingVisible(-1)
        this.setFontFamilyVisible(false)
      },
      initFontSize () {
        let fontSize = getFontSize(this.fileName)
        if (!fontSize) {
          saveFontSize(this.fileName, this.defaultFontSize)
        } else {
          this.rendition.themes.fontSize(fontSize)
          this.setDefaultFontSize(fontSize)
        }
      },
      initFontFamily () {
        let font = getFontFamily(this.fileName)
        if (!font) {
          saveFontFamily(this.fileName, this.defaultFontFamily)
        } else {
          this.rendition.themes.font(font)
          this.setDefaultFontFamily(font)
        }
      },
      initTheme () {
        let defaultTheme = getTheme(this.fileName)
        if (!defaultTheme) {
          defaultTheme = this.themeList[0].name
          this.setDefaultTheme(defaultTheme)
          // 这里必须是defaultTheme,要是this.defaultTheme则
          saveTheme(this.fileName, this.defaultTheme)
        }
        this.setDefaultTheme(defaultTheme)
        this.themeList.forEach(theme => {
          this.rendition.themes.register(theme.name, theme.style)
        })
        // 这里注意vuex的异步更新问题
        this.rendition.themes.select(defaultTheme)
      },
      initEpub () {
        const url = 'http://127.0.0.1:9001/epub/' +
          this.fileName + '.epub'
        this.book = new Epub(url)
        this.setCurrentBook(this.book)
        // this.setCurrentBook(this.book)
        this.rendition = this.book.renderTo('read', {
          width: innerWidth,
          height: innerHeight,
          // 微信兼容性设置
          method: 'default'
        })
        this.rendition.display().then(() => {
          this.initTheme()
          this.initFontSize()
          this.initFontFamily()
          this.initGlobalStyle()
        })
        this.rendition.on('touchstart', event => {
          // 获取一只手指的行为
          this.startX = event.changedTouches[0].clientX
          this.touchStartTime = event.timeStamp
        })
        this.rendition.on('touchend', event => {
          const offsetX = event.changedTouches[0].clientX - this.startX
          const time = event.timeStamp - this.touchStartTime
          if (time < 500 && offsetX > 40) {
            this.prevPage()
          } else if (time < 500 && offsetX < -40) {
            this.nextPage()
          } else {
            this.toggleTitleAndMenu()
          }
          // 禁止默认事件触发
          event.preventDefault()
          event.stopPropagation()
        })
        // epubjs勾子函数为电子书显示的iframe注入内容
        this.rendition.hooks.content.register(contents => {
          console.log(process.env.VUE_APP_RES_URL)
          Promise.all([
            // vue环境变量需要重启服务器生效
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
          ]).then(() => {})
        })
      }
    },
    mounted () {
      // TODO 判断 fileName
      const fileName = this.$route.params.fileName.split('|')
        .join('/')
      this.setFileName(fileName)
        .then(() => {
          this.initEpub()
        })
      }
    }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
</style>
