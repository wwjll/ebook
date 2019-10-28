<template>
  <transition class="fade">
    <div class="shelf-title"
         :class="{'hide-shadow':ifHideShadow}"
         v-show="shelfTitleVisible">
      <div class="shelf-title-text-wrapper">
        <div class="shelf-title-text">{{title}}</div>
        <div class="shelf-title-text-sub-text" v-show="isEditMode">{{selectedText}}</div>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showClear">
        <span class="shelf-title-btn-text" @click="clearCache">{{$t('shelf.clearCache')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-right" v-if="showEdit">
        <span class="shelf-title-btn-text" @click="onEditClick">
          {{ isEditMode ? $t('shelf.cancel') : $t('shelf.edit')}}
        </span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showBack">
        <span class="icon-back" @click="back">
        </span>
      </div>
      <div class="shelf-title-btn-wrapper"
           :class="{'shelf-title-left': changeGroupLeft, 'shelf-title-right': changeGroupRight}" @click="changeGroup"
           v-if="showChangeGroup">
        <span class="shelf-title-btn-text">{{$t('shelf.editGroup')}}</span>
      </div>
    </div>
  </transition>
</template>

<script>
  import { storeShelfMixin } from '../../utils/mixin'
  import { clearLocalForage } from '../../utils/localForage'
  import { clearLocalStorage, saveBookShelf } from '../../utils/localStorage'
  export default {
    name: 'ShelfTitle',
    mixins: [storeShelfMixin],
    data() {
      return {
        ifHideShadow: true
      }
    },
    props: {
      title: String
    },
    watch: {
      offsetY() {
        if (this.offsetY > 0) {
          this.ifHideShadow = false
        } else {
          this.ifHideShadow = true
        }
      }
    },
    computed: {
      emptyCategory() {
        return !this.shelfCategory || !this.shelfCategory.itemList || this.shelfCategory.itemList.length === 0
      },
      showEdit() {
        return this.currentType === 1 || !this.emptyCategory
      },
      showClear() {
        return this.currentType === 1
      },
      showBack() {
        return this.currentType === 2 && !this.isEditMode
      },
      showChangeGroup() {
        return this.currentType === 2 && (this.isEditMode || this.emptyCategory)
      },
      changeGroupLeft() {
        return !this.emptyCategory
      },
      changeGroupRight() {
        return this.emptyCategory
      },
      selectedText() {
        const selectedNumber = this.shelfSelected ? this.shelfSelected.length : 0
        return selectedNumber <= 0 ? this.$t('shelf.selectBook') : (selectedNumber === 1 ? this.$t('shelf.haveSelectedBook').replace('$1', selectedNumber) : this.$t('shelf.haveSelectedBooks').replace('$1', selectedNumber))
      },
      popupCancelBtn() {
        return this.createPopupBtn(this.$t('shelf.cancel'), () => {
          this.hidePopup()
        })
      }
    },
    methods: {
      onComplete() {
        this.hidePopup()
        this.setShelfList(this.shelfList.filter(book =>
          book.id !== this.shelfCategory.id)).then(() => {
            saveBookShelf(this.shelfList)
            this.$router.go(-1)
            this.setIsEditMode(false)
        })
      },
      deleteGroup() {
        if (!this.emptyCategory) {
          this.setShelfSelected(this.shelfCategory.itemList)
          this.moveOutOfGroup(this.onComplete)
        } else {
          this.onComplete()
        }
      },
      changeGroupName() {
        // 修改分组名称
        this.hidePopup()
        this.dialog({
          showNewGroup: true,
          groupName: this.shelfCategory.title
        }).show()
      },
      hidePopup() {
        this.popupMenu.hide()
      },
      createPopupBtn(text, onClick, type = 'normal') {
        return {
          text: text,
          type: type,
          click: onClick
        }
      },
      showDeleteGroup() {
        this.hidePopup()
        setTimeout(() => {
          this.popupMenu = this.popup({
            title: this.$t('shelf.deleteGroupTitle'),
            btn: [
              this.createPopupBtn(this.$t('shelf.confirm'), () => {
                this.deleteGroup()
              }, 'danger'),
              this.popupCancelBtn
            ]
          }).show()
        }, 200)
      },
      changeGroup() {
        // 修改分组
        this.popupMenu = this.popup({
          btn: [
            this.createPopupBtn(this.$t('shelf.editGroupName'), () => {
              this.changeGroupName()
            }),
            this.createPopupBtn(this.$t('shelf.deleteGroup'), () => {
              this.showDeleteGroup()
            }, 'danger'),
            this.popupCancelBtn
          ]
        }).show()
      },
      back() {
        this.$router.go(-1)
        this.setIsEditMode(false)
      },
      onEditClick() {
        if (!this.isEditMode) {
          // 取消的时候清空选中列表
          this.setShelfSelected([])
          this.shelfList.forEach(item => {
            item.selected = false
            if (item.itemList) {
                item.itemList.forEach(subItem => {
                  subItem.selected = false
              })
            }
          })
        }
        this.setIsEditMode(!this.isEditMode)
      },
      clearCache() {
        clearLocalStorage()
        clearLocalForage()
        this.setShelfList([])
        this.getShelfList()
        this.simpletoast(this.$t('shelf.clearCacheSuccess'))
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-title {
    position: relative;
    width: 100%;
    height: px2rem(42);
    background: white;
    z-index: 130;
    box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, 0.1);
    &.hide-shadow {
      box-shadow: none;
    }
    .shelf-title-text-wrapper {
      position: absolute;
      width: 100%;
      height: px2rem(42);
      left: 0;
      top: 0;
      box-sizing: border-box;
      @include columnCenter;
      .shelf-title-text {
        font-size: px2rem(16);
        line-height: px2rem(20);
        font-weight: bold;
        color: #333;
      }
      .shelf-title-text-sub-text {
        font-size: px2rem(10);
        color: #666;
      }
    }
    .shelf-title-btn-wrapper {
      position: absolute;
      top: 0;
      box-sizing: border-box;
      .shelf-title-btn-text {
        font-size: px2rem(14);
        color: #666;
      }
      .icon-back {
        font-size: px2rem(20);
        color: #666;
      }
      &.shelf-title-left {
        left: 0;
        padding-left: px2rem(15);
      }
      &.shelf-title-right {
        right:0;
        padding-right: px2rem(15);
      }
    }
  }
</style>
