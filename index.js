const iconMap = {
    success: 'check-circle',
    warn: 'exclamation-circle',
    error: 'exclamation-circle',
    disallow: 'times-circle',
    info: 'info-circle',
}
class Toast {
    static defaults = {
        time: 3000,
    }
    constructor(options) {
        this.hideTimeout = null;
        this.el = document.createElement("div");
        this.el.className = "Toaster toast";
        this.el.textContent = (typeof(options) == "string" ? options : undefined) ?? options?.message ?? options?.msg ?? '';
        if (options && typeof(options) == 'object') {
            if (options.class && typeof(options.class) == "array") {
                options.class.forEach(cl => {
                    this.el.classList.add(cl);
                })
            }
        }
        this.time = options?.time ?? Toast.defaults.time;

        if (options?.type && iconMap[options.type]) {
            this.icon = document.createElement('i');
            this.icon.className = `toast-icon fas fa-${iconMap[options.type]}`;
            this.el.appendChild(this.icon);
        }
        if (!options?.closeButton && !options?.closeBtn) {
            this.closeBtn = document.createElement('div');
            this.closeBtn.className = `toast-close fas fa-times`;
            this.closeBtn.addEventListener('click', () => {
                this.hide();
            });
            this.el.appendChild(this.closeBtn);
        }

        if (options?.type) {
            this.el.classList.add(`toast--${options.type}`);
        }
        document.body.appendChild(this.el);
    }
    show(time) {
        clearTimeout(this.hideTimeout);
        this.el.classList.add("toast--visible");
        this.hideTimeout = setTimeout(() => {
            this.el.classList.remove("toast--visible");
        }, time ?? this.time);
    }
    hide() {
        clearTimeout(this.hideTimeout);
        this.el.classList.remove("toast--visible");
    }
}

const resetBtn = document.querySelector('#reset');
const minusBtn = document.querySelector('#minus');
const addBtn = document.querySelector('#add');
const plusBtn = document.querySelector('#plus');
const topBtn = document.querySelector('#top');
const finishBtn = document.querySelector('#finish');

const nameData = document.querySelector('#name-data');
const routeData = document.querySelector('#route-data');
const counter = document.querySelector('#counter');

const routeSelector = document.querySelector('#routes-selector');
const resultsTable = document.querySelector('#results');
const resetAllButton = document.querySelector('#reset-data');

const copyButtons = document.querySelectorAll('.copyToClipboard');

const advancedOptionsBtn = document.querySelector('#advanced-options-btn');
const advancedOptionsList = document.querySelector('#advanced-options-list');

const userSettingsElements = {
    btn: document.querySelector('#settings-btn'),
    list: document.querySelector('.settings-list'),
    plusCount: [
        document.querySelector('.settings .plus-amount #option1'),
        document.querySelector('.settings .plus-amount #option2'),
        document.querySelector('.settings .plus-amount #option3'),
    ],
    darkTheme: document.querySelector('#dark-theme'),
}

let curNum = 0;
let prevNum = null;
let routes = [];
let dataEntries = {};
let userSettings = {
    plusCount: 1,
    darkTheme: false,
}
resetBtn.addEventListener('click', resetCounter);
minusBtn.addEventListener('click', substractCounter);
addBtn.addEventListener('click', addCounter);
plusBtn.addEventListener('click', plusCounter);
topBtn.addEventListener('click', setToTop);
finishBtn.addEventListener('click', finishCounter);

routeSelector.addEventListener('change', updateResultsTable);

resetAllButton.addEventListener('click', resetAllData);

copyButtons.forEach(el => {
    el.addEventListener('click', () => {
        copyToClipboard(el.getAttribute('copyValue'));
    });
})

nameData.addEventListener('input', () => {
    if (nameData.classList.contains('error') && nameData.value.trim()) {
        nameData.classList.remove('error');
    }
    updateLocalStorageInputs();
})
routeData.addEventListener('input', () => {
    if (routeData.classList.contains('error') && routeData.value.trim()) {
        routeData.classList.remove('error');
    }
    updateLocalStorageInputs();
})

advancedOptionsBtn.addEventListener('click', () => {
    showHideMenu(advancedOptionsList);
});

