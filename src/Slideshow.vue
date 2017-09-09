<template>
  <div>
    <p>Slideshow {{photos}}</p>
    <button @click="add('c')">add</button>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState(['photos'])
  },
  methods: {
    ...mapMutations(['add'])
  }
}
</script>

<style scoped>
</style>
