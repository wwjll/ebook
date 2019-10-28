<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div class="shelf-footer-tab-wrapper" v-for="item in tabs" :key="item.index" @click="onTabClick(item)">
      <div class="shelf-footer-tab" :class="{'is-selected': isSelected}">
        <div class="icon-private tab-icon" v-if="item.index === 1 && !isPrivate"></div>
        <div class="icon-private-see tab-icon" v-if="item.index === 1 && isPrivate"></div>
        <div class="icon-download tab-icon" v-if="item.index === 2 && !isDownload"></div>
        <div class="icon-download-remove tab-icon" v-if="item.index === 2 && isDownload"></div>
        <div class="icon-move tab-icon" v-if="item.index === 3"></div>
        <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
        <div class="tab-text" :class="{'remove-text': item.index === 4}">{{label(item)}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { storeShelfMixin } from '../../utils/mixin'
  import { saveBookShelf, setLocalStorage } from '../../utils/localStorage'
  import { download } from '../../api/store'
  import { removeLocalForage } from '../../utils/localForage'

  export default {
    mixins: [storeShelfMixin],
    computed: {
      isSelected () {
        return this.shelfSelected && this.shelfSelected.length > 0
      },
      tabs () {
        return [
          {
            label: this.$t('shelf.private'),
            label2: this.$t('shelf.noPrivate'),
            index: 1
          },
          {
            label: this.$t('shelf.download'),
            label2: this.$t('shelf.delete'),
            index: 2
          },
          {
            label: this.$t('shelf.move'),
            index: 3
          },
          {
            label: this.$t('shelf.remove'),
            index: 4
          }
        ]
      },
      isPrivate() {
        // 判断tab1是私密阅读还是关闭私密阅读
        if (!this.isSelected) {
          return false
        } else {
          return this.shelfSelected.every(item => item.private)
        }
      },
      isDownload() {
        if (!this.isSelected) {
          return false
        } else {
          return this.shelfSelected.every(item => item.cache)
        }
      }
    },
    data() {
      return {
        popupMenu: null
      }
    },
    methods: {
      hidePopup() {
        this.popupMenu.hide()
      },
      onComplete() {
        // 弹窗按钮点击处理的公共方法
        this.hidePopup()
        this.setIsEditMode(false)
        saveBookShelf(this.shelfList) // shelfSelected的元素都是引用自shelfList
      },
      setPrivate() {
        // 把当前选中的图书设置为私密阅读
        // 当前选中图书如果都是私密的就显示关闭私密阅读，如果有一本不是就私密阅读
        // 注意this.isPrivate是当shelfSelected全部元素private为true的时候为true才是true,意为是否显示私密阅读
        // 注意computed属性只能通过getter，setter来改变值
        // let isPrivate
        // if (this.isPrivate) {
        //   isPrivate = false
        // } else {
        //   isPrivate = true
        // }
        this.shelfSelected.forEach(book => {
          book.private = !this.isPrivate
        })
        this.onComplete()
        if (this.isPrivate) {
          this.simpletoast(this.$t('shelf.setPrivateSuccess'))
        } else {
          this.simpletoast(this.$t('shelf.closePrivateSuccess'))
        }
      },
      showPrivate() {
        // 第一个tab的弹窗
        this.popupMenu = this.popup({
          title: this.isPrivate ? this.$t('shelf.closePrivateTitle') : this.$t('shelf.setPrivateTitle'),
          btn: [
            {
              text: this.isPrivate ? this.$t('shelf.close') : this.$t('shelf.open'),
              click: () => {
                this.setPrivate()
              }
            },
            {
              text: this.$t('shelf.cancel'),
              click: () => {
                this.hidePopup()
              }
            }
          ]
        }).show()
      },
      downloadBook(book) {
        let text = ''
        const toast = this.toast({
          text
        })
        toast.continueShow()
        return new Promise((resolve, reject) => {
          download(book, () => {
            // 成功回调销毁toast实例（因为text已经存在所以该toast实例不会销毁）
            // 以下simpletoast才可以重新实例化
            toast.remove()
            resolve()
          }, reject, progressEvent => {
            const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
            const text = this.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
            toast.updateText(text)
          })
        })
      },
      async downloadSelectedBook() {
        // 这段代码里面也有异步调用，所以也加上async-await保证同步
        for (let i = 0; i < this.shelfSelected.length; i++) {
          await this.downloadBook(this.shelfSelected[i])
            .then(() => {
              this.shelfSelected[i].cache = true
            })
        }
      },
      removeBook(book) {
        return new Promise((resolve, reject) => {
          setLocalStorage(`${book.categoryText}/${book.fileName}-info`)
          removeLocalForage(`${book.fileName}`)
          resolve(book)
        })
      },
      removeSelectedBook() {
        // 这边显然是三条同步语句，不用Promise也是可以的
        this.shelfSelected.map(book => this.removeBook(book))
        this.shelfSelected.map(book => { book.cache = false })
        // Promise.all(
        //   this.shelfSelected.map(book => this.removeBook(book))
        // ).then(books => {
        //   // console.log(books)
        //   books.map(book => { book.cache = false })
        // })
      },
      async setDownload() {
        this.onComplete()
        if (this.isDownload) {
          this.removeSelectedBook()
          this.simpletoast(this.$t('shelf.removeDownloadSuccess'))
          saveBookShelf(this.shelfList)
        } else {
          // 保证下载成功后再弹出下载完成
          await this.downloadSelectedBook()
          saveBookShelf(this.shelfList)
          this.simpletoast(this.$t('shelf.setDownloadSuccess'))
        }
      },
      showDownload() {
        // 第二个tab的弹窗
        this.popupMenu = this.popup({
          title: this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle'),
          btn: [
            {
              text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.open'),
              click: () => {
                this.setDownload()
              }
            },
            {
              text: this.$t('shelf.cancel'),
              click: () => {
                this.hidePopup()
              }
            }
          ]
        }).show()
      },
      removeSelected() {
        this.shelfSelected.forEach(selected => {
          this.setShelfList(this.shelfList.filter(book => book !== selected))
        })
        this.setShelfSelected([])
        this.onComplete()
      },
      showRemove() {
        let title
        if (this.shelfSelected.length === 1) {
          title = this.$t('shelf.removeBookTitle').replace('$1', `${this.shelfSelected[0].title}`)
        } else {
          title = this.$t('shelf.removeBookTitle').replace('$1', this.$t('shelf.selectedBooks'))
        }
        this.popupMenu = this.popup({
          title: title,
          btn: [
            {
              text: this.$t('shelf.removeBook'),
              type: 'danger',
              click: () => {
                this.removeSelected()
              }
            },
            {
              text: this.$t('shelf.cancel'),
              click: () => {
                this.hidePopup()
              }
            }
          ]
        }).show()
      },
      onTabClick(item) {
        if (!this.isSelected) {
          return
        }
        switch (item.index) {
          case 1:
            this.showPrivate()
            break
          case 2:
            this.showDownload()
            break
          case 3:
            this.dialog().show()
            break
          case 4:
            this.showRemove()
            break
        }
        this.label(item)
      },
      label(item) {
        switch (item.index) {
          case 1:
            return this.isPrivate ? item.label2 : item.label
          case 2:
            return this.isDownload ? item.label2 : item.label
          default:
            return item.label
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: px2rem(48);
    background: white;
    box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, .1);
    display: flex;
    z-index: 120;
    .shelf-footer-tab-wrapper {
      flex: 1;
      width: 25%;
      height: 100%;
      .shelf-footer-tab {
        width: 100%;
        height: 100%;
        opacity: .5;
        @include columnCenter;
        &.is-selected {
          opacity: 1;
        }
        .tab-icon {
          font-size: px2rem(20);
          color: #666;
        }
        .tab-text {
          margin-top: px2rem(5);
          font-size: px2rem(12);
          color: #666;
          &.remove-text {
            color: $color-pink;
          }
        }
        .icon-shelf {
          color: $color-pink;
        }
      }
    }
  }
</style>