userSettingsElements.btn.addEventListener('click', () => {
    showHideMenu(userSettingsElements.list);
});


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
    if (curNum == 0 && !nameData.value.trim() && !routeData.value.trim()) {
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
    if (!nameData.value) nameData.classList.add('error');
    if (!routeData.value) routeData.classList.add('error');
    if (!nameData.value || !routeData.value) {
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
        nameData.classList.add('error');
        return;
    }
    nameData.classList.remove('error');
    routeData.classList.remove('error');
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
    counter.innerHTML = toDisplayScore(curNum);
}
function checkRouteGroup(route) {
    route = route.toUpperCase();
    if ((!dataEntries[route] || dataEntries[route] == []) && !routes.includes(route)) {
        routes.push(route);
        dataEntries[route] = [];
    }
}
function resetInputs() {
    nameData.value = null;
    routeData.value = null;
    nameData.classList.remove('error');
    routeData.classList.remove('error');
}
function toDisplayScore(num) {
    if (!num && num != 0) return;
    if (num == 100) return 'top';
    let ret = Math.floor(num).toString();
    if (num % 1 == 0.5 && userSettings.plusCount >= 1) ret += '+';
    if (num % 1 == 0.75 && userSettings.plusCount == 1) ret += '+';
    if (num % 1 == 0.75 && userSettings.plusCount == 2) ret += '++';
    return ret;
}
function addNewDataEntry() {
    let route = routeData.value.toUpperCase();
    checkRouteGroup(route);
    let newDataEntry = {
        name: nameData.value,
        route,
        score: curNum,
        displayScore: toDisplayScore(curNum),
        wasHighlighted: false,
    }
    dataEntries[route].push(newDataEntry);
    updateRouteSelector();
    routeSelector.value = route;
    updateResultsTable();
    document.getElementById("row-to-highlight").scrollIntoView();
}
function checkIfNameExists() {
    let names = [];
    dataEntries[routeData.value.toUpperCase()].forEach(el => {
        names.push(el.name);
    })
    return names.includes(nameData.value);
}
function removeDataEntry(index) {
    let isEmpty = false;
    if (confirm('Czy na pewno chcesz usunąć ten wiersz?')) {
        dataEntries[routeSelector.value].splice(index, 1);
        if (dataEntries[routeSelector.value].length == 0) {
            routes.splice(routes.indexOf(routeSelector.value), 1);
            delete dataEntries[routeSelector.value]
            if (Object.keys(dataEntries).length == 0) {
                resultsTable.innerHTML = `<tr><th>#</th><th>Zawodnik</th><th>Wynik</th><th>Trasa</th><th></th></tr><tr class="blankCell"><td colspan="4">Brak danych!</td></tr>`
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
    routeSelector.innerHTML = '';
    routes?.sort();
    routes.forEach((route,i) => {
        routeSelector[i] = new Option(route, route);
    })
}
function updateResultsTable() {
    // if (!routeSelector.value) return;
    let forceNoData = false;
    if (!dataEntries[routeSelector.value]) {
        forceNoData = true;
    }
    resultsTable.innerHTML = '';
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
    resultsTable.appendChild(row1)

    if (forceNoData) {
        let endRow = document.createElement('tr')
        endRow.innerHTML = `<tr class="blankCell"><td colspan="5">Brak danych!</td></tr>`
        resultsTable.appendChild(endRow)
        updateLocalStorageEntries();
        return;
    }

    dataEntries[routeSelector.value].sort((a, b) => {
        return b.score - a.score;
    })
    dataEntries[routeSelector.value].forEach((entry, index) => {
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
        td5.innerHTML = `<button class="remove-entry" onclick="removeDataEntry(${index})"><i class="fas fa-trash"></i></button>`;
        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        resultsTable.appendChild(row);
    })
    updateLocalStorageEntries();
}
function updateLocalStorageInputs() {
    try {
        localStorage.setItem('nameDataValue', nameData.value);
        localStorage.setItem('routeDataValue', routeData.value);
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
        localStorage.setItem('selectorValue', routeSelector.value);
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
        routeSelector.value = localStorage.getItem(`selectorValue${isFromBackup ? ('-BACKUP') : ''}`);
        nameData.value = localStorage.getItem('nameDataValue');
        routeData.value = localStorage.getItem('routeDataValue');
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
    userSettingsElements.plusCount[0].checked = false;
    userSettingsElements.plusCount[1].checked = false;
    userSettingsElements.plusCount[2].checked = false;
    if (userSettings.plusCount == 0) userSettingsElements.plusCount[0].checked = true;
    if (userSettings.plusCount == 1) userSettingsElements.plusCount[1].checked = true;
    if (userSettings.plusCount == 2) userSettingsElements.plusCount[2].checked = true;
    // theme
    if (userSettings.darkTheme) userSettingsElements.darkTheme.checked = true;
    else userSettingsElements.darkTheme.checked = false;
}
function getSettings() {
    if (userSettingsElements.plusCount[0].checked) userSettings.plusCount = 0;
    else if (userSettingsElements.plusCount[1].checked) userSettings.plusCount = 1;
    else if (userSettingsElements.plusCount[2].checked) userSettings.plusCount = 2;
    userSettings.darkTheme = userSettingsElements.darkTheme.checked;
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
        if (index == num) el.checked = true;
        else el.checked = false;
    })
    getSettings();
    updateCounter();
}
function updateThemeSetting() {
    userSettingsElements.darkTheme.checked = !userSettingsElements.darkTheme.checked;
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
        localStorage.setItem('selectorValue-BACKUP', routeSelector.value);
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
    el.classList.remove('disallow-focusing');
    setTimeout(() => {
        el.classList.toggle('hidden');
        if (el.classList.contains('hidden')) {
            setTimeout(() => {
                el.classList.add('disallow-focusing');
            }, 200);
        }
    }, 50);
}