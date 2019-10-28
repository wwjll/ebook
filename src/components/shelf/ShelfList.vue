<template>
  <div class="shelf-list" :style="{top: ShelfListTop}">
    <transition-group name="list"
                      id="shelf-list"
                      tag="div">
      <div class="shelf-list-item-wrapper"
           v-for="item in data" :key="item.id">
        <shelf-item :data="item"
                    :style="{height: itemHeight}"></shelf-item>
        <div class="shelf-list-title-wrapper">
          <span class="shelf-list-title title-small">{{item.title}}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
  import { storeShelfMixin } from '../../utils/mixin'
  import ShelfItem from './ShelfItem'
  import { px2rem, realPx } from '../../utils/utils'
  export default {
    name: 'ShelfList',
    props: {
      top: {
        type: Number,
        default: 94
      },
      data: Array
    },
    mixins: [storeShelfMixin],
    components: {
      ShelfItem
    },
    computed: {
      itemHeight() {
        // h = w * 350/250
        // 减掉padding再三等分
        return ((window.innerWidth - realPx(120)) / 3) / 250 * 350 + 'px'
      },
      ShelfListTop() {
        return px2rem(this.top) + 'rem'
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-list {
    position: absolute;
    left: 0;
    width: 100%;
    #shelf-list {
      display: flex;
      flex-flow: row wrap;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      width: 100%;
      .shelf-list-item-wrapper {
        &.list-leave-active {
          display: none;
        }
        &.list-move {
          transition: transform .5s;
        }
        padding: px2rem(15) px2rem(15);
        box-sizing: border-box;
        flex: 0 0 33.33%;
        width: 33%;
      }
    }
  }
</style>
