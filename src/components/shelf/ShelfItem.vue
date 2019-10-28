<template>
  <div class="shelf-item"
       :class="{'shelf-item-shadow': data.type === 1 || data.type === 2}"
        @click="OnItemClick">
    <component  class="shelf-item-comp"
                :is="item"
                :data = data
                :class="{'is-edit': data.type === 2 && isEditMode }"
                >
    </component>
    <span class="icon-selected"
          :class="{'is-selected': data.selected}"
          v-show="data.type === 1 && isEditMode"></span>
  </div>
</template>

<script>
  import ShelfItemBook from './ShelfItemBook'
  import ShelfItemAdd from './ShelfItemAdd'
  import ShelfItemCategory from './ShelfItemCategory'
  import { storeShelfMixin } from '../../utils/mixin'
  import { gotoStoreHome } from '../../utils/store'
  export default {
    name: 'ShelfItem',
    props: {
      data: Object
    },
    mixins: [storeShelfMixin],
    data() {
      return {
        book: ShelfItemBook,
        category: ShelfItemCategory,
        add: ShelfItemAdd
      }
    },
    computed: {
      item() {
        return this.data.type === 1 ? this.book : (this.data.type === 2 ? this.category : this.add)
      }
    },
    methods: {
      OnItemClick() {
        if (this.isEditMode) {
          this.data.selected = !this.data.selected
          if (this.data.selected) {
            // 选中添加图书进入选中列表
            this.shelfSelected.pushWithoutDuplicate(this.data)
          } else {
            // 从选中列表中删除
            this.setShelfSelected(this.shelfSelected.filter(item => item.id !== this.data.id))
          }
        } else {
          if (this.data.type === 1) {
            this.showBookDetail(this.data)
          } else if (this.data.type === 2) {
            this.$router.push({
              path: '/store/category',
              query: {
                title: this.data.title
              }
            })
          } else {
            gotoStoreHome(this)
          }
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-item {
    width: 100%;
    height: 100%;
    z-index: 150;
    position: relative;
    &.shelf-item-shadow {
      box-shadow: px2rem(2) px2rem(2) px2rem(6) px2rem(2) rgba(200, 200, 200, .3);
    }
    .shelf-item-comp {
      opacity: 1;
      &.is-edit {
        opacity: 0.5;
      }
    }
    .icon-selected {
      position: absolute;
      color: rgba(0, 0, 0, 0.4);
      font-size: px2rem(18);
      right: px2rem(2);
      bottom: px2rem(2);
      &.is-selected {
        color: $color-blue;
      }
    }
  }
</style>
