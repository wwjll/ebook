<template>
  <div class="shelf-item-category">
    <div class="shelf-item-category-list" v-if="data.itemList.length > 0">
      <div class="shelf-item-category-list-item" v-for="(item, index) in data.itemList" :key="index">
        <img :src="item.cover" alt="" class="shelf-item-category-list-item-img">
      </div>
    </div>
    <div class="shelf-item-category-bg" v-else>
      <span class="icon-book2"></span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ShelfItemCategory',
    props: {
      data: Object
    },
    mounted () {
      // console.log(this.data)
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-item-category {
    width: 100%;
    height: 100%;
    .shelf-item-category-list {
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: row wrap;
      align-content: flex-start;
      overflow: hidden;
      padding-top: px2rem(5);
      box-sizing: border-box;
      .shelf-item-category-list-item {
        flex: 0 0 33.33%;
        width: 33.33%;
        height: 33.33%;
        box-sizing: border-box;
        &:nth-child(3n+1){
          padding: 0 px2rem(2.5) px2rem(5) px2rem(5);
        }
        &:nth-child(3n+2){
          padding: 0 px2rem(2.5) px2rem(5) px2rem(2.5);
        }
        &:nth-child(3n+3){
          padding: 0 px2rem(5) px2rem(5) px2rem(2.5);
        }
        .shelf-item-category-list-item-img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .shelf-item-category-bg {
      width: 100%;
      height: 100%;
      color: #ccc;
      font-size: px2rem(30);
      @include center;
    }
  }
</style>
