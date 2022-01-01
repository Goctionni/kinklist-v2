<template>
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
</template>

<script lang="ts">
import { Rating } from "@/types/ratings";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Legend extends Vue {
  @Prop() ratings!: Rating[];
  @Prop() editMode!: boolean;
}
</script>

<style lang="scss" scoped>
dl {
  display: flex;
  gap: 1.2em;
  padding: .5em 1em;
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
  
  &::before {
    content: '';
    display: block;
    position: absolute;
    inset: -.2em -.5em -.2em -.3em;
    border-radius: 100vw;
    background-color: var(--color);
    border: solid rgba(0, 0, 0, .75) 1px;
    opacity: .25;
    z-index: -1;
  }
}
.color {
  display: block;
  width: 20px;
  height: 20px;
  background-color: var(--color);
  border-radius: 50%;
}
</style>