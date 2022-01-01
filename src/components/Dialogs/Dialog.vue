<template>
  <div class="dialog-container">
    <div class="dialog-backdrop" v-if="hasBackdrop"></div>
    <div class="dialog">
      <div class="dialog-title">
        <h2>{{ titleText }}</h2>
        <button v-if="closeable" class="dialog-close hide-text" @click="$emit('close')">Close dialog</button>
      </div>
      <div class="dialog-body">
        <slot />
      </div>
      <div v-if="buttons" class="dialog-footer">
        <button
          v-for="button in dialogButtons"
          :key="button.text"
          :class="button.class"
          @click="$emit(button.text.toLowerCase())"
        >
          {{ button.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

interface DialogButton {
  text: string;
  class: string;
}

@Component
export default class Dialog extends Vue {
  @Prop({ default: true }) hasBackdrop!: boolean;
  @Prop({ default: true }) closeable!: boolean;
  @Prop({ required: true }) titleText!: string;
  @Prop({ required: false }) buttons!: string[];

  get dialogButtons(): DialogButton[] {
    return this.buttons ? this.buttons.map((text): DialogButton => {
      if (text[0] === '!') {
        return { text: text.slice(1), class: 'dialog-button dialog-button--primary' };
      } else {
        return {  text, class: 'dialog-button' };
      }
    }) : [];
  }
}
</script>


<style lang="scss" scoped>
.dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: .7;
}

.dialog {
  position: relative;
  max-height: calc(100vh - 60px);
  min-width: 260px;
  max-width: 800px;
  background-color: #eee;
}

.dialog-title {
  display: flex;
  padding: 10px;

  h2 {
    flex: 1;
    padding: 0;
    margin: 0;
    padding-right: 1.5em;
    font-size: 28px;
    line-height: 28px;
  }

  .dialog-close {
    position: relative;
    width: 28px;
    height: 28px;
    background-color: #E66;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    cursor: pointer;

    &:hover {
      background-color: #D33;
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      height: 3px;
      width: calc(100% - 7px);
      background-color: #EEE;
      transform: rotate(45deg);
    }

    &::before {
      transform: rotate(-45deg);
    }
  }
}
</style>