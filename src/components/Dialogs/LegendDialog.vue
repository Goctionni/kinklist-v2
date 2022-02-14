<template>
  <Dialog
    titleText="Edit ratings"
    @close="close()"
  >
    <div class="ratings-dialog-content">
      <p>
        <strong>Warning:</strong> Though you can edit the ratings and colors for kinklist,
        the current selection of colors was made to be distinguishable by people with
        colorblindness. Changing the used colors is therefor discouraged.
      </p>
      <div class="ratings-head">
        <h3>Ratings</h3>
        <button class="icon-button add-icon" @click="add()">
          <span class="sr-only tooltip">Add rating</span>
        </button>
      </div>
      <ul class="ratings">
        <li class="rating" v-for="(rating, i) in model" :key="`rating-${i}`">
          <label>
            Name
            <input type="text" v-model="model[i].name" placeholder="Name">
          </label>
          <label>
            Color
            <input type="text" v-model="model[i].color" placeholder="Color">
          </label>
          <button class="icon-button remove-icon remove-rating" @click="remove(i)">
            <span class="sr-only tooltip">Remove rating</span>
          </button>
        </li>
      </ul>
      <div class="actions">
        <button class="dialog-action" @click="close()">Cancel</button>
        <button class="dialog-action action-primary" @click="ok()">Ok</button>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Rating } from "@/types/ratings";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import Dialog from "./Dialog.vue";

@Component({
  components: {
    Dialog,
  },
})
export default class RatingDialog extends Vue {
  @Prop() ratings!: Rating[];

  model: Rating[] = [];

  @Watch('value', { immediate: true })
  updateModel(): void {
    this.model = this.ratings.map((r) => ({ ...r }));
  }

  remove(index: number): void {
    this.model.splice(index, 1);
  }

  add(): void {
    this.model.push({ name: '', color: '#000' });
  }

  close(): void {
    this.$emit('close', false);
  }

  ok(): void {
    this.$emit('close', this.model.map((r) => ({ ...r })).filter((r) => r));
  }
}
</script>

<style lang="scss" scoped>
.ratings-dialog-content {
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px;
  gap: 5px;
  width: 355px;
}

.ratings-head {
  display: flex;

  h3 {
    flex: 1;
  }

  .icon-button {
    width: 25px;
    height: 25px;
    outline: solid #060 1px;
    outline-offset: -1px;
    color: #090;

    &:hover {
      background-color: #CFC;
    }
  }
}

.ratings {
  display: flex;
  padding: 0;
  margin: 0;
  flex-direction: column;
  gap: .5em;
}

.rating {
  display: flex;
  padding: 0;
  margin: 0;
  gap: 5px;
  align-items: flex-end;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  align-items: stretch;
}

input {
  font-family: Arial;
  font-size: 16px;
  padding: .12em .2em;
  width: 150px;
  height: 25px;
  border: solid #666 1px;
}

.remove-rating {
  width: 25px;
  height: 25px;
  outline: solid #600 1px;
  outline-offset: -1px;
  color: #900;

  &:hover {
    background-color: #FCC;
  }
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
