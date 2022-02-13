<template>
  <Dialog
    :titleText="`Comment for ${category.name}: ${kink.name}`"
    @close="close()"
  >
    <div class="comment-dialog-content">
      <textarea ref="textarea" v-model="kink.comment" />
    </div>
  </Dialog>
</template>

<script lang="ts">
import { InKink, InKinkCategory } from "@/types/kinks";
import { Component, Emit, Prop, Vue } from "vue-property-decorator";

import Dialog from "./Dialog.vue";

@Component({
  components: {
    Dialog,
  },
})
export default class CommentDialog extends Vue {
  @Prop() category!: InKinkCategory;
  @Prop() kink!: InKink;

  @Emit()
  close(): void { /* Event emitted */ }

  mounted(): void {
    (this.$refs.textarea as HTMLTextAreaElement)?.focus();
  }
}
</script>

<style lang="scss" scoped>
.comment-dialog-content {
  padding: 10px;

  textarea {
    width: max(100%, 400px);
    height: 100px;
    font-family: Arial;
    font-size: 16px;
  }
}
</style>
