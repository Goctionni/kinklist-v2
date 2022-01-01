<template>
  <section>
    <h2>
      <button v-if="editMode" aria-label="Remove category" title="Remove category" @click="removeCategory()"></button>
      <input type="text" v-model.lazy="category.name" :disabled="!editMode" />
    </h2>
    <table class="category">
      <thead>
        <tr>
          <th v-for="(subcategory, index) in category.subcategories" :key="`sub:${index}`">
            <button v-if="editMode" class="remove-party" @click="removeSubcategory(subcategory)" :aria-label="`Remove participant: ${subcategory}`" :title="`Remove participant: ${subcategory}`"></button>
            <input type="text" v-model.lazy="subcategories[index]" :disabled="!editMode" />
          </th>
          <th colspan="2">
            <button
              v-if="editMode"
              class="add-party"
              @click="addSubcategory()"
              aria-label="Add participant"
              title="Add participant"
            >
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="kink in category.kinks" :key="`kink:${kink.name}`">
          <td v-for="(_, subcategory) in kink.ratings" :key="`kink:${kink.name}-sub:${subcategory}`">
            <div class="rating-wrapper">
              <div class="radio-container" v-for="rating in ratings" :key="`kink:${kink.name}-sub:${subcategory}-${rating.name}`" :style="{ '--color': rating.color }">
                <input
                  type="radio"
                  :value="rating.name"
                  v-model="kink.ratings[subcategory]"
                  :name="`${category.name}-kink:${kink.name}-sub:${subcategory}`"
                  :id="`${category.name}-kink:${kink.name}-sub:${subcategory}-${rating.name}`"
                  :disabled="!editMode"
                >
                <label :for="`${category.name}-kink:${kink.name}-sub:${subcategory}-${rating.name}`"></label>
              </div>
            </div>
          </td>
          <td class="kink-name">
            <input type="text" v-model.lazy="kink.name" :disabled="!editMode" />
          </td>
          <td class="remove-kink" v-if="editMode">
            <button aria-label="Remove kink" @click="removeKink(kink)">Remove</button>
          </td>
          <td class="comment" v-else>
            <div v-if="!kink.comment">
              <button v-if="!kink.comment" @click="addComment(kink)">Add comment</button>
            </div>
            <div v-else>
              <span>Comment:</span>
              <button @click="addComment(kink)">View</button>
              <button @click="removeComment(kink)">Remove</button>
            </div>
          </td>
        </tr>
        <tr v-if="editMode">
          <td :colspan="category.subcategories.length + 2" class="add-kink-row">
            <button @click="addKink()">Add Kink</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import { Kink, KinkCategory } from '@/types/kinks'
import { Rating } from '@/types/ratings';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { showDialog } from './Dialogs/dialog';
import CommentDialog from './Dialogs/CommentDialog.vue';

@Component
export default class extends Vue {
    @Prop() category!: KinkCategory;
    @Prop() ratings!: Rating[];
    @Prop() editMode!: boolean;
    subcategories: string[] = [];

    @Watch('category.subcategories', { deep: true, immediate: true })
    updateSubcategoriesModel(): void {
      this.subcategories = [...this.category.subcategories];
    }

    removeCategory(): void {
      this.$emit('removeCategory');
    }

    @Watch('subcategories', { deep: true })
    subcategoryUpdated(newValue: string[]): void {
      // only emit events here for edit, we deal with add and remove separately
      if (newValue.length === this.category.subcategories.length) {
        const changedIndex = newValue.findIndex((name, index) => this.category.subcategories[index] !== name);
        this.$emit('renameSubcategory', {
          oldName: this.category.subcategories[changedIndex],
          newName: newValue[changedIndex],
        });
      }
    }

    addSubcategory(): void {
      this.$emit('addSubcategory');
    }

    removeSubcategory(name: string): void {
      this.$emit('removeSubcategory', name);
    }

    addKink(): void {
      this.$emit('addKink');
    }

