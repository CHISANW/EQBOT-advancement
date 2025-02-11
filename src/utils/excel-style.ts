export function setBorderBold (cell) {
    cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };
}

export function setFontBold (cell) {
    cell.font = {
        bold: true,
    };
}

export function setAlignment (cell, alignment) {
    cell.alignment = {
        vertical: 'middle',
        horizontal: alignment,
    };
}

export function setBackGroundColor (cell, color) {
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
    };
}

export function setBgColorAndFontBold (cell, color) {
    setBackGroundColor(cell, color);
    setFontBold(cell);
}

export function setHeaderBold (worksheet) {
    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell, colNumber) => setFontBold(cell));
}

export const createOuterBorder = (
    worksheet,
    start = { row: 1, col: 1 },
    end = { row: 1, col: 1 },
    borderWidth = 'medium',
) => {
    const borderStyle = {
        style: borderWidth,
    };

    for (let i = start.row; i <= end.row; i++) {
        const leftBorderCell = worksheet.getCell(i, start.col);
        const rightBorderCell = worksheet.getCell(i, end.col);
        leftBorderCell.border = {
            ...leftBorderCell.border,
            left: borderStyle,
        };
        rightBorderCell.border = {
            ...rightBorderCell.border,
            right: borderStyle,
        };
    }

    for (let i = start.col; i <= end.col; i++) {
        const topBorderCell = worksheet.getCell(start.row, i);
        const bottomBorderCell = worksheet.getCell(end.row, i);
        topBorderCell.border = {
            ...topBorderCell.border,
            top: borderStyle,
        };
        bottomBorderCell.border = {
            ...bottomBorderCell.border,
            bottom: borderStyle,
        };
    }
};
