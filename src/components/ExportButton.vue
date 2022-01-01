<template>
  <button @click="emitClick()">
    <transition name="slide">
      <span class="btn-text" :key="`btn-text-${loading}`">{{ loading ? 'Uploading' : 'Export' }}</span>
    </transition>
    <svg v-if="loading" viewBox="0 0 150 37"><rect rx="2" /></svg>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ExportButton extends Vue {
  @Prop() loading!: boolean;

  emitClick(): void {
    if (!this.loading) {
      this.$emit('click');
    }
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

svg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

rect {
  width: calc(100%);
  height: calc(100%);
  fill: transparent;
  stroke-width: 10px;
  stroke: #FFF;
  stroke-dasharray: 30 150;
  stroke-linecap: round;
  animation: dashoffset 1.75s linear infinite, pulse .75s infinite;
  filter: blur(3.5px);
}

@keyframes dashoffset {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 360;
  }
}

@keyframes pulse {
  10% {
    opacity: 1;
  }
  60% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.slide-enter-active, .slide-leave-active {
  transition: all .35s;
}
.slide-enter {
  opacity: 0;
  transform: translateY(-50%);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(50%);
}
</style>