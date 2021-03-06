// taken from https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3 and later modified
function watchForHover() {
    let lastTouchTime = 0;

    function enableHover() {
        if (new Date() - lastTouchTime < 500) return;
        document.body.classList.add('hasHover');
    }
    function enableHoverByBrowserNameMatch() {
        let pattern = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        if (pattern.test(navigator.userAgent) /* isMobile? */) {
            document.body.classList.add('hasHover');
        } else {
            document.body.classList.remove('hasHover');
        }
    }

    function disableHover() {
        document.body.classList.remove('hasHover');
    }

    function updateLastTouchTime() {
        lastTouchTime = new Date();
    }

    document.addEventListener('touchstart', updateLastTouchTime, true);
    document.addEventListener('touchstart', disableHover, true);
    document.addEventListener('mousemove', enableHover, true);
    document.addEventListener('DOMContentLoaded', enableHoverByBrowserNameMatch, true);
}

watchForHover();