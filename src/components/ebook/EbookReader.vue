<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div class="ebook-reader-mask"
          @click="onMaskClick"
          @touchmove="move"
          @touchend="moveEnd"
          @mousedown.left="onMouseEnter"
          @mousemove.left="onMouseMove"
          @mouseup.left="onMouseEnd"></div>
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
      // 1 - 鼠标进入
      // 2 - 鼠标进入后的移动
      // 3 - 鼠标从移动状态松手
      // 4 - 鼠标还原 (鼠标在遮罩层上但是什么都没做)
      onMouseEnd(e) {
        if (this.mouseState === 2) {
          this.setOffsetY(0)
          this.firstOffsetY = null
          this.mouseState = 3
        } else {
          this.mouseState = 4
        }
        const time = e.timeStamp - this.mouseStartTime
        if (time < 100) {
          // 这里是鼠标点击左键时有可能带有轻微的移动，这种情况要被视为还原状态，优化体验
          this.mouseState = 4
        }
        e.preventDefault()
        e.stopPropagation()
      },
      onMouseMove(e) {
        if (this.mouseState === 1) {
          this.mouseState = 2
        } else if (this.mouseState === 2) {
          let offsetY = 0
          if (this.firstOffsetY) {
            offsetY = e.clientY - this.firstOffsetY
            this.setOffsetY(offsetY)
          } else {
            this.firstOffsetY = e.clientY
          }
        }
        e.preventDefault()
        e.stopPropagation()
      },
      onMouseEnter(e) {
        this.mouseState = 1
        this.mouseStartTime = e.timeStamp
        e.preventDefault()
        e.stopPropagation()
      },
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
          // method: 'scrolled',
          // 阅读器阅读模式
          method: 'default'
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
        // 分页,每页显示多少字并实现分页算法
        this.book.ready.then(() => {
          // 粗略地计算每页字数
          return this.book.locations.generate(750 * this.innerWidth / 375 * (getFontSize(this.fileName) / 16))
        }).then(locations => {
          this.navigation.forEach(nav => {
            nav.pageList = []
          })
          // console.log(locations)
          locations.forEach(item => {
            // 分页算法，通过this.navigation中的每个item的item中截取[]中的内容
            // 与location中每一项的.href(A335279_1_En_BookFrontmatter_OnlinePDF.html)的内容一样
            // （这个内容就是要显示的html内容），来进行分页
            const loc = item.match(/\[.*\]!/)[0].slice(1, -2)
            this.navigation.forEach(nav => {
              if (nav.href) {
                const href = nav.href.match(/^(.*)\.html$/)[1]
                if (href === loc) {
                  nav.pageList.push(item)
                }
              }
            })
          })
          // console.log(this.navigation)
          this.currentPage = 1
          this.navigation.forEach((nav, index) => {
            if (index === 0) {
              // page字段定义了当前章节的起始页码
              nav.page = 1
            } else {
              nav.page = this.currentPage
            }
            this.currentPage += nav.pageList.length + 1
          })
          this.setPagelist(locations)
          this.setBookAvailable(true)
          // 分页完成后刷新位置，这样progress的值才不是null
          this.refreshLocation()
          // console.log(this.navigation)
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
