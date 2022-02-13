<template>
  <section class="kink-item">
    <header class="kink-head">
      <h3>{{ kink.name }}</h3>
    </header>
    <div class="kink-ratings">
      <div class="kink-rating" v-for="subcategory in category.subcategories" :key="subcategory">
        <div class="subcategory-text" v-if="category.subcategories.length > 1">{{ subcategory }}</div>
        <div class="rating-wrapper">
          <div
            v-for="rating in ratings"
            :key="`kink:${kink.name}-sub:${subcategory}-${rating.name}`"
            :style="{ '--color': rating.color }"
            class="radio-container"
          >
            <label
              :class="{ active: kink.ratings[subcategory] === rating.name }"
            >
              <input
                v-model="kink.ratings[subcategory]"
                :value="rating.name"
                :name="`${category.name}-kink:${kink.name}-sub:${subcategory}`"
                type="radio"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="kink-actions">
      <button @click="edit()" class="icon-button edit-icon">
        <span class="sr-only tooltip">Edit Kink</span>
        <span class="icon-edit"></span>
      </button>
      <button @click="remove()" class="icon-button remove-icon">
        <span class="sr-only tooltip">Remove Kink</span>
        <span class="icon-remove"></span>
      </button>
    </div>
    <div class="comment-action">
      <button @click="addComment()" class="icon-button">
        <span class="sr-only tooltip">
          <template v-if="!kink.comment">Add Comment</template>
          <template v-else>View/Edit/Remove Comment</template>
        </span>
        <span :class="{ 'icon-comment': true, 'has-comment': kink.comment}">
          <span></span>
        </span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { InKink, InKinkCategory } from "@/types/kinks";
import { Rating } from "@/types/ratings";
import { Vue, Component, Prop } from "vue-property-decorator";
import { showDialog } from "./Dialogs/dialog";
import CommentDialog from "./Dialogs/CommentDialog.vue";
import PromptDialog from "./Dialogs/PromptDialog.vue";

@Component
export default class Kink extends Vue {
  @Prop() kink!: InKink;
  @Prop() category!: InKinkCategory;
  @Prop() ratings!: Rating[];

  async edit(): Promise<void> {
    const result: false | string = await showDialog(PromptDialog, {
      title: 'Edit kink',
      inputLabel: 'Kink name:',
      value: this.kink.name,
    });
    if (result !== false) {
      if (!result) this.remove();
      else this.kink.name = result;
    }
  }

  remove(): void {
    this.$emit("remove");
  }

  async addComment(): Promise<void> {
    await showDialog(CommentDialog, { category: this.category, kink: this.kink });
    if (!this.kink.comment?.trim()) {
      this.removeComment();
    }
  }

  removeComment(): void {
    this.$set(this.kink, "comment", undefined);
  }
}
</script>

<style scoped lang="scss">
.kink-item {
  display: grid; 
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 5px 5px; 
  grid-template-areas: 
    "name actions"
    "ratings comment"; 
  padding: .25em 0;
  position: relative;
  isolation: isolate;

  &:hover::before {
    content: '';
    position: absolute;
    z-index: -1;
    background-color: rgba(0, 0, 0, .1);
    inset: -.1em -.75em -.3em;
    border-top: solid rgba(0, 0, 0, .1) 1px;
    border-bottom: solid rgba(0, 0, 0, .1) 1px;
    pointer-events: none;
  }
}

header {
  display: flex;
  grid-area: name;
  align-items: center;
  gap: .2em;
}

header h3 {
  flex: 1;
  font-size: 17px;
}

.kink-ratings {
  display: flex;
  gap: 1.5em;
  grid-area: ratings;
}

input[type="radio"] {
  display: none;
}

.kink-rating {
  display: flex;
  flex-direction: column;
  padding-left: 0.4em;
  border-radius: 6px;
  gap: .2em;
}

.rating-wrapper {
  display: flex;
  gap: 4px;
}

.rating-wrapper label {
  position: relative;
  display: block;
  width: 15px;
  height: 15px;
  cursor: pointer;

  &::before,
  &::after {
    content: "";
    position: absolute;
    display: block;
    inset: 0;
    border-radius: 50%;
  }

  &::before {
    background-color: var(--color);
    opacity: 0.35;
  }

  &::after {
    border: solid rgba(0, 0, 0, 0.5) 1px;
  }

  &:hover {
    &::before {
      opacity: 0.7;
    }
    &::after {
      border: solid #000 2px;
    }
  }
}

.radio-container label.active {
  &::before {
    opacity: 1;
  }

  &::after {
    border: solid #000 2px;
  }
}

.kink-item .kink-actions .icon-button {
  opacity: 0;
}
.kink-item:hover .kink-actions .icon-button {
  opacity: 1;
}

.kink-actions {
  grid-area: actions;
  display: flex;
  gap: .1em;

  .icon-button {
    width: 20px;
    height: 20px;
  }

  .edit-icon {
    color: #FFF;
    background-color: #36C;
    border-radius: 25%;
  }
  .remove-icon {
    color: #FFF;
    background-color: #F66;
    border-radius: 25%;
  }
}

.kink-item:hover .comment-action button .icon-comment {
  opacity: 0.5;
}
.kink-item .comment-action button .icon-comment {
  &:hover,
  &.has-comment {
    opacity: 1;
  }
}

.comment-action {
  grid-area: comment;
  display: flex;
  align-items: center;
  justify-content: center;

  button {
    width: 35px;
    height: 35px;
    padding: 0;
    border-radius: 50%;

    .icon-comment {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 35px;
      height: 35px;
      opacity: 0;

      &::before {
        content: '';
        position: absolute;
        background-color: #FFF;
        width: 29px;
        height: 19px;
        border-radius: 100%;
        left: 3px;
        top: 6px;
        border: solid #000 1px;
      }

      &::after {
        content: '';
        position: absolute;
        background-color: #FFF;
        width: 7px;
        height: 10px;
        top: 16px;
        left: 6px;
        transform: skewY(-45deg);
        border-left: solid #000 1.5px;
        border-bottom: solid #000 1.5px;
      }

      &:hover {
        border-radius: 6px;
        background-color: #BBB;
      }

      &.has-comment {
        &::before {
          background-color: #FC6;
        }
        &::after {
          background-color: #FC6;
        }
      }
      &.has-comment span {
        position: absolute;
        background-color: #630;
        width: 35%;
        height: 1px;
        left: 30%;
        top: 37%;

        &::before {
          content: '';
          position: absolute;
          background-color: #630;
          width: 100%;
          height: 100%;
          top: 4px;
          left: 0;
        }
      }
    }

    &:hover .icon-comment {
      opacity: 1;
    }
  }
}
</style>
