<template>
  <transition name="fade">
    <Importing v-if="importing" />
    <div v-else id="app">
      <header>
        <h1>Kinklist</h1>
        <input type="text" v-model="username" placeholder="Enter username" />
        <div class="spacer"></div>
        <Legend :ratings="ratings" :editMode="editMode" />
        <ExportButton :loading="uploading" @click="exportImage()" />
        <div class="dropdown-container">
          <button class="dropdown-toggle hide-text" @click="toggleOptions(true)">Options</button>
          <transition name="fade">
            <div class="options-dropdown" v-if="showOptions">
              <div class="backdrop" @click="toggleOptions(false)"></div>
              <div class="options-dropdown-content">
                <div class="option checkbox">
                  <input type="checkbox" id="editing" v-model="editMode">
                  <label for="editing">Edit kinks</label>
                </div>
                <!-- <div class="option checkbox">
                  <input type="checkbox" id="darkmode" v-model="darkMode">
                  <label for="darkmode">Dark mode</label>
                </div> -->
                <div class="option checkbox">
                  <input type="checkbox" id="encodeData" v-model="encodeData">
                  <label for="encodeData">Encode data</label>
                </div>
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
            :editMode="editMode"
            @removeCategory="removeCategory(category)"
            @addSubcategory="addSubcategory(category)"
            @removeSubcategory="removeSubcategory(category, $event)"
            @renameSubcategory="renameSubcategory(category, $event)"
            @addKink="addKink(category)"
            @removeKink="removeKink(category, $event)"
          />
        </div>
      </main>
      <button v-if="editMode" class="add-category-btn" @click="addCategory()">Add category</button>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Kink, KinkCategory } from "./types/kinks";
import { getDefaultKinkContent, getDefaultRatings } from "./data/default";
import { Rating } from "./types/ratings";
import { generateKinklistImage } from "./util/generateImage";
import { uploadImageToImgur } from "./util/uploadToImgur";
import { importDataFromImgur } from "./util/importFromImgur";

import { showDialog } from './components/Dialogs/dialog';

import Category from "./components/Category.vue";
import UploadResultDialog from "./components/Dialogs/UploadResultDialog.vue";
import ErrorDialog from "./components/Dialogs/ErrorDialog.vue";
import ExportButton from "./components/ExportButton.vue";
import Importing from "./components/Importing.vue";
import Legend from "./components/Legend.vue";

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
  categories: KinkCategory[] = [];
  username = "";
  uploadId = "";
  uploading = false;
  importing = false;
  showOptions = false;
  editMode = false;
  // darkMode = false;
  encodeData = true;

  public get uploadUrl(): string {
    return this.uploadId ? `https://i.imgur.com/${this.uploadId}.png` : '';
  }

  public get columns(): KinkCategory[][] {
    const cols: KinkCategory[][] = [];
    const headingHeight = 108;
    const rowHeight = 27;
    const numCols = 3;
    const totalHeight =
      this.categories.length * headingHeight +
      this.categories.map((c) => c.kinks).flat().length * rowHeight;

    // Iterate through categories and allocate to columns
    const avgColHeight = totalHeight / numCols;
    let colHeight = 0;
    let col: KinkCategory[] = [];
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
  }

  public async exportImage(): Promise<void> {
    try {
      this.uploading = true;
      const canvas = generateKinklistImage(this.categories, this.ratings, this.username, this.encodeData);
      const id = await uploadImageToImgur(canvas);
      showDialog(UploadResultDialog, { uploadId: id, hasEncodedData: this.encodeData });
    } catch (ex) {
      showDialog(ErrorDialog, { message: "Something went wrong uploading the image" });
      console.error("Something went wrong uploading kinklist");
      console.error(ex);
    }
    this.uploading = false;
  }

  public addCategory(): void {
    this.categories.push({
      name: 'New category',
      subcategories: ['General'],
      kinks: [{
        name: 'Example kink',
        ratings: {
          General: this.ratings[0].name,
        },
      }],
    });
  }

  public removeCategory(category: KinkCategory): void {
    this.categories = this.categories.filter(c => c != category);
  }

  public addSubcategory(category: KinkCategory): void {
    const nameToAdd = 'Another';
    category.subcategories.push(nameToAdd);
    for (const kink of category.kinks) {
      kink.ratings[nameToAdd] = this.ratings[0].name;
    }
  }

  public removeSubcategory(category: KinkCategory, subcategory: string): void {
    category.subcategories = category.subcategories.filter(sc => sc !== subcategory);
    for (const kink of category.kinks) {
      delete kink.ratings[subcategory];
    }
  }

  public renameSubcategory(category: KinkCategory, event: { oldName: string, newName: string }): void {
    console.log('Should rename', event);
    for (const kink of category.kinks) {
      kink.ratings[event.newName] = kink.ratings[event.oldName];
      delete kink.ratings[event.oldName];
    }
  }

  public addKink(category: KinkCategory): void {
    for (let i = 0;; i++) {
      const newKinkName = 'New kink' + (i ? ` (${i})` : '');
      if (category.kinks.every(k => k.name !== newKinkName)) {
        category.kinks.push({
          name: newKinkName,
          ratings: category.subcategories.reduce((map: Record<string, string>, rating: string): Record<string, string> => {
            return { ...map, [rating]: this.ratings[0].name };
          }, {}),
        });
        return;
      }
      if (i > 100) return;
    }
  }

  public removeKink(category: KinkCategory, kink: Kink): void {
    category.kinks = category.kinks.filter(ck => ck !== kink);
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
}

header {
  background-color: #EEE;
  display: flex;
  padding: 10px;
  gap: 1em;
}

input {
  border: solid rgba(0, 0, 0, .25) 1px;
  border-radius: 5px;
  padding: 5px 10px;
  height: 35px;
}

@media (min-width: 1200px) {
  header {
    --h-padding: calc(calc(100vw - min(100vw, 1700px)) / 2);
    padding-left: var(--h-padding);
    padding-right: var(--h-padding);
  }
}

h1 {
  margin: 0;
}

.spacer {
  flex: 1;
}

main {
  padding-bottom: 2em;
}

@media (min-width: 1200px) {
  main {
    display: flex;
    gap: 1em;
    max-width: min(100vw, 1700px);
    width: 100%;
    margin: 0 auto;

    > .column {
      flex: 1;
    }
  }

  .add-category-btn {
    display: block;
    margin: 0 auto 1em;
    max-width: min(100vw, 1700px);
  }
}

.add-category-btn {
  width: 100%;
  background-color: #CCC;
  border: 0;
  color: #000;
  font-size: 1.5em;
  padding: .5em 1em;
  cursor: pointer;
}

.hide-text {
  color: transparent;
  font-size: 0;
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
}
.options-dropdown-content {
  position: absolute;
  margin-top: 10px;
  right: 0;
  width: 200px;
  background-color: #FFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  padding: 10px;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .35s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
