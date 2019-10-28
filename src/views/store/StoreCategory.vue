<template>
  <div class="store-shelf">
    <shelf-title :title="shelfCategory.title"></shelf-title>
    <scroll class="store-shelf-scroll-wrapper"
            :top="0"
            :bottom="scrollBottom"
            @onScroll="onScroll"
            ref="scroll"
            v-if="ifShowList">
      <shelf-list :top="42"
                  :data="shelfCategory.itemList"></shelf-list>
    </scroll>
    <div class="store-shelf-empty-view" v-else>{{$t('shelf.groupNone')}}</div>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
  import ShelfTitle from '../../components/shelf/ShelfTitle'
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
    computed: {
      ifShowList() {
        return this.shelfCategory.itemList &&
          this.shelfCategory.itemList.length > 0
      }
    },
    methods: {
      onScroll(offsetY) {
        this.setOffsetY(offsetY)
      }
    },
    created() {
      this.getCategoryList(this.$route.query.title)
      this.setCurrentType(2)
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
    .store-shelf-empty-view {
      position: absolute;
      width: 100%;
      height: 100%;
      font-size: px2rem(14);
      color: #333;
      @include center;
    }
  }
</style>
