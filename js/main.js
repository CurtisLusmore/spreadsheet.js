function sum(arr) {
    return arr.reduce((a, b) => a+b);
}

var grid = (function () {
    function createCell(sheet, r, c) {
        var callbacks = {};
        var cell = document.createElement('input');
        cell.className = 'cell';
        cell.id = 'cell-'+r+'-'+c;

        cell.rawValue = cell.value;
        cell.register = function (source) {
            callbacks[source.id] = () => source.calculate();
        };
        cell.unregister = function (source) {
            delete callbacks[source];
        };
        cell.onfocus = function () {
            cell.value = cell.formula === undefined ? cell.value : cell.formula;
        };
        cell.onblur = function () {
            cell.value = cell.rawValue;
        };
        cell.callbacks = function () {
            for (var source in callbacks) {
              callbacks[source]();
            }
        }
        cell.onchange = function () {
            var get = (r, c) => sheet.get(cell, r, c).rawValue;
            var range = (r0, c0, r1, c1) => sheet.range(cell, r0, c0, r1, c1).map(row => row.map(cell => cell.rawValue));
            var value = cell.value;
            if (value.length > 0 && value[0] === '=') {
                cell.formula = value;
                value = value.substr(1);
                cell.calculate = () => {
                    cell.rawValue = eval(value);
                    cell.value = cell.rawValue;
                    cell.callbacks();
                };
                cell.calculate();
            } else {
                cell.rawValue = value;
                cell.formula = undefined;
                cell.callbacks();
            }
        };
        return cell;
    }

    function createRow(r, cells) {
        var row = document.createElement('div');
        row.className = 'row';
        cells.map(cell => row.appendChild(cell));
        row.get = function (c) {
            return cells[c];
        };
        return row;
    }

    function createSheet() {
        var sheet = document.createElement('div');
        sheet.className = 'sheet';
        sheet.rows = [];
        sheet.addRows = function (rows) {
            rows.map(row => {
                sheet.rows.push(row);
                sheet.appendChild(row);
            });
        };
        sheet.get = function (cell, r, c) {
            var target = sheet.rows[r].get(c);
            target.register(cell);
            return target;
        };
        sheet.range = function (cell, r0, c0, r1, c1) {
            var targets = [];
            for (var r = r0; r <= r1; r++) {
                var row = [];
                for (var c = c0; c <= c1; c++) {
                    row.push(sheet.get(cell, r, c));
                }
                targets.push(row);
            }
            return targets;
        };
        return sheet;
    }

    function init(id) {
        var sheet = createSheet();
        var height = 50;
        var width = 20;
        var rows = [];
        for (var r = 0; r < height; r++) {
            var row = [];
            for (var c = 0; c < width; c++) {
                row.push(createCell(sheet, r, c));
            }
            rows.push(createRow(r, row));
        }
        sheet.addRows(rows);
        var container = document.getElementById(id);
        container.appendChild(sheet);
        return sheet;
    }

    var sheet = init('spreadsheet');
}());
