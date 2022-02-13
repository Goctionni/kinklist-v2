<template>
  <section class="kink-category">
    <header>
      <h2>{{ category.name }}</h2>
      <button class="add-icon add-kink icon-button" @click="addKink()">
        <span class="sr-only tooltip">Add Kink</span>
      </button>
      <button class="edit-icon edit-category icon-button" @click="editCategory()">
        <span class="sr-only tooltip">Edit category</span>
      </button>
      <button class="remove-icon remove-category icon-button" @click="removeCategory()">
        <span class="sr-only tooltip">Remove category</span>
      </button>
    </header>
    <div class="category-kinks">
      <Kink
        v-for="kink in category.kinks"
        :key="`${category.id}-${kink.id}`"
        :kink="kink"
        :category="category"
        :ratings="ratings"
        @remove="removeKink(kink)"
        class="kink-item"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { InKink, InKinkCategory } from '@/types/kinks'
import { Rating } from '@/types/ratings';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { showDialog } from './Dialogs/dialog';
import CommentDialog from './Dialogs/CommentDialog.vue';
import EditCategoryDialog from './Dialogs/EditCategoryDialog.vue';
import Kink from './Kink.vue';

@Component({
  components: {
    Kink,
  },
})
export default class extends Vue {
    @Prop() category!: InKinkCategory;
    @Prop() ratings!: Rating[];
    subcategories: string[] = [];

    @Watch('category.subcategories', { deep: true, immediate: true })
    updateSubcategoriesModel(): void {
      this.subcategories = [...this.category.subcategories];
    }

    async editCategory(): Promise<void> {
      type CategoryModalResult = false | Pick<InKinkCategory, "name" | "subcategories">;
      const result: CategoryModalResult = await showDialog(EditCategoryDialog, {
        category: this.category,
      });
      if (!result) return;

      this.category.name = result.name;
      type Ratings = Record<string, string>;
      this.category.kinks = this.category.kinks.map((kink): InKink => {
        return {
          ...kink,
          ratings: result.subcategories.reduce((ratings, subcategory): Ratings => {
            return {
              ...ratings,
              [subcategory]: kink.ratings[subcategory] || this.ratings[0].name
            };
          }, {}),
        }
      });
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

    removeKink(kink: InKink): void {
      this.$emit('removeKink', kink);
    }

    async addComment(kink: InKink): Promise<void> {
      await showDialog(CommentDialog, { category: this.category, kink });
      if (!kink.comment?.trim()) {
        this.removeComment(kink);
      }
    }

    removeComment(kink: InKink): void {
      this.$set(kink, 'comment', undefined);
    }
}
</script>

<style scoped lang="scss">
.kink-category {
  background-color: #FFF;
  border-radius: 3px;
  padding: .5em;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%), 0 1px 2px rgb(0 0 0 / 24%);
}

header {
  display: flex;
  align-items: center;
  gap: .2em;
}

h2 {
  flex: 1;
}

button {
  width: 30px;
  aspect-ratio: 1;
  border: 0;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, .1);
  }
}

.category-kinks {
  display: flex;
  flex-direction: column;
  gap: .25em;
  padding: .25em .25em 0;
}

.add-kink {
  outline: solid rgba(0, 128, 0, .5) 1px;
  outline-offset: -1px;
  filter: saturate(0);
  color: #090;

  &:hover {
    filter: saturate(1);
  }
}

.edit-category {
  outline: solid rgba(0, 0, 228, .4) 1px;
  outline-offset: -1px;
  filter: saturate(0);
  color: #00C;

  &:hover {
    filter: saturate(1);
  }
}

.remove-category {
  outline: solid rgba(228, 0, 0, .4) 1px;
  outline-offset: -1px;
  filter: saturate(0);
  color: #C00;

  &:hover {
    filter: saturate(1);
  }
}
</style>
