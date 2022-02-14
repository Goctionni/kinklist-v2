<template>
  <transition name="fade">
    <Importing v-if="importing" />
    <div v-else class="app">
      <header>
        <h1>Kinklist</h1>
        <input type="text" v-model="username" placeholder="Enter username" />
        <div class="spacer"></div>
        <Legend :ratings="ratings" @updateRatings="updateRatings($event)" />
        <ExportButton :loading="uploading" @click="exportImage()" />
        <div class="dropdown-container">
          <button class="dropdown-toggle hide-text" @click="toggleOptions(true)">Options</button>
          <transition name="fade">
            <div class="options-dropdown" v-if="showOptions">
              <div class="backdrop" @click="toggleOptions(false)"></div>
              <div class="options-dropdown-content">
                <!-- <div class="option checkbox">
                  <input type="checkbox" id="darkmode" v-model="darkMode">
                  <label for="darkmode">Dark mode</label>
                </div> -->
                <div class="option checkbox">
                  <input type="checkbox" id="encodeData" v-model="encodeData">
                  <label for="encodeData">Encode data</label>
                </div>
                <button class="about-btn" @click="showAbout()">About</button>
              </div>
            </div>
          </transition>
        </div>
      </header>
      <main class="body">
        <div class="column" v-for="(col, i) in columns" :key="`col-${i}`">
          <Category
            v-for="category in col"
            :key="category.name"
            :category="category"
            :ratings="ratings"
            @removeCategory="removeCategory(category)"
            @addKink="addKink(category)"
            @removeKink="removeKink(category, $event)"
          />
        </div>
      </main>
      <button class="icon-button add-category-btn add-icon" @click="addCategory()">
        <span class="sr-only tooltip tooltip-left">Add category</span>
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { InKink, InKinkCategory } from "./types/kinks";
import { getDefaultKinkContent, getDefaultRatings } from "./data/default";
import { Rating } from "./types/ratings";
import { generateKinklistImage } from "./util/generateImage";
import { uploadImageToImgur } from "./util/uploadToImgur";
import { importDataFromImgur } from "./util/importFromImgur";

import { showDialog } from './components/Dialogs/dialog';

import Category from "./components/Category.vue";
import UploadResultDialog from "./components/Dialogs/UploadResultDialog.vue";
import PromptDialog from "./components/Dialogs/PromptDialog.vue";
import ErrorDialog from "./components/Dialogs/ErrorDialog.vue";
import AboutDialog from "./components/Dialogs/AboutDialog.vue";
import EditCategoryDialog from "./components/Dialogs/EditCategoryDialog.vue";
import ExportButton from "./components/ExportButton.vue";
import Importing from "./components/Importing.vue";
import Legend from "./components/Legend.vue";
import { generateId } from "./util/idGenerator";

@Component({
  components: {
    Category,
    ExportButton,
    Importing,
    Legend,
  },
})
export default class App extends Vue {
  ratings: Rating[] = [];
  categories: InKinkCategory[] = [];
  username = "";
  uploadId = "";
  uploading = false;
  importing = false;
  showOptions = false;
  // darkMode = false;
  encodeData = true;
  numColumns = 4;

  public get uploadUrl(): string {
    return this.uploadId ? `https://i.imgur.com/${this.uploadId}.png` : '';
  }

  public get columns(): InKinkCategory[][] {
    const cols: InKinkCategory[][] = [];
    const headingHeight = 108;
    const rowHeight = 27;
    const totalHeight =
      this.categories.length * headingHeight +
      this.categories.map((c) => c.kinks).flat().length * rowHeight;

    // Iterate through categories and allocate to columns
    const avgColHeight = totalHeight / this.numColumns;
    let colHeight = 0;
    let col: InKinkCategory[] = [];
    cols.push(col);
    for (const cat of this.categories) {
      const catHeight = headingHeight + cat.kinks.length * rowHeight;
      if (colHeight + catHeight / 2 > avgColHeight) {
        col = [];
        cols.push(col);
        colHeight = 0;
      }
      col.push(cat);
      colHeight += catHeight;
    }
    return cols;
  }

  public async created(): Promise<void> {
    if (!(await this.tryLoadImgurData())) {
      this.loadDefaults();
    }
    this.updateNumColumns();
    window.addEventListener('resize', () => {
      this.updateNumColumns();
    });
  }

  public updateNumColumns(): void {
    const screenWidth = Math.min(window.innerWidth, 1740);
    this.numColumns = Math.max(1, Math.floor(screenWidth / 400));
  }

