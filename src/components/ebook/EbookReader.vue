<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div class="ebook-reader-mask"
          @click="onMaskClick"
          @touchmove="move"
          @touchend="moveEnd"></div>
  </div>
</template>

<script>
  import { ebookMixin } from '../../utils/mixin'
  import { flattern } from '../../utils/book'
  import { log } from '../../utils/utils'
  import {
    getFontFamily,
    getFontSize,
    getTheme,
    saveFontFamily,
    saveFontSize,
    saveTheme,
    getLocation
  } from '../../utils/localStorage'
  import Epub from 'epubjs'
  global.ePub = Epub
  export default {
    mixins: [ebookMixin],
    methods: {
      move(e) {
        // 值关注下拉的距离
        let offsetY = 0
        if (this.firstOffsetY) {
          offsetY = e.changedTouches[0].clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        } else {
          this.firstOffsetY = e.changedTouches[0].clientY
        }
        e.preventDefault()
        e.stopPropagation()
      },
      moveEnd() {
        this.setOffsetY(0)
        this.firstOffsetY = null
      },
      onMaskClick(e) {
        const offsetX = e.offsetX
        const width = window.innerWidth
        if (offsetX > 0 && offsetX < width * 0.3) {
          this.prevPage()
        } else if (offsetX > width * 0.7 && offsetX < width) {
          this.nextPage()
        } else {
          this.toggleTitleAndMenu()
        }
      },
      showSetting (key) {
        this.setSettingVisible(key)
      },
      prevPage () {
        if (this.rendition) {
          this.rendition.prev().then(() => {
            this.refreshLocation()
          })
          this.hideTitleAndMenu()
        }
      },
      nextPage () {
        if (this.rendition) {
          this.rendition.next().then(() => {
            this.refreshLocation()
          })
          this.hideTitleAndMenu()
        }
      },
      toggleTitleAndMenu () {
        // console.log('menu and title')
        if (this.menuVisible) {
          this.setFontFamilyVisible(false)
          this.showSetting(-1)
        }
        this.setMenuVisible(!this.menuVisible)
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
      initRendition () {
        this.rendition = this.book.renderTo('read', {
          width: innerWidth,
          height: innerHeight,
          method: 'default' // 微信兼容性设置
        })
        const location = getLocation(this.fileName)
        this.display(location, () => {
          this.initTheme()
          this.initFontSize()
          this.initFontFamily()
          this.initGlobalStyle()
        })
        // epubjs勾子函数为电子书显示的iframe注入内容
        this.rendition.hooks.content.register(contents => {
          // console.log(process.env.VUE_APP_RES_URL)
          Promise.all([
            // 电子书显示添加字体
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
          ]).then(() => {
          })
        })
      },
      // initGesture () {
      //   this.rendition.on('touchstart', event => {
      //     // 获取第一只手指的行为
      //     this.startX = event.changedTouches[0].clientX
      //     this.touchStartTime = event.timeStamp
      //   })
      //   this.rendition.on('touchend', event => {
      //     const offsetX = event.changedTouches[0].clientX - this.startX
      //     const time = event.timeStamp - this.touchStartTime
      //     if (time < 500 && offsetX > 40) {
      //       this.prevPage()
      //     } else if (time < 500 && offsetX < -40) {
      //       this.nextPage()
      //     } else {
      //       this.toggleTitleAndMenu()
      //     }
      //     // 禁止默认事件触发
      //     event.preventDefault()
      //     event.stopPropagation()
      //   })
      // },
      initPage() {
        // 分页,每页显示多少字
        this.book.ready.then(() => {
          // 粗略地计算每页字数
          return this.book.locations.generate(750 * this.innerWidth / 375 * (getFontSize(this.fileName) / 16))
        }).then(() => {
          // console.log(location)
          this.setBookAvailable(true)
          // 分页完成后刷新位置，这样progress的值才不是null
          this.refreshLocation()
        })
      },
      parseBook() {
        // 加载封面后生成blob格式的url并赋给vuex
        this.book.loaded.cover.then(cover => {
          this.book.archive.createUrl(cover).then(url => {
            this.setCover(url)
          })
        })
        // 加载书籍信息后赋值给vuex
        this.book.loaded.metadata.then(metadata => {
          this.setMetadata(metadata)
        })
        //
        this.book.loaded.navigation.then(nav => {
          const NavItem = flattern(nav.toc)
          function find (item, level = 0) {
            // 一级一级往上找到level，每次找加一次level，递归出口是往上找到item.parent为undefined的节点
            return !item.parent ? level : find(NavItem.filter(parentItem => parentItem.id === item.parent)[0], ++level)
          }
          NavItem.forEach(item => {
            // 写入每个章节的层级
            item.level = find(item)
          })
          this.setNavigation(NavItem)
        })
      },
      initEpub () {
        const url = 'http://127.0.0.1:9001/epub/' +
          this.fileName + '.epub'
        this.book = new Epub(url)
        this.setCurrentBook(this.book)
        this.initRendition()
        // this.initGesture()
        this.initPage()
        this.parseBook()
      }
    },
    mounted () {
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
  .ebook-reader {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .ebook-reader-mask {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 150;
      top:0;
      left:0;
      background: transparent;
    }
  }
</style>
