// 不写也行
// const express = require('express')
// const app = express()

// mockjs只能传递text文本，不能使用blob对象，传输对于资源类的接口模拟需要自定义
function mock(app, url, data) {
  // 自定义mock函数模拟，这个是express的方法
  app.get(url, (request, response) => {
    response.json(data)
  })
}

const homeData = require('./src/mock/bookHome')
const shelfData = require('./src/mock/bookShelf')
const listData = require('./src/mock/bookList')
const flatListData = require('./src/mock/bookFlatList')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer: {
    // proxy: {
    //   'http://localhost:8081/': {
    //     target: 'http://182.168.1.101',
    //     ws: true,
    //     changeOrigin: true
    //   }
    // },
    before(app) {
      mock(app, '/book/home', homeData)
      mock(app, '/book/shelf', shelfData)
      mock(app, '/book/list', listData)
      mock(app, '/book/flat-list', flatListData)
    }
  }
}