  public async exportImage(): Promise<void> {
    try {
      this.uploading = true;
      const canvas = generateKinklistImage(this.categories, this.ratings, this.username, this.encodeData);
      const id = await uploadImageToImgur(canvas);
      const hasAnyComment = this.categories.some((c) => c.kinks.some((k) => k.comment));
      showDialog(UploadResultDialog, { uploadId: id, hasEncodedData: this.encodeData && hasAnyComment });
    } catch (ex) {
      showDialog(ErrorDialog, { message: "Something went wrong uploading the image" });
      console.error("Something went wrong uploading kinklist");
      console.error(ex);
    }
    this.uploading = false;
  }

  public showAbout(): void {
    this.toggleOptions(false);
    showDialog(AboutDialog, {});
  }

  public async addCategory(): Promise<void> {
    type CategoryModalResult = false | Pick<InKinkCategory, "name" | "subcategories">;
    const result: CategoryModalResult = await showDialog(EditCategoryDialog, {});
    if (!result) return;

    this.categories.push({
      id: generateId(),
      name: result.name,
      subcategories: result.subcategories,
      kinks: [{
        id: generateId(),
        name: 'Example kink',
        ratings: {
          General: this.ratings[0].name,
        },
      }],
    });
  }

  public removeCategory(category: InKinkCategory): void {
    this.categories = this.categories.filter(c => c != category);
  }

  public async addKink(category: InKinkCategory): Promise<void> {
    const newKinkName: false | string = await showDialog(PromptDialog, {
      title: 'Add kink',
      inputLabel: 'Kink name:',
      value: '',
    });
    if (newKinkName) {
      category.kinks.push({
        id: generateId(),
        name: newKinkName,
        ratings: category.subcategories.reduce((map: Record<string, string>, rating: string): Record<string, string> => {
          return { ...map, [rating]: this.ratings[0].name };
        }, {}),
      });
    }
  }

  public removeKink(category: InKinkCategory, kink: InKink): void {
    category.kinks = category.kinks.filter(ck => ck.id !== kink.id);
  }

  public updateRatings(newRatings: Rating[]): void {
    type KinkRatings = Record<string, string>;
    this.ratings = newRatings.map((r) => ({ ...r }));
    for (const category of this.categories) {
      for (const kink of category.kinks) {
        kink.ratings = category.subcategories.reduce((ratings: KinkRatings, subcategory): KinkRatings => {
          const rating = newRatings.some(nr => nr.name === kink.ratings[subcategory])
            ? kink.ratings[subcategory]
            : newRatings[0].name;
          return {
            ...ratings,
            [subcategory]: rating,
          };
        }, {});
      }
    }
  }

  public toggleOptions(newValue: boolean): void {
    this.showOptions = newValue;
    if (newValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  private async tryLoadImgurData(): Promise<boolean> {
    // Get the hash
    const id = this.getImgurHash();
    // If there is no hash, no download happens
    if (!id) return false;

    try {
      // Download image
      this.importing = true;
      const { categories, ratings, username } = await importDataFromImgur(id);
      this.username = username
      this.categories = categories;
      this.ratings = ratings;
      this.importing = false;
      return true;
    } catch (ex) {
      showDialog(ErrorDialog, { message: "Something went wrong parsing loading kinklist data" });
      console.error("Something went wrong downloading/parsing kinklist");
      console.error(ex);
      this.importing = false;
      return false;
    }
  }

  private getImgurHash(): false | string {
    if (!location.hash) return false;
    if (location.hash.length <= 1) return false;
    if (!location.hash.match(/^#[a-zA-Z0-9]{3,10}$/)) return false;
    const id = location.hash.substr(1);
    return id;
  }

  private loadDefaults(): void {
    this.username = "";
    this.ratings = getDefaultRatings();
    this.categories = getDefaultKinkContent(this.ratings[0].name);
  }
}
</script>

<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
}
body,
html {
  font-family: Arial;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  background: #E2E2E8;
}

h1, h2, h3, h4, h5 {
  padding: 0;
  margin: 0;
}

button {
  cursor: pointer;
}

.spacer {
  flex: 1;
}

.hide-text,
.sr-only {
  position: absolute;
  color: transparent;
  font-size: 0;
}

.icon-button {
  border: 0;
  background: transparent;
  position: relative;
}

.icon-button:hover .tooltip {
  position: absolute;
  left: 50%;
  top: 100%;
  margin-top: 4px;
  background-color: #333;
  font-size: 1em;
  color: #FFF;
  white-space: nowrap;
  padding: .25em .5em;
  border-radius: 4px;
  transform: translateX(-50%);
  isolation: isolate;
  pointer-events: none;
  z-index: 1;
  transition: background-color .2s ease-in-out, color .2s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%) rotate(45deg);
    background: inherit;
    z-index: -1;
    pointer-events: none;
  }

  &.tooltip-left {
    top: 50%;
    left: auto;
    right: 100%;
    margin-top: 0;
    margin-right: 4px;
    transform: translateY(-50%);

    &::before {
      top: 50%;
      left: 100%;
    }
  }
}

.add-icon {
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 10%;
    height: 60%;
    left: 45%;
    top: 20%;
    background-color: currentColor;
    border-radius: 100vh;
  }

