<template>
  <div class="store-shelf">
    <shelf-title :title="$t('shelf.title')"></shelf-title>
    <scroll class="store-shelf-scroll-wrapper"
            :top="0"
            :bottom="scrollBottom"
            @onScroll="onScroll"
            ref="scroll">
      <shelf-search></shelf-search>
      <shelf-list :data="shelfList"></shelf-list>
    </scroll>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
  import ShelfTitle from '../../components/shelf/ShelfTitle'
  import ShelfSearch from '../../components/shelf/ShelfSearch'
  import ShelfList from '../../components/shelf/ShelfList'
  import ShelfFooter from '../../components/shelf/ShelfFooter'
  import Scroll from '../../components/common/Scroll'
  import { storeShelfMixin } from '../../utils/mixin'
  import { realPx } from '../../utils/utils'

  export default {
    name: 'StoreShelf',
    mixins: [ storeShelfMixin ],
    components: {
      ShelfTitle,
      ShelfSearch,
      ShelfList,
      ShelfFooter,
      Scroll
    },
    data() {
      return {
        scrollBottom: 0
      }
    },
    watch: {
      isEditMode(isEditMode) {
        this.scrollBottom = isEditMode ? realPx(48) : 0
        this.$nextTick(() => {
          // isEditMode值产生变化时有dom的变化(显示footer)，所以等dom渲染完毕再refresh
          this.$refs.scroll.refresh()
        })
      }
    },
    methods: {
      onScroll(offsetY) {
        this.setOffsetY(offsetY)
      }
    },
    created() {
      this.getShelfList()
      this.setShelfCategory([])
      this.setCurrentType(1)
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .store-shelf {
    position: relative;
    width: 100%;
    height: 100%;
    background: white;
    .store-shelf-scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 101;
    }
  }
</style>
