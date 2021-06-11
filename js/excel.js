import { toDisplayScore } from './index.js';

export function generateXLSFile(data) {


    var createXLSLFormatObj = [];

    /* XLS Head Columns */
    var xlsHeader = [];
    for (let i = 0; i < Object.values(data).length; i++) {
        xlsHeader.push('Zawodnik', 'Wynik', 'Trasa');
    }

    /* XLS Rows Data */
    var xlsRows = [];

    let maxRows = 0;
    Object.values(data).forEach(route => {
        if (route.length > maxRows) maxRows = route.length;
    })
    Object.values(data).forEach((value) => {
        for (let i = 0; i < maxRows; i++) {
            if (xlsRows[i] == undefined) xlsRows[i] = [];
            let entry = value[i]
            if (entry) xlsRows[i].push(entry.name, toDisplayScore(entry.score), entry.route);
            else xlsRows[i].push('', '', '');
        }
    })
    //xlsRows[index].push(entry.name, toDisplayScore(entry.score), route);

    createXLSLFormatObj.push(xlsHeader);
    
    xlsRows.forEach(row => {
        createXLSLFormatObj.push(row);
    })

    /* File Name */
    var filename = "Wyniki.xlsx";

    /* Sheet Name */
    var ws_name = "Wyniki";

    var wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

    /* Add worksheet to workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    /* Write workbook and Download */
    XLSX.writeFile(wb, filename);

};