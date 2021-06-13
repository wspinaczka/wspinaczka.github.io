import { Toast } from './toast.js';
import { generateXLSFile } from './excel.js';

const nameData = $('#name-data');
const routeData = $('#route-data');
const counter = $('#counter');

const routeSelector = $('#routes-selector');
const resultsTable = $('#results');

const userSettingsElements = {
    btn: $('#settings-btn'),
    list: $('.settings-list'),
    plusCount: [
        $('.settings .plus-amount #option1'),
        $('.settings .plus-amount #option2'),
        $('.settings .plus-amount #option3'),
    ],
    darkTheme: $('#dark-theme'),
}

let curNum = 0;
let prevNum = null;
let routes = [];
let dataEntries = {};
let userSettings = {
    plusCount: 1,
    darkTheme: false,
}
//settings
$('#button-plusses-zero').on('click', () => { updatePlusSettings(0); });
$('#button-plusses-one').on('click', () => { updatePlusSettings(1); });
$('#button-plusses-two').on('click', () => { updatePlusSettings(2); });
$('#button-theme').on('click', () => { updateThemeSetting(); });
//counter
$('#reset').on('click', resetCounter);
$('#minus').on('click', substractCounter);
$('#add').on('click', addCounter);
$('#plus').on('click', plusCounter);
$('#top').on('click', setToTop);
$('#finish').on('click', finishCounter);

routeSelector.on('change', updateResultsTable);

$('#reset-data').on('click', resetAllData);
$('#download-data').on('click', () => {
    generateXLSFile(dataEntries);
});

$('.copyToClipboard').each((i, el) => {
    el.addEventListener('click', () => {
        copyToClipboard(el.getAttribute('copyValue'));
    });
})

nameData.on('input', () => {
    if (nameData.hasClass('error') && nameData.val().trim()) {
        nameData.removeClass('error');
    }
    updateLocalStorageInputs();
})
routeData.on('input', () => {
    if (routeData.hasClass('error') && routeData.val().trim()) {
        routeData.removeClass('error');
    }
    updateLocalStorageInputs();
})
$('#advanced-options-btn').on('click', () => {
    showHideMenu($('#advanced-options-list'));
});
userSettingsElements.btn.on('click', () => {
    showHideMenu(userSettingsElements.list);
});

window.onscroll = () => {
    if (!userSettingsElements.list.hasClass('hidden') && !userSettingsElements.list.isInViewport()) {
        showHideMenu(userSettingsElements.list)
    }
};