  &::after {
    transform: rotate(90deg);
  }
}

.edit-icon {
  &::before,
  &::after {
    --base-transform: translate(-50%, -50%) rotate(45deg);
    content: '';
    position: absolute;
    width: 10%;
    height: 10%;
    left: 50%;
    top: 50%;
    background-color: currentColor;
  }

  &::before {
    transform: var(--base-transform) translateY(-260%);
  }

  &::after {
    height: 57%;
    clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%);
    transform: var(--base-transform) translateY(20%);
  }
}

.remove-icon {
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 10%;
    height: 70%;
    left: 45%;
    top: 15%;
    background-color: currentColor;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .35s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 1em;  
}

header {
  background-color: #EEE;
  display: flex;
  padding: 10px;
  gap: 1em;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%), 0 1px 2px rgb(0 0 0 / 24%);
}

@media (min-width: 1200px) {
  header {
    --h-padding: calc(calc(100vw - min(100vw, 1700px)) / 2);
    padding-left: var(--h-padding);
    padding-right: var(--h-padding);
  }
}

@media (max-width: 1199px) {
  header {
    flex-direction: column;

    > button {
      height: 37px;
    }
    .dropdown-container {
      height: 37px;
    }
  }
}

h1 {
  margin: 0;
}

main {
  padding-bottom: 2em;
  display: flex;
  gap: 1em;
  max-width: min(100vw, 1700px);
  width: 100%;
  margin: 0 auto;
}

.dropdown-toggle {
  background-color: #246;
  border: 0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 37px;

  &::before {
    position: absolute;
    content: '';
    border: solid #FFF 3px;
    border-top-color: transparent;
    border-left-color: transparent;
    width: 40%;
    height: 40%;
    transform: translateY(-25%) rotate(45deg);
  }
}

.dropdown-container {
  position: relative;
}

.backdrop {
  position: fixed;
  background-color: #000;
  opacity: .2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
.options-dropdown-content {
  position: absolute;
  margin-top: 10px;
  right: 0;
  width: 200px;
  background-color: #FFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  padding: 10px;
  z-index: 2;
}

.option.checkbox {
  input {
    display: none;
  }

  label {
    position: relative;
    cursor: pointer;
    padding-left: calc(20px + .3em);
    height: 24px;
    font-size: 16px;
    line-height: 24px;
    display: block;

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      display: block;
    }

    &::before {
      width: 20px;
      height: 20px;
      border: solid #000 2px;
      transition: background-color .2s ease-in-out;
    }

    &::after {
      width: 0px;
      height: 0px;
      transition: height .2s ease-in, width .2s .2s ease-out;
      border: solid #FFF 2px;
      border-top-color: transparent;
      border-right-color: transparent;
      transform-origin: top left;
      transform: translateY(8px) translateX(3px) rotate(-40deg);
    }
  }

  input:checked + label {
    &::before {
      background-color: #000;
    }

    &::after {
      height: 8px;
      width: 13px;
    }
  }
}

.about-btn {
  border: 0;
  padding-left: calc(20px + 0.3em);
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
}

input {
  border: solid rgba(0, 0, 0, .25) 1px;
  border-radius: 5px;
  padding: 5px 10px;
  height: 35px;
}

.add-category-btn {
  position: fixed;
  bottom: 1em;
  right: 1em;
  background-color: #246;
  font-size: 1.5em;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: #FFF;

  &::before,
  &::after {
    transition: transform .3s ease-in-out;
  }

  &:hover {
    background-color: #369;

    &::before {
      transform: rotate(90deg);
    }

    &::after {
      transform: rotate(180deg);
    }
  }
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1em;
  flex: 1;
}
</style>