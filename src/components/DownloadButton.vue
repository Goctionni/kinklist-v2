<template>
  <button @click="emitClick()">
    <span class="btn-text">Download</span>
  </button>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class DownloadButton extends Vue {
  emitClick(): void {
    this.$emit('click');
  }
}
</script>

<style lang="scss" scoped>
button {
  background-color: #246;
  color: #FFF;
  font-weight: bold;
  font-size: 18px;
  border: 0;
  width: 150px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-text {
  position: absolute;
}
</style>