function substractCounter() {
    if (curNum <= 0.75) return;
    if (curNum == 100) {
        setFromTop();
        return;
    }
    curNum -= 1;
    updateCounter();
}
function addCounter() {
    if (curNum >= 99 && curNum != 100) return;
    if (curNum == 100) {
        setFromTop();
        return;
    }
    curNum += 1;
    updateCounter();
}
function plusCounter() {
    if (userSettings.plusCount == 0) return addCounter();
    if (curNum == 100) {
        setFromTop();
        return;
    }
    if (curNum % 1 == 0 && userSettings.plusCount >= 1) curNum += 0.5;
    else if (curNum % 1 == 0.5 && userSettings.plusCount == 2) curNum += 0.25;
    else if (curNum % 1 == 0.75 || (curNum % 1 == 0.5 && userSettings.plusCount == 1)) curNum = Math.floor(curNum);
    else if (userSettings.plusCount == 0) curNum += 1;
    updateCounter();
}
function setToTop() {
    if (curNum == 100) setFromTop();
    else {
        prevNum = curNum;
        curNum = 100;
        updateCounter();
    }
}
function setFromTop() {
    curNum = prevNum;
    prevNum = null;
    updateCounter();
}
function resetCounter(notConfirm) {
    if (curNum == 0 && !nameData.val().trim() && !routeData.val().trim()) {
        resetInputs();
        return;
    }
    if (notConfirm != true) {
        if (!confirm('Czy na pewno chcesz zresetować pomiar?')) return;
    }
    new Toast({
        message: "Zresetowano.", 
        type: "success",
    }).show(5000);
    curNum = 0;
    resetInputs();
    updateCounter();
}
function finishCounter() {
    if (!nameData.val()) nameData.addClass('error');
    if (!routeData.val()) routeData.addClass('error');
    if (!nameData.val() || !routeData.val()) {
        new Toast({
            message: "Nie wszystkie pola są wypełnione!", 
            type: "error",
        }).show(5000);
        return;
    }
    if (checkIfNameExists()) {
        new Toast({
            message: "Podane dane zawodnika już istnieją!", 
            type: "error",
        }).show(5000);
        nameData.addClass('error');
        return;
    }
    nameData.removeClass('error');
    routeData.removeClass('error');
    if (confirm('Czy na pewno chcesz zakończyć pomiar?')) {
        addNewDataEntry();
        resetCounter(true);
        new Toast({
            message: "Dane zostały zapisane w tabeli wyników.", 
            type: "success",
        }).show(5000);
    }
}
function updateCounter() {
    updateLocalStorageInputs();
    counter.html(toDisplayScore(curNum));
}
function checkRouteGroup(route) {
    route = route.toUpperCase();
    if ((!dataEntries[route] || dataEntries[route] == []) && !routes.includes(route)) {
        routes.push(route);
        dataEntries[route] = [];
    }
}
function resetInputs() {
    nameData.val(null);
    routeData.val(null);
    nameData.removeClass('error');
    routeData.removeClass('error');
}
export function toDisplayScore(num) {
    if (!num && num != 0) return;
    if (num == 100) return 'top';
    let ret = Math.floor(num).toString();
    if (num % 1 == 0.5) ret += '+';
    if (num % 1 == 0.75) ret += '++';
    return ret;
}
function addNewDataEntry() {
    let route = routeData.val().toUpperCase();
    checkRouteGroup(route);
    let newDataEntry = {
        name: nameData.val(),
        route,
        score: curNum,
        displayScore: toDisplayScore(curNum),
        wasHighlighted: false,
    }
    dataEntries[route].push(newDataEntry);
    updateRouteSelector();
    routeSelector.val(route);
    updateResultsTable();
    document.getElementById("row-to-highlight").scrollIntoView();
}
function checkIfNameExists() {
    if (!dataEntries[routeData.val().toUpperCase()]) return false;
    let names = [];
    dataEntries[routeData.val().toUpperCase()].forEach(el => {
        names.push(el.name);
    })
    return names.includes(nameData.val());
}
function removeDataEntry(index) {
    let isEmpty = false;
    if (confirm('Czy na pewno chcesz usunąć ten wiersz?')) {
        dataEntries[routeSelector.val()].splice(index, 1);
        if (dataEntries[routeSelector.val()].length == 0) {
            routes.splice(routes.indexOf(routeSelector.val()), 1);
            delete dataEntries[routeSelector.val()];
            if (Object.keys(dataEntries).length == 0) {
                resultsTable.html(`<tr><th>#</th><th>Zawodnik</th><th>Wynik</th><th>Trasa</th><th></th></tr><tr class="blankCell"><td colspan="4">Brak danych!</td></tr>`)
                isEmpty = true;
            }
        }
    }
    updateRouteSelector();
    if (!isEmpty) updateResultsTable();
    new Toast({
        message: "Usunięto pozycję.", 
        type: "success",
    }).show(5000);
}
function updateRouteSelector() {
    routeSelector.html('');
    routes?.sort();
    routes.forEach((route,i) => {
        routeSelector.append(new Option(route, route));
    })
}
function updateResultsTable() {
    // if (!routeSelector.value) return;
    let forceNoData = false;
    if (!dataEntries[routeSelector.val()]) {
        forceNoData = true;
    }
    resultsTable.html('');
    let row1 = document.createElement('tr');
    let th1 = document.createElement('th');
    let th2 = document.createElement('th');
    let th3 = document.createElement('th');
    let th4 = document.createElement('th');
    let th5 = document.createElement('th');
    th1.innerHTML = '#';
    th2.innerHTML = 'Zawodnik';
    th3.innerHTML = 'Wynik';
    th4.innerHTML = 'Trasa';
    th5.innerHTML = '';
    row1.appendChild(th1);
    row1.appendChild(th2);
    row1.appendChild(th3);
    row1.appendChild(th4);
    row1.appendChild(th5);
    resultsTable.append(row1)

    if (forceNoData) {
        let endRow = document.createElement('tr')
        endRow.innerHTML = `<tr class="blankCell"><td colspan="4">Brak danych!</td></tr>`
        resultsTable.append(endRow)
        updateLocalStorageEntries();
        return;
    }

    dataEntries[routeSelector.val()].sort((a, b) => {
        return b.score - a.score;
    })
    dataEntries[routeSelector.val()].forEach((entry, index) => {
        let row = document.createElement('tr');
        if (!entry.wasHighlighted) {
            row.id = 'row-to-highlight';
            entry.wasHighlighted = true;
            setTimeout(() => {
                let rowToHighlight = document.querySelector('#row-to-highlight')
                rowToHighlight.classList.add('highlighted-row');
                setTimeout(() => {
                    rowToHighlight.classList.remove('highlighted-row');
                }, 400);
            }, 200);
        }
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let td5 = document.createElement('td');
        td1.innerHTML = index+1;
        td2.innerHTML = entry.name;
        td3.innerHTML = toDisplayScore(entry.score);
        if (td3.innerHTML == "top") td3.classList.add('top');
        td4.innerHTML = entry.route;
        td5.innerHTML = `<button class="remove-entry"><i class="fas fa-trash"></i></button>`;
        td5.addEventListener('click', () => {
            removeDataEntry(index);
        })
        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        resultsTable.append(row);
    })
    updateLocalStorageEntries();
}
function updateLocalStorageInputs() {
    try {
        localStorage.setItem('nameDataValue', nameData.val());
        localStorage.setItem('routeDataValue', routeData.val());
        localStorage.setItem('counterValue', curNum);
        localStorage.setItem('prevValue', prevNum);
    } catch (e) {
        console.error(error);
    }
}
function updateLocalStorageEntries() {
    try {
        localStorage.setItem('dataEntries', JSON.stringify(dataEntries));
        localStorage.setItem('routes', JSON.stringify(routes));
        localStorage.setItem('selectorValue', routeSelector.val());
    } catch (error) {
        console.error(error);
    }
    backupData();
}
function updateLocalStorageSettings() {
    try {
        localStorage.setItem('settings', JSON.stringify(userSettings));
    } catch (error) {
        console.error(error);
    }
}
function loadFromLocalStorage(isFromBackup = false) {
    try {
        dataEntries = JSON.parse(localStorage.getItem(`dataEntries${isFromBackup ? ('-BACKUP') : ''}`)) ?? {};
        routes = JSON.parse(localStorage.getItem(`routes${isFromBackup ? ('-BACKUP') : ''}`)) ?? [];
        routeSelector.val(localStorage.getItem(`selectorValue${isFromBackup ? ('-BACKUP') : ''}`));
        nameData.val(localStorage.getItem('nameDataValue'));
        routeData.val(localStorage.getItem('routeDataValue'));
        curNum = Number(localStorage.getItem('counterValue'));
        if (isNaN(curNum)) curNum = 0;
        prevNum = Number(localStorage.getItem('prevValue'));
        if (isNaN(prevNum)) prevNum = null;
        userSettings = JSON.parse(localStorage.getItem('settings')) ?? userSettings;
    } catch (error) {
        console.error(error);
    }
    updateCounter();
    updateRouteSelector();
    updateResultsTable();
    loadSettings();
}
function loadBackupData() {
    loadFromLocalStorage(true);
    updateLocalStorageEntries();
    new Toast({
        message: "Odzyskano dane.", 
        type: "success",
    }).show(5000);
}
loadFromLocalStorage();
function loadSettings() {
    // plus count
    userSettingsElements.plusCount[0].prop('checked', false);
    userSettingsElements.plusCount[1].prop('checked', false);
    userSettingsElements.plusCount[2].prop('checked', false);
    if (userSettings.plusCount == 0) userSettingsElements.plusCount[0].prop('checked', true);
    if (userSettings.plusCount == 1) userSettingsElements.plusCount[1].prop('checked', true);
    if (userSettings.plusCount == 2) userSettingsElements.plusCount[2].prop('checked', true);
    // theme
    if (userSettings.darkTheme) userSettingsElements.darkTheme.prop('checked', true);
    else userSettingsElements.darkTheme.prop('checked', false);
}
function getSettings() {
    if (userSettingsElements.plusCount[0].is(':checked')) userSettings.plusCount = 0;
    else if (userSettingsElements.plusCount[1].is(':checked')) userSettings.plusCount = 1;
    else if (userSettingsElements.plusCount[2].is(':checked')) userSettings.plusCount = 2;
    userSettings.darkTheme = userSettingsElements.darkTheme.is(':checked');
    updateLocalStorageSettings();
    loadDarkTheme();
}
function loadDarkTheme() {
    if (userSettings.darkTheme) {
        document.body.classList.add('dark-theme');
        return
    } 
    document.body.classList.remove('dark-theme');
}
loadDarkTheme();
function updatePlusSettings(num) {
    userSettingsElements.plusCount.forEach((el, index) => {
        if (index == num) el.prop('checked', true);
        else el.prop('checked', false);
    })
    getSettings();
    updateCounter();
    // updateResultsTable();
}
function updateThemeSetting() {
    userSettingsElements.darkTheme.prop('checked', !userSettingsElements.darkTheme.is(':checked'));
    getSettings();
}
function resetAllData() {
    if (confirm('Czy na pewno chcesz usunąć WSZYSTKIE dane zawarte w tabeli? Tej akcji nie da się cofnąć.')) {
        backupData();
        dataEntries = {};
        routes = [];
        updateRouteSelector();
        updateResultsTable();
    }
}
function backupData() {
    try {
        localStorage.setItem('dataEntries-BACKUP', JSON.stringify(dataEntries));
        localStorage.setItem('routes-BACKUP', JSON.stringify(routes));
        localStorage.setItem('selectorValue-BACKUP', routeSelector.val());
    } catch (error) {
        console.error(error);
    }
}
function copyToClipboard(str) {
    let el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style = {display: "none"};
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 9999999);
    document.execCommand('copy');
    document.body.removeChild(el);
    new Toast({message: 'Skopiowano', type: 'success'}).show(2000);
}
function showHideMenu(el) {
    el.removeClass('disallow-focusing');
    setTimeout(() => {
        el.toggleClass('hidden');
        if (el.hasClass('hidden')) {
            setTimeout(() => {
                el.addClass('disallow-focusing');
            }, 200);
        }
    }, 50);
}
$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};