    removeKink(kink: Kink): void {
      this.$emit('removeKink', kink);
    }

    async addComment(kink: Kink): Promise<void> {
      await showDialog(CommentDialog, { category: this.category, kink });
      if (!kink.comment?.trim()) {
        this.removeComment(kink);
      }
    }

    removeComment(kink: Kink): void {
      this.$set(kink, 'comment', undefined);
    }
}
</script>

<style scoped lang="scss">
input[type="radio"] {
  display: none;
}

input[type="text"] {
  border: 0;
  padding: 0;
  margin: 0;
  font-size: inherit;
  width: 100%;
  height: 100%;
  border-radius: 0;
  background: transparent;
}

table {
  border-spacing: 0;
  width: 100%;
}
th {
  padding: 4px;
  background-color: #666;
  color: #FFF;
  text-align: left;

  &:last-child {
    width: 100%;
  }
}
td {
  padding: 4px;
  border-top: solid #000 1px;
  border-left: solid #000 1px;

  &.kink-name {
    width: 100%;
  }

  &:last-child {
    border-right: solid #000 1px;
  }
}

tr:last-child td {
  border-bottom: solid #000 1px;
}

div.radio-container {
  display: inline-block;
}

.remove-party {
  position: relative;
  border: 0;
  background-color: #F99;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  vertical-align: middle;
  cursor: pointer;

  &:hover {
    background-color: #F00;

    &::before,
    &::after {
      background-color: #FFF;
    }
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 10px;
    left: 2px;
    top: 6px;
    background-color: #633;
  }
}

.comment {
  white-space: nowrap;
  border-left: 0;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 12px;

  > div {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: .25em;
    width: 100%;
  }

  button {
    margin: 0;
    font-size: 12px;
    cursor: pointer;
    background: linear-gradient(#efefef, #dfdfdf);
    border-radius: 4px;
    border: solid #ccc 1px;

    &:hover {
      background: linear-gradient(#ffffff, #efefef);
    }
  }
}

.add-party {
  position: relative;
  border: 0;
  background-color: #9F9;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  vertical-align: middle;
  cursor: pointer;

  &:hover {
    background-color: #090;

    &::before,
    &::after {
      background-color: #FFF;
    }
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 10px;
    top: 2px;
    left: 6px;
    background-color: #363;
  }

  &::after {
    transform: rotate(90deg);
  }
}

th input[type="text"] {
  width: calc(100% - .3em - 14px);
  color: #FFF;
  margin-left: .3em;
}


label {
  position: relative;
  display: block;
  width: 15px;
  height: 15px;
  cursor: pointer;

  &::before,
  &::after {
    content: '';
    position: absolute;
    display: block;
    inset: 0;
    border-radius: 50%;
  }

  &::before {
    background-color: var(--color);
    opacity: .35;
  }

  &::after {
    border: solid rgba(0, 0, 0, .5) 1px;
  }

  &:hover {
    &::before {
      opacity: .7;
    }
    &::after {
      border: solid #000 2px;
    }
  }
}

input:checked + label {
  &::before {
    opacity: 1;
  }

  &::after {
    border: solid #000 2px;
  }
}

.remove-kink,
.add-kink-row {
  padding: 0;

  button {
    border: 0;
    width: 100%;
    height: 26px;
    color: #000;
    background: #CCC;
    cursor: pointer;

    &:hover {
      background: #DDD;
    }
  }
}

.rating-wrapper {
  display: flex;
  gap: 4px;
}

h2 {
  display: flex;
  align-items: center;
  margin-block-end: .25em;
  gap: .25em;

  input[type="text"] {
    flex: 1;
    padding: 0 .25em;
  }

  button {
    position: relative;
    display: flex;
    background-color: #F00;
    border-radius: 4px;
    border: 0;
    font-size: inherit;
    width: 1em;
    height: 1em;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: calc(100% - 4px);
      height: 4px;
      background-color: #FFF;
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }
  }
}
</style>