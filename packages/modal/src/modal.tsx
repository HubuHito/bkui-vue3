/*
 * Tencent is pleased to support the open source community by making
 * 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) is licensed under the MIT License.
 *
 * License for 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition):
 *
 * ---------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { defineComponent, Transition } from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { BKPopIndexManager } from '@bkui-vue/shared';

import { propsMixin } from './props.mixin';

export default defineComponent({
  name: 'Modal',
  props: {
    ...propsMixin,
  },
  emits: ['quick-close', 'quickClose', 'hidden', 'shown', 'close'],
  data() {
    return {
      visible: false,
      closeTimer: null,
      bkPopIndexManager: null,
    };
  },
  computed: {
    dialogWidth(): String | Number {
      return /^\d+\.?\d*$/.test(`${this.width}`) ? `${this.width}px` : this.width;
    },

    dialogHeight(): String | Number {
      return /^\d+\.?\d*$/.test(`${this.height}`) ? `${this.height}px` : this.height;
    },

    compStyle(): any {
      return {
        width: this.dialogWidth,
        height: this.dialogHeight,
        minHeigth: `${200}px`,
        display: this.visible ? 'inherit' : 'none',
        zIndex: this.zIndex || 'inherit',
      };
    },
    fullscreenStyle(): any {
      return {
        width: `${100}%`,
        height: `${100}%`,
      };
    },
  },
  watch: {
    isShow: {
      handler(val: boolean) {
        if (val) {
          // 避免is-show: false执行覆盖
          this.closeTimer && clearTimeout(this.closeTimer);
          this.closeTimer = null;
          this.visible = val;
        } else {
          this.closeTimer = setTimeout(() => {
            // 直接设为false会失去离开的动画效果，这里延迟设置
            this.$emit('hidden'); // 为false直接触发hidden事件，在上层有200ms的延时
            this.visible = val;
          }, 250);
        }
      },
      immediate: true,
    },
    // isShow 初始化为 true 的时候，防止直接展示
    visible: {
      handler(val: boolean) {
        if (val) {
          this.$nextTick(() => {
            // isShow初始化为true的时候，放在nextTick才能获取$el
            const hideMaskStyle = {
              'background-color': 'rgba(0,0,0,0)',
            };
            const appendStyle = this.showMask ? {} : hideMaskStyle;
            this.bkPopIndexManager.show(
              this.$el,
              this.showMask,
              appendStyle,
              !!this.transfer,
              this.zIndex,
              (_e: MouseEvent) => {
                this.handleClickOutSide();
              },
            );
            this.$emit('shown');
          });
        } else {
          this.bkPopIndexManager?.removeLastEvent();
          this.bkPopIndexManager?.hide(this.$el, !!this.transfer);
          this.bkPopIndexManager?.destroy();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    const popConfig = {
      ...this.$props,
      ...{
        transfer: this.transfer === 'parent' ? this.$el?.parentElement : this.transfer,
      },
    };
    this.bkPopIndexManager = new BKPopIndexManager(popConfig);
  },

  beforeUnmount() {
    if (this.visible) {
      this.bkPopIndexManager?.hide(this.$el);
      this.bkPopIndexManager?.destroy();
    }
  },
  methods: {
    handleClickOutSide() {
      if (this.quickClose) {
        this.$emit('close');
        this.$emit('quick-close', this.$el);
        this.$emit('quickClose', this.$el);
      }
    },
  },
  render() {
    const { resolveClassName } = usePrefix();
    const maxHeight = this.maxHeight ? { maxHeight: this.maxHeight } : {};
    const bodyClass = `${resolveClassName('modal-body')} ${this.animateType === 'slide' ? this.direction : ''}`;
    return (
      <div
        class={[resolveClassName('modal-wrapper'), this.extCls, this.size, this.fullscreen ? 'fullscreen' : '']}
        style={[this.compStyle, this.fullscreen ? this.fullscreenStyle : '']}
      >
        <Transition name={this.animateType}>
          {this.isShow ? (
            <div class={bodyClass}>
              <div class={resolveClassName('modal-header')}>{this.$slots.header?.() ?? ''}</div>
              <div
                class={resolveClassName('modal-content')}
                style={[this.dialogType === 'show' ? 'padding-bottom: 20px' : '', { ...maxHeight }]}
              >
                {this.$slots.default?.() ?? ''}
              </div>
              {this.dialogType === 'show' ? (
                ''
              ) : (
                <div class={resolveClassName('modal-footer')}>{this.$slots.footer?.() ?? ''}</div>
              )}
              {this.closeIcon && <div class={resolveClassName('modal-close')}>{this.$slots.close?.() ?? ''}</div>}
            </div>
          ) : (
            ''
          )}
        </Transition>
      </div>
    );
  },
});
