<template>
  <Dialog
    :titleText="title"
    @close="close()"
  >
    <div class="prompt-dialog-content">
      <div class="prompt-body">
        <label for="PromptInput">{{ inputLabel }}</label>
        <input id="PromptInput" type="text" ref="input" v-model="model" @keydown.enter="ok()">
      </div>
      <div class="actions">
        <button class="dialog-action" @click="close()">Cancel</button>
        <button class="dialog-action action-primary" @click="ok()">Ok</button>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import Dialog from "./Dialog.vue";

@Component({
  components: {
    Dialog,
  },
})
export default class PromptDialog extends Vue {
  @Prop() title!: string;
  @Prop() inputLabel!: string;
  @Prop() value!: string;

  model = '';

  @Watch('value', { immediate: true })
  updateModel(): void {
    this.model = this.value;
  }

  close(): void {
    this.$emit('close', false);
  }

  ok(): void {
    this.$emit('close', this.model);
  }

  mounted(): void {
    (this.$refs.input as HTMLTextAreaElement)?.focus();
  }
}
</script>

<style lang="scss" scoped>
.prompt-dialog-content {
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px;
  width: 300px;
  gap: 5px;

}

.prompt-body {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  padding: .25em 0;
}

input {
  font-family: Arial;
  font-size: 16px;
  padding: .25em .5em;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .4em;
}

.dialog-action {
  padding: .35em .7em;
  background-color: #FFF;
  border: solid rgba(0, 0, 0, .2) 1px;
  font-size: 16px;

  &:hover {
    border: solid rgba(0, 0, 0, .4) 1px;
  }

  &.action-primary {
    background-color: #246;
    color: #FFF;
    font-weight: bold;

    &:hover {
      background-color: #369;
    }
  }
}
</style>
