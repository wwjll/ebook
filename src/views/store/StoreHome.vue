<template>
  <div class="store-home">
    <search-bar></search-bar>
    <flap-card :data="random"></flap-card>
    <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll">
      <div class="banner-wrapper">
        <div class="banner-img" :style="{backgroundImage:`url('${banner}')`}"></div>
      </div>
      <guess-you-like :data="guessYouLike"></guess-you-like>
      <recommend :data="recommend" class="recommend"> </recommend>
      <featured class="featured"
                :data="featured"
                :title-text="$t('home.featured')"
                :btn-text="$t('home.seeAll')"></featured>
      <div class="category-list-wrapper" v-for="(item, index) in categoryList" :key="index">
        <category-book :data="item"></category-book>
      </div>
      <category class="categories" :data="categories"></category>
    </scroll>
  </div>
</template>

<script>
  import SearchBar from '../../components/home/SearchBar'
  import FlapCard from '../../components/home/FlapCard'
  import Scroll from '../../components/common/Scroll'
  import GuessYouLike from '../../components/home/GuessYouLike'
  import Recommend from '../../components/home/Recommend'
  import Featured from '../../components/home/Featured'
  import CategoryBook from '../../components/home/CategoryBook'
  import Category from '../../components/home/Category'
  import { home } from '../../api/store'
  import { storeHomeMixin } from '../../utils/mixin'
  export default {
    name: 'StoreHome',
    mixins: [storeHomeMixin],
    data() {
      return {
        scrollTop: 94,
        random: null,
        banner: null,
        guessYouLike: null,
        recommend: null,
        featured: null,
        categoryList: null,
        categories: null
      }
    },
    components: {
      SearchBar,
      Scroll,
      FlapCard,
      GuessYouLike,
      Recommend,
      Featured,
      CategoryBook,
      Category
    },
    methods: {
      // 处理滚动事件
      onScroll(offsetY) {
        // 设置vuex的offsetY
        // SearchBar组件会进行监听
        this.setOffsetY(offsetY)
        if (offsetY > 0) {
          // 如果滚动超过0，则隐藏标题，滚动条距顶部为52像素
          this.scrollTop = 52
        } else {
          // 如果滚动为0，则显示标题，滚动条距顶部为94像素
          this.scrollTop = 94
        }
        // 刷新滚动条
        this.$refs.scroll.refresh()
      }
    },
    mounted () {
      home().then(response => {
        const data = response.data
        const randomIndex = Math.floor(Math.random() * data.random.length)
        this.random = data.random[randomIndex]
        this.banner = data.banner
        this.guessYouLike = data.guessYouLike
        this.recommend = data.recommend
        this.featured = data.featured
        this.categoryList = data.categoryList
        this.categories = data.categories
        // console.log(data)
      })
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .store-home {
    width:100%;
    height: 100%;
    .banner-wrapper {
      width:100%;
      padding: px2rem(10);
      box-sizing: border-box;
      .banner-img {
        width:100%;
        height: px2rem(140);
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
    }
    .recommend {
      margin-top: px2rem(20);
    }
    .featured {
      margin-top: px2rem(20);
    }
    .category-list-wrapper {
      margin-top: px2rem(20);
    }
    .categories {
      margin-top: px2rem(20);
    }
  }
</style>
