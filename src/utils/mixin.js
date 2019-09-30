// 使用频次高的公共方法
import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, removeAllCss, getReadTimeByMinute } from './book'
import { getBookmark, saveLocation } from './localStorage'

export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize',
      'defaultFontFamily',
      'fontFamilyVisible',
      'defaultTheme',
      'bookAvailable',
      'progress',
      'section',
      'isPaginating',
      'currentBook',
      'navigation',
      'cover',
      'metadata',
      'paginate',
      'pagelist',
      'offsetY',
      'isBookmark',
      'currentThemeColor'
    ]),
    themeList () {
      return themeList(this)
    },
    getSectionName() {
      // if (this.section) {
      //   const sectionInfo = this.currentBook.section(this.section)
      //   if (sectionInfo && sectionInfo.href && this.currentBook && this.currentBook.navigation) {
      //     // 章节的名称
      //     return this.currentBook.navigation.get(sectionInfo.href).label
      //   }
      // }
      // return ''
      return this.section ? this.navigation[this.section].label : ''
    }
  },
  methods: {
    ...mapActions([
      'setFileName',
      'setMenuVisible',
      'setSettingVisible',
      'setDefaultFontSize',
      'setDefaultFontFamily',
      'setFontFamilyVisible',
      'setDefaultTheme',
      'setBookAvailable',
      'setProgress',
      'setSection',
      'setIsPaginating',
      'setCurrentBook',
      'setNavigation',
      'setCover',
      'setMetadata',
      'setPaginate',
      'setPagelist',
      'setOffsetY',
      'setIsBookmark',
      'setCurrentThemeColor'
    ]),
    initGlobalStyle () {
      removeAllCss()
      switch (this.defaultTheme) {
        case 'Default':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          // console.log(process.env.VUE_APP_RES_URL)
          break
        case 'Eye':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
          break
        case 'Gold':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
          break
        case 'Night':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
          break
        default:
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
      }
    },
    refreshLocation() {
      // 刷新并保存当前阅读进度
      const currentLocation = this.currentBook.rendition.currentLocation() // 获取当前位置的定位
      // 用百分比来作为页面的定位
      if (currentLocation && currentLocation.start) {
        const StarCfi = currentLocation.start.cfi
        const progress = this.currentBook.locations.percentageFromCfi(StarCfi)
        this.setProgress(Math.floor(progress * 100))
        this.setSection(currentLocation.start.index)
        saveLocation(this.fileName, StarCfi)
        const bookmark = getBookmark(this.fileName)
        if (bookmark) {
          if (bookmark.some(item => item.cfi === StarCfi)) {
            this.setIsBookmark(true)
          } else {
            this.setIsBookmark(false)
          }
        } else {
          this.setIsBookmark(false)
        }
        if (this.pagelist) {
          // 页脚信息设置
          const totalPage = this.pagelist.length
          // epubjs框架计算的页码值不精确，页脚信息用百分比进度比较准确
          const currentPage = currentLocation.start.location
          if (currentPage && currentPage > 0) {
            this.setPaginate(currentPage + ' / ' + totalPage)
          } else {
            this.setPaginate('')
          }
        } else {
          this.setPaginate('')
        }
      }
    },
    display(target, callback) {
      // 自定义，抽象display方法
      if (target) {
        this.currentBook.rendition.display(target).then(() => {
          this.refreshLocation()
          if (callback) { callback() }
        })
      } else {
        this.currentBook.rendition.display().then(() => {
          this.refreshLocation()
          if (callback) { callback() }
        })
      }
    },
    hideTitleAndMenu () {
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    },
    getReadTimeText() {
      return this.$t('book.haveRead').replace('$1', getReadTimeByMinute(this.fileName))
    }
  }
}
export const storeHomeMixin = {
  computed: {
    ...mapGetters([
      'offsetY',
      'hotSearchOffsetY',
      'flapCardVisible'
    ])
  },
  methods: {
    ...mapActions([
      'setOffsetY',
      'setHotSearchOffsetY',
      'setFlapCardVisible'
    ]),
    showBookDetail(book) {
      gotoBookDetail(this, book)
    }
  }
}
