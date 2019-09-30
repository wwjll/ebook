import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/ebook'
    },
    {
      path: '/ebook',
      component: () => import('./views/ebook/index.vue'),
      children: [
        {
          path: ':fileName',
          component: () => import('./components/ebook/EbookReader.vue')
        }
      ]
    },
    {
      path: '/store',
      redirect: '/store/home',
      component: () => import('./views/store/index.vue'),
      children: [
        {
          path: 'home',
          component: () => import('./views/store/StoreHome.vue')
        }
      ]
    }
  ]
})
