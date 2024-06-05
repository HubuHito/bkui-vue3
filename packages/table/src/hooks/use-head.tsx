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
import { ref, SetupContext, unref } from 'vue';

import Checkbox from '@bkui-vue/checkbox';

import TableCell from '../components/table-cell';
import { COLUMN_ATTRIBUTE, DEF_COLOR, IHeadColor, SORT_OPTION } from '../const';
import { EMIT_EVENTS } from '../events';
import HeadFilter from '../plugins/head-filter';
import HeadSort from '../plugins/head-sort';
import { Column, TablePropTypes } from '../props';
import { getNextSortType, getSortFn, resolveHeadConfig, resolvePropVal } from '../utils';

import { UseColumns } from './use-columns';
import { UseRows } from './use-rows';
export default ({
  props,
  columns,
  rows,
  ctx,
  column,
  index,
}: {
  props: TablePropTypes;
  columns: UseColumns;
  ctx: SetupContext;
  column: Column;
  index: number;
  rows: UseRows;
}) => {
  const sortType = ref(columns.getColumnAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_TYPE));
  const sortActive = ref(columns.getColumnAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_ACTIVE));
  /**
   * 点击排序事件
   * @param sortFn 排序函数
   * @param type 排序类型
   */
  const handleSortClick = (args?) => {
    const { isCancel, type = columns.getColumnRefAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_TYPE) } = args ?? {};
    const nextType = isCancel ? SORT_OPTION.NULL : type;

    const execFn = getSortFn(column, nextType, props.sortValFormat);
    columns.setColumnAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_TYPE, nextType);
    columns.setColumnAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_FN, execFn);
    columns.setColumnSortActive(column, nextType !== SORT_OPTION.NULL);
    sortType.value = nextType;
    sortActive.value = nextType !== SORT_OPTION.NULL;

    ctx.emit(EMIT_EVENTS.COLUMN_SORT, { column, index, type: nextType });
  };

  /**
   * 获取排序设置表头
   * @param column 当前渲染排序列
   * @param index 排序列所在index
   * @returns
   */
  const getSortCell = () => {
    // 如果是独立的，则只高亮当前排序
    return (
      <HeadSort
        column={column as Column}
        onChange={handleSortClick}
        sortValFormat={props.sortValFormat}
        defaultSort={sortType.value}
        active={sortActive.value}
      />
    );
  };

  const getFilterCell = () => {
    const handleFilterChange = (checked: any[]) => {
      ctx.emit(EMIT_EVENTS.COLUMN_FILTER, { checked, column: unref(column), index });
    };

    const filterSave = (values: any[]) => {
      columns.setColumnAttribute(column, COLUMN_ATTRIBUTE.COL_FILTER_VALUES, values);
      ctx.emit(EMIT_EVENTS.COLUMN_FILTER_SAVE, { values });
    };

    const handleResetFilter = () => {
      columns.setColumnAttribute(column, COLUMN_ATTRIBUTE.COL_FILTER_VALUES, []);
      ctx.emit(EMIT_EVENTS.COLUMN_FILTER, { checked: [], column: unref(column), index });
    };

    return (
      <HeadFilter
        column={column as Column}
        height={props.headHeight}
        onChange={handleFilterChange}
        onReset={handleResetFilter}
        onFilterSave={filterSave}
      />
    );
  };

  const config = resolveHeadConfig(props);
  const { cellFn } = config;
  const getHeadCellText = () => {
    if (typeof cellFn === 'function') {
      return cellFn(index);
    }

    if (typeof column.renderHead === 'function') {
      return column.renderHead({ index, column });
    }

    return resolvePropVal(column, 'label', [index]);
  };

  const getHeadCellRender = () => {
    const cells = [];
    if (column.sort) {
      cells.push(getSortCell());
    }

    if (column.filter) {
      cells.push(getFilterCell());
    }

    const cellText = getHeadCellText();
    cells.unshift(<span class='head-text'>{cellText}</span>);

    const showTitle = typeof cellText === 'string' ? cellText : undefined;

    const headClass = { 'has-sort': !!column.sort, 'has-filter': !!column.filter };

    return { cells, showTitle, headClass };
  };

  const renderHeadCheckboxColumn = () => {
    const handleChecked = value => {
      columns.setColumnAttribute(column, COLUMN_ATTRIBUTE.SELECTION_VAL, value);
      columns.setColumnAttribute(column, COLUMN_ATTRIBUTE.SELECTION_INDETERMINATE, false);

      rows.setRowSelectionAll(value);
      ctx.emit(EMIT_EVENTS.ROW_SELECT_ALL, { checked: value, data: props.data });
    };

    const isDisabled = columns.getColumnAttribute(column, COLUMN_ATTRIBUTE.SELECTION_DISABLED);
    const isChecked = columns.getColumnAttribute(column, COLUMN_ATTRIBUTE.SELECTION_VAL);
    const indeterminate = columns.getColumnAttribute(column, COLUMN_ATTRIBUTE.SELECTION_INDETERMINATE);

    return (
      <Checkbox
        onChange={handleChecked}
        disabled={isDisabled}
        modelValue={isChecked}
        indeterminate={indeterminate as boolean}
      />
    );
  };

  /**
   * table head cell render
   * @param column
   * @param index
   * @returns
   */
  const renderHeadCell = () => {
    if (column.type === 'selection') {
      return [renderHeadCheckboxColumn()];
    }

    const { headClass, showTitle, cells } = getHeadCellRender();

    return (
      <TableCell
        class={headClass}
        title={showTitle}
        observerResize={props.observerResize}
        resizerWay={props.resizerWay}
        isHead={true}
        column={column as Column}
        parentSetting={props.showOverflowTooltip}
        headExplain={resolvePropVal(column.explain, 'head', [column])}
      >
        {cells}
      </TableCell>
    );
  };

  /**
   * 点击选中一列事件
   * @param index 当前选中列Index
   * @param column 当前选中列
   */
  const handleColumnHeadClick = () => {
    if (columns.getColumnAttribute(column, COLUMN_ATTRIBUTE.COL_IS_DRAG)) {
      return;
    }

    if (column.sort && !column.filter) {
      const nextType = getNextSortType(columns.getColumnRefAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_TYPE));
      const args = { isCancel: false, type: nextType };
      handleSortClick(args);
    }
  };

  const headStyle = Object.assign(columns.getFixedStlye(column), {
    '--background-color': DEF_COLOR[props.thead?.color ?? IHeadColor.DEF1],
  });

  const classList = [
    columns.getHeadColumnClass(column, index),
    columns.getColumnCustomClass(column),
    column.align || props.headerAlign || props.align,
  ];

  const getTH = () => {
    return (
      <th
        colspan={1}
        rowspan={1}
        data-id={columns.getColumnId(column)}
        class={classList}
        style={headStyle}
        onClick={() => handleColumnHeadClick()}
        {...columns.resolveEventListener(column)}
      >
        {renderHeadCell()}
      </th>
    );
  };

  return { getTH };
};
