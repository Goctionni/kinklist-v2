<template>
  <Dialog
    titleText="Kinklist created"
    @close="close()"
  >
    <div class="upload-dialog-content">
      <h3>Imgur link</h3>
      <div class="row">
        <input ref="imgurUrlRef" readonly :value="uploadUrl" />
        <button class="clipboard hide-text" title="Copy to clipboard" @click="copyUploadUrlToClipboard('imgurUrlRef', uploadUrl)">Copy to clipboard</button>
        <a :href="uploadUrl" target="_blank" class="hide-text">Goto Imgur</a>
      </div>
      <h3>Kinklist link</h3>
      <div class="row">
        <input ref="viewUrlRef" readonly :value="viewUrl" />
        <button class="clipboard hide-text" title="Copy to clipboard" @click="copyUploadUrlToClipboard('viewUrlRef', viewUrl)">Copy to clipboard</button>
      </div>
      <template v-if="hasEncodedData">
        <h3>BBCode</h3>
        <div class="row">
          <textarea ref="bbcodeRef" v-text="bbcode" readonly></textarea>
          <button class="clipboard hide-text" title="Copy to clipboard" @click="copyUploadUrlToClipboard('bbcodeRef', bbcode)">Copy to clipboard</button>
        </div>
      </template>
    </div>
    <transition name="slide">
      <div class="toast" v-if="toast">{{ toast }}</div>
    </transition>
  </Dialog>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";

import Dialog from "./Dialog.vue";

@Component({
  components: {
    Dialog,
  },
})
export default class UploadResultDialog extends Vue {
  @Prop() uploadId!: string;
  @Prop() hasEncodedData!: boolean;
  toast = '';
  toastTimeout = 0;

  public get uploadUrl(): string {
    return this.uploadId ? `https://i.imgur.com/${this.uploadId}.png` : '';
  }

  public get viewUrl(): string {
    return this.uploadId ? `${location.protocol}//${location.host}${location.pathname}#${this.uploadId}` : '';
  }

  public get bbcode(): string {
    return `[Kinklist](${this.uploadUrl}) (To view included notes: [Kinklist Details](${this.viewUrl}))`;
  }

  public copyUploadUrlToClipboard(ref: string, url: string): void {
    (this.$refs?.[ref] as HTMLInputElement)?.select();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy');
    }
    this.toast = 'URL copied to clipboard';
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast = '';
    }, 500);
  }

  @Emit()
  close(): void { /* Event emitted */ }
}
</script>

<style lang="scss" scoped>
.upload-dialog-content {
  width: 400px;
  padding: 0 10px 10px;

  h3 {
    margin: .5em 0 .2em;
  }

  > .row {
    display: flex;
    gap: 5px;
  }

  input {
    flex: 1;
    height: 28px;
    font-family: 'Courier New', Courier, monospace;
    text-align: center;
    font-size: 16px;
  }

  textarea {
    flex: 1;
    height: 100px;
    font-family: 'Courier New', Courier, monospace;
    text-align: left;
    font-size: 16px;
  }

  .clipboard {
    --btnbg: #DDD;
    position: relative;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--btnbg);
    border: 0;

    &:hover {
      --btnbg: #BBB;
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 40%;
      height: 60%;
      border: solid #333 1px;
      outline: solid var(--btnbg) 1px;
      background-color: var(--btnbg);
    }

    &::before {
      transform: translate(2px, 2px);
    }

    &::after {
      transform: translate(-2px, -2px);
    }
  }

  a {
    --btnbg: #DDD;
    text-decoration: none;
    width: 28px;
    height: 28px;
    background-color: var(--btnbg);
    position: relative;

    &:hover {
      --btnbg: #BBB;
    }

    &::before {
      content: '';
      position: absolute;
      left: 5px;
      bottom: 5px;
      width: 14px;
      height: 14px;
      border: solid #333 1px;
    }

    &::after {
      content: '';
      position: absolute;
      right: 5px;
      top: 5px;
      width: 14px;
      height: 14px;
      border: solid #333 1px;
      border-width: 1px 1px 0 0;
      background: linear-gradient(
        -45deg,
        transparent,
        transparent 30%,
        var(--btnbg) 30%,
        var(--btnbg) 48%,
        #333 48%,
        #333 52%,
        var(--btnbg) 52%,
        var(--btnbg) 70%,
        transparent 70%,
      );
    }
  }
}

.toast {
  position: absolute;
  background-color: #222;
  color: #FFF;
  padding: 1em 2em;
  border-radius: 7px;
  bottom: -75px;
  left: 50%;
  width: max-content;
  transform: translateX(-50%);
}

.slide-enter-active, .slide-leave-active {
  transition: all .3s;
}
.slide-enter {
  opacity: 0;
  margin-bottom: 30px;
}
.slide-leave-to {
  opacity: 0;
  margin-bottom: -30px;
}
</style>
