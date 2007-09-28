/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This layout manager lays out its children in a two dimensional grid. The
 * grid supports:
 * <ul>
 *   <li>autosizing</li>
 *   <li>flex values for rows and columns</li>
 *   <li>minimal and maximal column and row sizes</li>
 *   <li>horizontal and vertical alignment</li>
 *   <li>col/row spans</li>
 * </ul>
 */
qx.Class.define("qx.ui2.layout.Grid",
{
  extend : qx.ui2.layout.Abstract,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._grid = [];
    this._rowData = [];
    this._colData = [];

    this._colSpans = [];
    this._rowSpans = [];

    this._maxRowIndex = 0;
    this._maxColIndex = 0;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    horizontalSpacing :
    {
      check : "Integer",
      init : 5,
      apply : "_applyLayoutChange"
    },

    verticalSpacing :
    {
      check : "Integer",
      init : 5,
      apply : "_applyLayoutChange"
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Add a widget to the grid at the given cell coordinates
     *
     * @param widget {qx.ui2.core.Widget} The widget to add
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param rowSpan {Integer?1} How many rows the widget should span
     * @param colSpan {Integer?1} How many columns the widget should span
     */
    add : function(widget, row, column, rowSpan, colSpan)
    {
      // validate arguments
      var cellData = this.getCellData(row, column);
      if (cellData.widget !== undefined) {
        throw new Error("There is already a widget in this cell (" + row + ", " + column + ")");
      }
      if (row === undefined || column === undefined) {
        throw new Error("The arguments 'row' and 'column' must be defined!");
      }

      var rowSpan = rowSpan || 1;
      var colSpan = colSpan || 1;

      for (var x=0; x<colSpan; x++) {
        for (var y=0; y<rowSpan; y++) {
          this._setCellData(row + y, column + x, "widget", widget);
        }
      }

      if (rowSpan > 1) {
        this._rowSpans.push(widget);
      }

      if (colSpan > 1) {
        this._colSpans.push(widget);
      }

      this._maxRowIndex = Math.max(this._maxRowIndex, row + rowSpan - 1);
      this._maxColIndex = Math.max(this._maxColIndex, column + colSpan - 1);

      this.base(arguments, widget);
      this._importProperties(
        widget, arguments,
        "grid.row", "grid.column", "grid.rowSpan", "grid.colSpan"
      );
    },


    _validateArgument : function(arg, validValues)
    {
      if (validValues.indexOf(arg) == -1) {
        throw new Error(
          "Invalid argument '" + arg +"'! Valid arguments are: '" +
          validValues.join(", ") + "'"
        );
      }
    },


    _setCellData : function(row, column, key, value)
    {
      var grid = this._grid;

      if (grid[row] == undefined) {
         grid[row] = [];
      }
      var gridData = grid[row][column];
      if (!gridData)
      {
        grid[row][column] = {}
        grid[row][column][key] = value;
      }
      else
      {
        gridData[key] = value;
      }
    },


    _setRowData : function(row, key, value)
    {
      var rowData = this._rowData[row];
      if (!rowData)
      {
        this._rowData[row] = {};
        this._rowData[row][key] = value;
      }
      else
      {
        rowData[key] = value;
      }
    },


    _getRowData : function(row)
    {
      var data = this._rowData[row] || {};
      return {
        hAlign : data.hAlign || "left",
        flex : data.flex || 1,
        minHeight : data.minHeight || 0,
        maxHeight : data.maxHeight || 32000
      }
    },


    _setColumnData : function(column, key, value)
    {
      var colData = this._colData[column];
      if (!colData)
      {
        this._colData[column] = {};
        this._colData[column][key] = value;
      }
      else
      {
        colData[key] = value;
      }
    },


    _getColumnData : function(column)
    {
      var data = this._colData[column] || {};
      return {
        vAlign : data.vAlign || "top",
        hAlign : data.hAlign || "left",
        flex : data.flex || 1,
        minWidth : data.minWidth || 0,
        maxWidth : data.maxWidth || 32000
      }
    },


    /**
     * Set the default cell alignment for a column. This alignmnet can be
     * overridden on a per cell basis by using {@link #setCellAlign}.
     *
     * @param column {Integer} Column index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     */
    setColumnAlign : function(column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setColumnData(column, "hAlign", hAlign);
      this._setColumnData(column, "vAlign", vAlign);
    },


    /**
     * Set the cell's alignment. This alignmnet overrides the default
     * alignmnet set unsing {@link #setColumnAlign}.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     */
    setCellAlign : function(row, column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setCellData(column, "hAlign", hAlign);
      this._setCellData(column, "vAlign", vAlign);
    },


    setColumnFlex : function(column, flex) {
      this._setColumnData(column, "flex", flex);
    },

    setRowFlex : function(row, flex) {
      this._setRowData(row, "flex", flex);
    },

    setColumnMaxWidth : function(column, maxWidth) {
      this._setColumnData(column, "maxWidth", maxWidth);
    },

    setColumnMinWidth : function(column, minWidth) {
      this._setColumnData(column, "minWidth", minWidth);
    },

    setRowMaxHeight : function(row, maxHeight) {
      this._setRowData(row, "maxHeight", maxHeight);
    },

    setRowMinHeight : function(row, minHeight) {
      this._setRowData(row, "minHeight", minHeight);
    },






    /**
     * Get a map with all information about a cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {Map} Information about the cell
     */
    getCellData : function(row, column)
    {
      var rowData = this._rowData[row] || {};
      var colData = this._colData[column] || {};
      var gridData = this._grid[row] ? this._grid[row][column] || {} : {};
      return {
        vAlign : gridData.vAlign || colData.vAlign || "top",
        hAlign : gridData.hAlign || colData.hAlign || "left",
        widget : gridData.widget
      }
    },


    // overridden
    remove : function(widget) {
      throw new Error("Not yet implemented.");
    },


    /**
     * Check whether all row spans fit with their prefferred height into the
     * preferred row heights. If there is not enough space, the preferred
     * row sizes are increased. The distribution respects the flex and max
     * values of the rows.
     *
     *  The same is true for the min sizes.
     *
     *  The height array is modified in place.
     *
     * @param rowHeights {Map[]} The current row height array as computed by
     *     {@link #_getRowHeights}.
     */
    _fixHeightsRowSpan : function(rowHeights)
    {
      var vSpacing = this.getVerticalSpacing();

      for (var i=0, l=this._rowSpans.length; i<l; i++)
      {
        var widget = this._rowSpans[i];
        var hint = widget.getSizeHint();

        var widgetRow = widget.getLayoutProperty("grid.row");
        var widgetRowSpan = widget.getLayoutProperty("grid.rowSpan") || 1;

        var prefSpanHeight = vSpacing * (widgetRowSpan - 1);
        var minSpanHeight = prefSpanHeight;

        var prefRowFlex = [];
        var minRowFlex = [];

        for (var j=0; j<widgetRowSpan; j++)
        {
          var row = widgetRow+j;
          var rowHeight = rowHeights[row];
          var rowFlex = this._getRowData(row).flex;

          // compute flex array for the preferred height
          prefRowFlex.push({
            id: row,
            potential: rowHeight.maxHeight - rowHeight.height,
            flex: rowFlex
          });
          prefSpanHeight += rowHeight.height;

          // compute flex array for the min height
          minRowFlex.push({
            id: row,
            potential: rowHeight.maxHeight - rowHeight.minHeight,
            flex: rowFlex
          });
          minSpanHeight += rowHeight.minHeight;
        }

        // If there is not enought space for the preferred size
        // increment the preferred row sizes.
        if (prefSpanHeight < hint.height)
        {
          var rowIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            prefRowFlex, hint.height - prefSpanHeight
          );

          for (var j=0; j<widgetRowSpan; j++) {
            rowHeights[widgetRow+j].height += rowIncrements[widgetRow+j];
          }
        }

        // If there is not enought space for the min size
        // increment the min row sizes.
        if (minSpanHeight < hint.minHeight)
        {
          var rowIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            minRowFlex, hint.minHeight - minSpanHeight
          );

          for (var j=0; j<widgetRowSpan; j++) {
            rowHeights[widgetRow+j].minHeight += rowIncrements[widgetRow+j];
          }
        }
      }
    },


    /**
     * Check whether all col spans fit with their prefferred width into the
     * preferred column widths. If there is not enough space the preferred
     * column sizes are increased. The distribution respects the flex and max
     * values of the columns.
     *
     *  The same is true for the min sizes.
     *
     *  The width array is modified in place.
     *
     * @param colWidths {Map[]} The current column width array as computed by
     *     {@link #_getColWidths}.
     */
    _fixWidthsColSpan : function(colWidths)
    {
      var hSpacing = this.getHorizontalSpacing();

      for (var i=0, l=this._colSpans.length; i<l; i++)
      {
        var widget = this._colSpans[i];
        var hint = widget.getSizeHint();

        var widgetColumn = widget.getLayoutProperty("grid.column");
        var widgetColSpan = widget.getLayoutProperty("grid.colSpan") || 1;

        var prefSpanWidth = hSpacing * (widgetColSpan - 1);
        var minSpanWidth = prefSpanWidth;

        var prefColFlex = [];
        var minColFlex = [];

        for (var j=0; j<widgetColSpan; j++)
        {
          var col = widgetColumn+j;
          var colWidth = colWidths[col];
          var colFlex = this._getColumnData(col).flex;

          // compute flex array for the preferred width
          prefColFlex.push({
            id: col,
            potential: colWidth.maxWidth - colWidth.width,
            flex: colFlex
          });
          prefSpanWidth += colWidth.width;

          // compute flex array for the min width
          minColFlex.push({
            id: col,
            potential: colWidth.maxWidth - colWidth.minWidth,
            flex: colFlex
          });
          minSpanWidth += colWidth.minWidth;
        }

        // If there is not enought space for the preferred size
        // increment the preferred column sizes.
        if (prefSpanWidth < hint.width)
        {
          var colIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            prefColFlex, hint.width - prefSpanWidth
          );

          for (var j=0; j<widgetColSpan; j++) {
            colWidths[widgetColumn+j].width += colIncrements[widgetColumn+j];
          }
        }

        // If there is not enought space for the min size
        // increment the min column sizes.
        if (minSpanWidth < hint.minWidth)
        {
          var colIncrements = qx.ui2.layout.Util.computeFlexOffsets(
            minColFlex, hint.minWidth - minSpanWidth
          );

          for (var j=0; j<widgetColSpan; j++) {
            colWidths[widgetColumn+j].minWidth += colIncrements[widgetColumn+j];
          }
        }
      }
    },


    _getRowHeights : function()
    {
      if (this._rowHeights != null) {
        return this._rowHeights;
      }

      var rowHeights = [];

      for (var row=0; row<=this._maxRowIndex; row++)
      {
        var minHeight = 0;
        var height = 0;
        var maxHeight = 0;

        for (var col=0; col<=this._maxColIndex; col++)
        {
          var cellData = this.getCellData(row, col);
          if (!cellData.widget) {
            continue;
          }

          var widgetRowSpan = cellData.widget.getLayoutProperty("grid.rowSpan") || 1;
          if (widgetRowSpan > 1) {
            continue;
          }

          var cellSize = cellData.widget.getSizeHint();
          minHeight = Math.max(minHeight, cellSize.minHeight);
          height = Math.max(height, cellSize.height);
          maxHeight = Math.max(maxHeight, cellSize.maxHeight);
        }

        var rowData = this._getRowData(row);

        var minHeight = Math.max(minHeight, rowData.minHeight);
        var maxHeight = Math.min(maxHeight, rowData.maxHeight);
        var height = Math.max(minHeight, Math.min(height, maxHeight));

        rowHeights[row] = {
          minHeight : minHeight,
          height : height,
          maxHeight : maxHeight
        };

      }

      this._fixHeightsRowSpan(rowHeights);

      this._rowHeights = rowHeights;
      return rowHeights;
    },


    _getColWidths : function()
    {
      if (this._colWidths != null) {
        return this._colWidths;
      }

      var colWidths = [];

      for (var col=0; col<=this._maxColIndex; col++)
      {
        var width = 0;
        var minWidth = 0;
        var maxWidth = 32000;

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          var cellData = this.getCellData(row, col);
          if (!cellData.widget) {
            continue;
          }

          var widgetColSpan = cellData.widget.getLayoutProperty("grid.colSpan") || 1;
          if (widgetColSpan > 1) {
            continue;
          }

          var cellSize = cellData.widget.getSizeHint();

          minWidth = Math.max(minWidth, cellSize.minWidth);
          width = Math.max(width, cellSize.width);
          maxWidth = Math.max(maxWidth, cellSize.maxWidth);
        }

        var colData = this._getColumnData(col);

        var minWidth = Math.max(minWidth, colData.minWidth);
        var maxWidth = Math.min(maxWidth, colData.maxWidth);
        var width = Math.max(minWidth, Math.min(width, maxWidth));

        colWidths[col] = {
          minWidth: minWidth,
          width : width,
          maxWidth : maxWidth
        };
      }

      this._fixWidthsColSpan(colWidths);

      this._colWidths = colWidths;
      return colWidths;
    },


    _getColumnFlexOffsets : function(width)
    {
      var hint = this.getSizeHint();
      var diff = width - hint.width;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var colWidths = this._getColWidths();
      var flexibles = [];

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];

        if (col.width == col.maxWidth && col.Width == col.minWidth) {
          continue;
        }

        var colFlex = this._getColumnData(i).flex;

        if (colFlex > 0)
        {
          flexibles.push({
            id : i,
            potential : diff > 0 ? col.maxWidth - col.width : col.width - col.minWidth,
            flex : colFlex
          });
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    _getRowFlexOffsets : function(height)
    {
      var hint = this.getSizeHint();
      var diff = height - hint.height;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var rowHeights = this._getRowHeights();
      var flexibles = [];

      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];

        if (row.height == row.maxHeight && row.Height == row.minHeight) {
          continue;
        }

        var rowFlex = this._getRowData(i).flex;

        if (rowFlex > 0)
        {
          flexibles.push({
            id : i,
            potential : diff > 0 ? row.maxHeight - row.height : row.height - row.minHeight,
            flex : rowFlex
          });
        }
      }

      return qx.ui2.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    // overridden
    layout : function(width, height)
    {
      var Util = qx.ui2.layout.Util;
      var hSpacing = this.getHorizontalSpacing();
      var vSpacing = this.getVerticalSpacing();

      // calculate column widths
      var prefWidths = this._getColWidths();
      var colStretchOffsets = this._getColumnFlexOffsets(width);
      var colWidths = [];
      for (var col=0; col<=this._maxColIndex; col++) {
        colWidths[col] = prefWidths[col].width + (colStretchOffsets[col] || 0);
      }

      // calculate row heights
      var prefHeights = this._getRowHeights();
      var rowStretchOffsets = this._getRowFlexOffsets(height);
      var rowHeights = [];
      for (var row=0; row<=this._maxRowIndex; row++) {
        rowHeights[row] = prefHeights[row].height + (rowStretchOffsets[row] || 0);
      }

      // do the layout
      var left = 0;
      for (var col=0; col<=this._maxColIndex; col++)
      {
        var top = 0;

        for (var row=0; row<=this._maxRowIndex; row++)
        {
          var cellData = this.getCellData(row, col);

          // ignore empty cells
          if (!cellData.widget)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          var widgetRow = cellData.widget.getLayoutProperty("grid.row");
          var widgetColumn = cellData.widget.getLayoutProperty("grid.column");

          // ignore cells, which have cell spanning but are not the origin
          // of the widget
          if(widgetRow !== row || widgetColumn !== col)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          // compute sizes width including cell spanning
          var widgetColSpan = cellData.widget.getLayoutProperty("grid.colSpan") || 1;
          var spanWidth = hSpacing * (widgetColSpan - 1);
          for (var i=0; i<widgetColSpan; i++) {
            spanWidth += colWidths[col+i];
          }

          var widgetRowSpan = cellData.widget.getLayoutProperty("grid.rowSpan") || 1;
          var spanHeight = vSpacing * (widgetRowSpan - 1);
          for (var i=0; i<widgetRowSpan; i++) {
            spanHeight += rowHeights[row+i];
          }

          var cellHint = cellData.widget.getSizeHint();

          var cellWidth = Math.min(spanWidth, cellHint.maxWidth);
          var cellHeight = Math.min(spanHeight, cellHint.maxHeight);

          var cellLeft = left + Util.computeHorizontalAlignOffset(cellData.hAlign, cellWidth, spanWidth);
          var cellTop = top + Util.computeVerticalAlignOffset(cellData.vAlign, cellHeight, spanHeight);

          cellData.widget.layout(
            cellLeft,
            cellTop,
            cellWidth,
            cellHeight
          );

          top += rowHeights[row] + vSpacing;
        }

        left += colWidths[col] + hSpacing;
      }

    },

    // overridden
    invalidate : function()
    {
      if (this._sizeHint || this._rowHeights || this._colHeights)
      {
        this.debug("Clear layout cache");

        this._sizeHint = null;
        this._rowHeights = null;
        this._colHeights = null;
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint != null)
      {
        this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;
      }

      // calculate col widths
      var colWidths = this._getColWidths();

      var minWidth=0, width=0, maxWidth=0;

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];
        minWidth += col.minWidth;
        width += col.width;
        maxWidth += col.maxWidth;
      }

      // calculate row heights
      var rowHeights = this._getRowHeights();
      var minHeight=0, height=0, maxHeight=0;

      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];

        minHeight += row.minHeight;
        height += row.height;
        maxHeight += row.maxHeight;
      }

      var spacingX = this.getHorizontalSpacing() * (colWidths.length - 1);
      var spacingY = this.getVerticalSpacing() * (rowHeights.length - 1);

      var hint = {
        minWidth : minWidth + spacingX,
        width : width + spacingX,
        maxWidth : maxWidth + spacingX,
        minHeight : minHeight + spacingY,
        height : height + spacingY,
        maxHeight : maxHeight + spacingY
      };

      this.debug("Computed size hint: ", hint);
      this._sizeHint = hint;

      return hint;
    }

  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});