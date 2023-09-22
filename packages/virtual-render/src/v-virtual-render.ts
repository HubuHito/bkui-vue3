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

/**
 * @file v-virtual-render
 *
 * Copyright © 2012-2019 Tencent BlueKing. All Rights Reserved. 蓝鲸智云 版权所有
 */

import { throttle } from 'lodash';

function getMatchedIndex(
  maxCount: number,
  maxHeight: number,
  groupItemCount: number,
  callback: (index: number, items: any[]) => 0,
) {
  let startIndex = 0;
  let height = 0;
  let diffHeight = 0;
  let lastHeight = 0;
  for (; startIndex < maxCount; startIndex++) {
    lastHeight = callback(startIndex, [startIndex * groupItemCount, (startIndex + 1) * groupItemCount, 'virtual']);
    if (height + lastHeight > maxHeight) {
      diffHeight = maxHeight - height;
      break;
    }

    height += lastHeight;
  }

  return { startIndex, height, diffHeight };
}

export function computedVirtualIndex(lineHeight, callback, pagination, el, event) {
  if (!el) {
    return;
  }
  const elScrollTop = el.scrollTop;
  const elScrollLeft = el.scrollLeft;
  const { scrollTop, count, groupItemCount, startIndex, endIndex, scrollLeft } = pagination;
  const { offsetHeight } = el;

  let targetStartIndex = 0;
  let targetEndIndex = 0;
  let translateY = 0;

  if (typeof lineHeight === 'number') {
    targetStartIndex = Math.floor(elScrollTop / lineHeight);
    targetEndIndex = Math.ceil(offsetHeight / lineHeight) + targetStartIndex;
    translateY = elScrollTop % lineHeight;
  }

  if (typeof lineHeight === 'function') {
    const startValue = getMatchedIndex(count, elScrollTop, groupItemCount, lineHeight);
    targetStartIndex = startValue.startIndex > 0 ? startValue.startIndex : 0;
    translateY = startValue.diffHeight;
    const endValue = getMatchedIndex(count, offsetHeight, groupItemCount, lineHeight);
    targetEndIndex = endValue.startIndex + targetStartIndex + 1;
  }

  if (
    elScrollTop !== scrollTop ||
    targetStartIndex !== startIndex ||
    targetEndIndex !== endIndex ||
    scrollLeft !== elScrollLeft
  ) {
    const bottom = el.scrollHeight - el.offsetHeight - el.scrollTop;
    typeof callback === 'function' &&
      callback(event, targetStartIndex, targetEndIndex, elScrollTop, translateY, elScrollLeft, {
        bottom: bottom >= 0 ? bottom : 0,
      });
  }
}

function visibleRender(e, wrapper: HTMLElement, binding) {
  const { lineHeight = 30, handleScrollCallback, pagination = {}, onlyScroll } = binding.value;
  if (onlyScroll) {
    const elScrollTop = wrapper.scrollTop;
    const elScrollLeft = wrapper.scrollLeft;
    const bottom = wrapper.scrollHeight - wrapper.offsetHeight - wrapper.scrollTop;
    handleScrollCallback(e, null, null, elScrollTop, elScrollTop, elScrollLeft, { bottom: bottom >= 0 ? bottom : 0 });
    return;
  }

  const { startIndex, endIndex, groupItemCount, count, scrollTop, scrollLeft } = pagination;
  computedVirtualIndex(
    lineHeight,
    handleScrollCallback,
    { scrollTop, startIndex, endIndex, groupItemCount, count, scrollLeft },
    wrapper,
    e,
  );
}

const throttledRender = (delay = 60) => throttle((e, wrapper, binding) => visibleRender(e, wrapper, binding), delay);
// const debounceRender = (delay = 60) => debounce((e, wrapper, binding) => visibleRender(e, wrapper, binding), delay);
const executeThrottledRender = (e, wrapper, binding, delay = 60) => {
  Reflect.apply(throttledRender(delay), this, [e, wrapper, binding]);
};

export default {
  mounted(el, binding) {
    const wrapper = el.parentNode;
    const { throttleDelay } = binding.value;
    wrapper.addEventListener('scroll', (e: MouseEvent) => {
      // @ts-ignore:next-line
      executeThrottledRender(e, wrapper, binding, throttleDelay);
    });
  },
  unbind(el) {
    if (el) {
      const wrapper = el.parentNode;
      if (!wrapper) {
        return;
      }
      wrapper.removeEventListener('scroll', throttledRender);
    }
  },
};
