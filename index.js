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
let curNum = 0;
let prevNum = null;
let routes = [];
let dataEntries = {};
resetBtn.addEventListener('click', resetCounter);
minusBtn.addEventListener('click', substractCounter);
addBtn.addEventListener('click', addCounter);
plusBtn.addEventListener('click', plusCounter);
topBtn.addEventListener('click', setToTop);
finishBtn.addEventListener('click', finishCounter);

routeSelector.addEventListener('change', updateResultsTable);
nameData.addEventListener('input', () => {
    if (nameData.classList.contains('error') && nameData.value.trim()) {
        nameData.classList.remove('error');
    }
})
routeData.addEventListener('input', () => {
    if (routeData.classList.contains('error') && routeData.value.trim()) {
        routeData.classList.remove('error');
    }
})
function resetCounter(notConfirm) {
    if (curNum == 0 && !nameData.value.trim() && !routeData.value.trim()) return;
    if (notConfirm != true) 
        if (!confirm('Czy na pewno chcesz zresetować pomiar?')) return;
    curNum = 0;
    resetInputs();
    updateCounter();
}
function substractCounter() {
    if (curNum <= 0) return;
    if (curNum % 1 == 0 || curNum % 1 == 0.75) {
        curNum -= 0.25;
        updateCounter();
        return;
    }
    curNum -= 0.5;
    updateCounter();
}
function addCounter() {
    if (curNum > 99) {
        curNum = 99.75;
        return;
    }
    curNum += 1;
    updateCounter();
}
function plusCounter() {
    if (curNum >= 99.75 ) return;
    if (curNum % 1 == 0) {
        curNum += 0.5;
        updateCounter();
        return;
    }
    curNum += 0.25;
    updateCounter();
}
function setToTop() {
    if (curNum == 100) {
        curNum = prevNum;
        prevNum = null;
    }
    else {
        prevNum = curNum;
        curNum = 100;
    }
    updateCounter();
}
function finishCounter() {
    if (!nameData.value) nameData.classList.add('error');
    if (!routeData.value) routeData.classList.add('error');
    if (!nameData.value || !routeData.value) return;
    nameData.classList.remove('error');
    routeData.classList.remove('error');
    if (confirm('Czy na pewno chcesz zakończyć pomiar?')) {
        addNewDataEntry();
        resetCounter(true);
    }
}
function updateCounter() {
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
}
function toDisplayScore(num) {
    if (!num && num != 0) return;
    if (num == 100) return 'top';
    let ret = Math.floor(num).toString();
    if (num % 1 == 0.5) ret += '+';
    if (num % 1 == 0.75) ret += '++';
    return ret;
}
function addNewDataEntry() {
    let route = routeData.value.toUpperCase();
    checkRouteGroup(route);
    let newDataEntry = {
        name: nameData.value,
        route,
        score: curNum,
        displayScore: toDisplayScore(curNum)
    }
    dataEntries[route].push(newDataEntry);
    updateRouteSelector();
    routeSelector.value = route;
    updateResultsTable();
}
function removeDataEntry(index) {
    let isEmpty = false;
    if (confirm('Czy na pewno chcesz usunąć ten wiersz?')) {
        dataEntries[routeSelector.value].splice(index, 1);
        if (dataEntries[routeSelector.value].length == 0) {
            routes.splice(routes.indexOf(routeSelector.value), 1);
            delete dataEntries[routeSelector.value]
            if (Object.keys(dataEntries).length == 0) {
                resultsTable.innerHTML = `<tr><th>#</th><th>Zawodnik</th><th>Wynik</th><th>Trasa</th><th></th></tr><tr class="blankCell"><td colspan="5">Brak danych!</td></tr>`
                isEmpty = true;
            }
        }
    }
    updateRouteSelector();
    if (!isEmpty) updateResultsTable();
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
        updateLocalStorage();
        return;
    }

    dataEntries[routeSelector.value].sort((a, b) => {
        return b.score - a.score;
    })
    dataEntries[routeSelector.value].forEach((entry, index) => {
        let row = document.createElement('tr');
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
        td5.innerHTML = `<button class="remove-entry" onclick="removeDataEntry(${index})">×</button>`;
        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        resultsTable.appendChild(row);
    })
    updateLocalStorage();
}
