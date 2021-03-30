const resetBtn = document.querySelector('#reset');
const minusBtn = document.querySelector('#minus');
const addBtn = document.querySelector('#add');
const plusBtn = document.querySelector('#plus');
const topBtn = document.querySelector('#top');
const finishBtn = document.querySelector('#finish');

const nameData = document.querySelector('#name-data');
const routeData = document.querySelector('#route-data');
const counter = document.querySelector('#counter');
let curNum = 0;
let prevNum = null;
resetBtn.addEventListener('click', resetCounter);
minusBtn.addEventListener('click', substractCounter);
addBtn.addEventListener('click', addCounter);
plusBtn.addEventListener('click', plusCounter);
topBtn.addEventListener('click', setToTop);
finishBtn.addEventListener('click', finishCounter);
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
}
