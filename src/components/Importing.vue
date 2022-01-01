<template>
  <main>
    <p>Importing data from Imgur</p>
    <span class="loading-indicator"></span>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Importing extends Vue {
}
</script>

<style lang="scss" scoped>
main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1em;
}

p {
  font-size: 3rem;
}

.loading-indicator {
  --size: min(30vh, min(200px, 30vw));
  --borderSize: max(2px, calc(var(--size) / 10));
  width: var(--size);
  height: var(--size);
  border: solid transparent var(--borderSize);
  border-top-color: #000;
  border-radius: 50%;
  animation: linear spin 1s infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>