<template>
  <div class="store-home">
    <search-bar></search-bar>
    <flap-card></flap-card>
  </div>
</template>

<script>
  import SearchBar from '../../components/home/SearchBar'
  import FlapCard from '../../components/home/FlapCard'
  export default {
    name: 'StoreHome',
    components: {
      SearchBar,
      FlapCard
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .store-home {
    width:100%;
    height: 100%;
  }
</style>
