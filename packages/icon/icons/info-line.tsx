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
import { FunctionalComponent } from 'vue';

import BkIcon, { IIconBaseProps } from './icon';
const data = JSON.parse(
  '{"type":"element","name":"svg","attributes":{"xmlns":"http://www.w3.org/2000/svg","class":"bk-icon","style":"width: 1em; height: 1em; vertical-align: middle;fill: currentColor;overflow: hidden;","overflow":"hidden","viewBox":"0 0 1024 1024"},"elements":[{"type":"element","name":"path","attributes":{"d":"M512 64C264 64 64 264 64 512s200 448 448 448 448-200 448-448S760 64 512 64zM512 896C299.2 896 128 724.8 128 512S299.2 128 512 128s384 171.2 384 384S724.8 896 512 896z"}},{"type":"element","name":"path","attributes":{"d":"M494.4 403.2c-28.8 6.4-56 20.8-76.8 41.6-24 22.4 1.6 44.8 16 27.2 9.6-12.8 24-22.4 40-28.8 11.2-1.6 17.6 1.6 19.2 9.6 1.6 14.4 0 27.2-4.8 41.6-4.8 19.2-14.4 51.2-25.6 94.4-22.4 76.8-33.6 124.8-30.4 140.8 3.2 17.6 12.8 32 28.8 41.6 17.6 8 38.4 9.6 57.6 4.8 30.4-6.4 57.6-22.4 80-44.8 25.6-25.6-3.2-43.2-17.6-28.8-9.6 12.8-24 22.4-40 25.6-14.4 3.2-22.4-3.2-25.6-16-1.6-14.4 1.6-28.8 6.4-41.6 40-136 57.6-212.8 52.8-232-3.2-14.4-12.8-27.2-25.6-33.6C532.8 398.4 512 398.4 494.4 403.2z"}},{"type":"element","name":"path","attributes":{"d":"M608 304A48 48 0 0 1 560 352 48 48 0 0 1 512 304 48 48 0 0 1 608 304z"}}]}',
);
const infoLine: FunctionalComponent<IIconBaseProps> = (props, context) => {
  const p = { ...props, ...context.attrs };
  return (
    <BkIcon
      {...p}
      data={data}
      name='infoLine'
    ></BkIcon>
  );
};

infoLine.displayName = 'infoLine';
infoLine.inheritAttrs = false;

export default infoLine;
