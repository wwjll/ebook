import CreateAPI from 'vue-create-api'
import Vue from 'vue'
import Toast from '../components/common/Toast'
import PopUp from '../components/common/PopUp'
import GroupDialog from '../components/shelf/ShelfGroupDialog'

Vue.use(CreateAPI)
Vue.createAPI(Toast, true)

Vue.createAPI(Toast, true)
Vue.createAPI(PopUp, true)
Vue.createAPI(GroupDialog, true)
Vue.mixin({
  methods: {
    toast(setting) {
      return this.$createToast({
        $props: setting
      })
    },
    popup(setting) {
      return this.$createPopUp({
        $props: setting
      })
    },
    simpletoast(text) {
      const toast = this.toast({
        text: text
      })
      toast.show()
      toast.updateText(text)
      setTimeout(() => {
        toast.remove()
      }, 1500)
    },
    dialog(settings) {
      return this.$createGroupDialog({
        $props: settings
      })
    }
  }
})
