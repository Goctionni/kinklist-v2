<template>
  <div class="legend">
    <button class="icon-button edit-icon edit-legend" @click="editRatings()">
      <span class="sr-only tooltip">Edit ratings</span>
    </button>
    <dl>
      <div
        v-for="(rating, index) in ratings"
        :key="`rating-${index}`"
        :style="{ '--color': rating.color }"
        class="rating"
      >
        <dt><span class="color"></span></dt>
        <dd>{{ rating.name }}</dd>
      </div>
    </dl>
  </div>
</template>

<script lang="ts">
import { Rating } from "@/types/ratings";
import { Component, Prop, Vue } from "vue-property-decorator";
import { showDialog } from "./Dialogs/dialog";
import LegendDialog from './Dialogs/LegendDialog.vue';

@Component
export default class Legend extends Vue {
  @Prop() ratings!: Rating[];

  async editRatings(): Promise<void> {
    const newRatings: false | Rating[] = await showDialog(LegendDialog, { ratings: this.ratings });
    if (newRatings) {
      this.$emit('updateRatings', newRatings);
    }
  }
}
</script>

<style lang="scss" scoped>
.legend {
  display: flex;
  align-items: center;
  min-height: 37px;
  background-color: rgba(0, 0, 0, .1);
  border-radius: 4px;
  padding: 0 .5em 0 .5em;
  gap: .5em;
}

dl {
  display: flex;
  gap: .5em;
  padding: .5em 0;
  margin: 0;
  border-radius: 4px;
}
dd {
  margin-inline-start: 0;
  padding-top: 2px;
}
.rating {
  position: relative;
  display: flex;
  gap: .3em;
  isolation: isolate;
  background-color: #FFF;
  border: solid rgba(0, 0, 0, .35) 1px;
  border-radius: 100vw;
  padding: .2em .5em .2em .3em;
}

.color {
  display: block;
  width: 20px;
  height: 20px;
  background-color: var(--color);
  border: solid rgba(0, 0, 0, .75) 1px;
  border-radius: 50%;
}

.edit-legend {
  color: #FFF;
  width: 31px;
  height: 31px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, .4);

  &:hover {
    background-color: #000;
  }
}

</style>