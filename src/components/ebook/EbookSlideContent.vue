<template>
  <div class="ebook-slide-content">
    <div class="slide-content-search-wrapper">
      <div class="slide-content-search-input-wrapper">
        <div class="slide-content-search-icon">
          <span class="icon-search"></span>
        </div>
        <input type="text"
               class="slide-content-search-input"
               :placeholder="$t('book.searchHint')"
               v-model="searchText"
               @keyup.enter="search()"
               @click="showSearchPage()">
      </div>
      <div class="slide-content-search-cancel"
            v-if="searchVisible"
            @click="hideSearchPage()">
        {{$t('book.cancel')}}
      </div>
    </div>
    <div class="slide-content-book-wrapper" v-show="!searchVisible">
      <div class="slide-content-book-img-wrapper">
        <img :src="cover" class="slide-content-book-img">
      </div>
      <div class="slide-content-book-info-wrapper">
        <div class="slide-content-book-title">
          {{metadata.title}}
        </div>
        <div class="slide-content-book-author">
          {{metadata.creator}}
        </div>
      </div>
      <div class="slide-content-book-progress-wrapper">
        <div class="slide-content-book-progress">
          <span class="progress">{{progress + '%'}}</span>
          <span class="progress-text">{{$t('book.haveRead2')}}</span>
        </div>
        <div class="slide-content-book-read-time">{{getReadTimeText()}}</div>
      </div>
    </div>
    <scroll class="slide-content-list"
            :top="156"
            :bottom="48"
            ref="scroll"
            v-show="!searchVisible">
      <div class="slide-content-item"
           v-for="(item, index) in navigation"
           :key="index">
        <span class="slide-content-item-label"
              :style="contentItemStyle(item)"
              :class="{ 'selected': section === index}"
              @click="displayContent(item.href)">{{ item.label }}</span>
        <span class="slide-content-item-page"></span>
      </div>
    </scroll>
    <scroll class="slide-search-list"
            :top ="66"
            :bottom="48"
            v-show="searchVisible">
      <div  class="slide-search-item"
            v-for="(item, index) in searchList"
            :key="index"
            v-html="item.excerpt"
            @click="displayContent(item.cfi, true)">
      </div>
    </scroll>
  </div>
</template>

<script>
  import { ebookMixin } from '../../utils/mixin'
  import Scroll from '../common/Scroll'
  import { px2rem } from '../../utils/utils'
  export default {
    name: 'EbookSlideContent',
    mixins: [ebookMixin],
    components: {
      Scroll
    },
    data() {
      return {
        searchVisible: false,
        searchText: '',
        searchList: null
      }
    },
    methods: {
      search() {
        // 搜索内容不能为空，否则检索所有字符
        if (this.searchText && this.searchText.length > 0) {
          this.doSearch(this.searchText).then(
            list => {
              this.style = 'background-color:red'
              this.searchList = list
              this.searchList.map(item => {
                // 在摘要中高亮显示搜索内容
                // TODO v-html中的css注入失败，深层注入器不能用scss,思路是通过行内选择器直接写入
                // ``称为模板字符串
                item.excerpt = item.excerpt.replace(this.searchText,
                  `<span class="highlight" style=${this.style}>${this.searchText}</span>`)
                // return item
              })
            })
        }
      },
      doSearch(query) {
        return Promise.all(
          // spine.spineItems就是section
          this.currentBook.spine.spineItems.map(
            section => section.load(this.currentBook.load.bind(this.currentBook))
              .then(section.find.bind(section, query))
              .finally(section.unload.bind(section))) // 释放内存
        ).then(results => Promise.resolve([].concat.apply([], results)))
      },
      displayContent(target, highlight = false) {
        this.display(target, () => {
          this.hideTitleAndMenu()
          if (highlight) {
            this.currentBook.rendition.annotations.highlight(target)
          }
        })
      },
      showSearchPage() {
        this.searchVisible = true
      },
      hideSearchPage() {
        this.searchVisible = false
        this.searchText = ''
        this.searchList = null
      },
      contentItemStyle(item) {
        // 多级目录缩进
        return {
          marginLeft: `${px2rem(item.level * 15)}rem`
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .ebook-slide-content {
  width:100%;
    font-size: 0;
    .slide-content-search-wrapper {
      display: flex;
      width: 100%;
      height: px2rem(36);
      margin: px2rem(20) 0 px2rem(10) 0;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .slide-content-search-input-wrapper {
        border: px2rem(1) solid gray;
        flex: 1;
        @include center;
        .slide-content-search-icon {
          flex: 0 0 px2rem(28);
          font-size: px2rem(12);
          @include center;
        }
        .slide-content-search-input {
          flex: 1;
          width: 100%;
          height: px2rem(32);
          font-size: px2rem(14);
          background: transparent;
          border: none;
          &:focus {
            outline: none;
          }
        }
      }
      .slide-content-search-cancel {
        flex: 0 0 px2rem(50);
        font-size: px2rem(14);
        font-weight: bold;
        @include right;
      }
    }
    .slide-content-book-wrapper{
      display: flex;
      width: 100%;
      height: px2rem(90);
      padding: px2rem(10) px2rem(15) px2rem(20) px2rem(15);
      .slide-content-book-img-wrapper{
        flex:0 0 px2rem(45);
        .slide-content-book-img{
          width: px2rem(45);
          height: px2rem(60);
        }
      }
      .slide-content-book-info-wrapper{
        padding: 0 px2rem(10);
        box-sizing: border-box;
        .slide-content-book-title{
          /*375*0.85-30-20-45-70=153.75*/
          width: px2rem(153.75);
          font-size: px2rem(16);
          @include ellipsis2(2);
        }
        .slide-content-book-author{
          width: px2rem(153.75);
          @include ellipsis;
          margin-top: px2rem(5);
          font-size:px2rem(12);
        }
      }
      .slide-content-book-progress-wrapper{
        flex: 0 0 px2rem(70);
        .slide-content-book-progress{
          .progress{
            font-size: px2rem(14)
          }
          .progress-text{
            font-size: px2rem(12);
          }
        }
        .slide-content-book-read-time{
          font-size: px2rem(12);
        }
      }
    }
    .slide-content-list {
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .slide-content-item {
        display: flex;
        padding: px2rem(15) 0;
        box-sizing: border-box;
        .selected {
          font-weight: bold;
        }
        .slide-content-item-label {
          flex: 1;
          font-size: px2rem(14);
          line-height: px2rem(16);
          @include ellipsis;
        }
        .slide-content-item-page {
          flex: 0 0 px2rem(30);
          font-size: px2rem(10);
          @include right;
        }
      }
    }
    .slide-search-list {
      width: 100%;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .slide-search-item {
        font-size: px2rem(14);
        line-height: px2rem(16);
        padding: px2rem(20) 0;
        box-sizing: border-box;
        >>> .highlight {
          background-color: red!important;
        }
      }
    }
  }
</style>
