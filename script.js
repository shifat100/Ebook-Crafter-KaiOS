function scrollIntoViewPolyfill(el, options) {
    if (!el || !el.scrollIntoView) return;

    var rect = el.getBoundingClientRect();
    var parent = el.parentNode;

    while (parent && parent !== document.body && parent.scrollHeight <= parent.clientHeight) {
        parent = parent.parentNode;
    }

    if (!parent || !parent.scrollTo) {
        el.scrollIntoView();
        return;
    }

    var parentRect = parent.getBoundingClientRect();

    if (options && options.block === 'center') {
        var scrollTop = parent.scrollTop + (rect.top + rect.bottom) / 2 - (parentRect.top + parentRect.bottom) / 2;
        parent.scrollTop = scrollTop;
    } else {
        el.scrollIntoView();
    }
}

document.addEventListener('DOMContentLoaded', function () {

    var statusBarTitleEl = document.getElementById('status-title');
    var menuListEl = document.getElementById('menu-list');
    var contentViewerEl = document.getElementById('content-viewer');
    var softkeyLeftEl = document.getElementById('softkey-left');
    var softkeyCenterEl = document.getElementById('softkey-center');
    var softkeyRightEl = document.getElementById('softkey-right');
    var linkListOverlayEl = document.getElementById('link-list-overlay');
    var linkListUlEl = document.getElementById('link-list-ul');

    var vendorLogoScreenEl = document.getElementById('vendor-logo-screen');
    var soundConfirmScreenEl = document.getElementById('sound-confirm-screen');
    var splashScreenEl = document.getElementById('splash-screen');

    var appStatusBarEl = document.querySelector('.status-bar');
    var appMainContentEl = document.querySelector('.main-content');
    var appSoftkeysEl = document.querySelector('.softkeys');

    var BASE_SYS_PATH = 'sys/';
    var BASE_TEXT_PATH = 'text/';
    var BASE_IMG_PATH = 'img/';
    var APP_NAME = "MENU";
    var INITIAL_MENU = 'main.mnu';
    var SETTINGS_FILE = BASE_SYS_PATH + 'settings.txt';

    var currentView = 'menu';
    var currentMenuItems = [];
    var currentTextLinks = [];
    var selectedIndex = 0;
    var historyStack = [];

    var isAutoScrolling = false;
    var appSettings = {};
    var SCROLL_INTERVAL_MS = 50;
    var scrollIntervalId = null;
    var manualScrollAmount = 30;
    var autoScrollSpeedBase = 1;

    var backgroundMusic = new Audio();
    var soundEnabled = false;
    var MUSIC_FILE_PATH = 'snd/music.mp3';

    var startupStep = 'vendorLogo';
    var vendorLogoTimerId = null;
    var splashTimerId = null;

    var settingKeys = [
        'bgColor', 'menuFontColor', 'menuSelectedSettings', 'textFontColor',
        'scrollbarMainColor', 'scrollbarBorderColor', 'cursorBorderColor', 'cursorMainColor',
        'clockMainColor', 'clockBorderColor', 'lineSpacing', 'bgImageDimLevel',
        'useBgImage', 'promptSound', 'manualScrollAmount', 'autoScrollSpeedBase'
    ];

    function getDefaultSettings() {
        return {
            bgColor: '0,0,0', menuFontColor: '255,200,200,200', menuSelectedSettings: '255,255,255,255',
            textFontColor: '255,255,255', scrollbarMainColor: '255,0,0,0', scrollbarBorderColor: '127,255,255,255',
            cursorBorderColor: '100,100,100', cursorMainColor: '0,0,0', clockMainColor: '255,255,255,255',
            clockBorderColor: '255,0,0,0', lineSpacing: '2', bgImageDimLevel: '60',
            useBgImage: 'yes', promptSound: 'yes', manualScrollAmount: '30', autoScrollSpeedBase: '1'
        };
    }

    function parseColorString(colorStr, isArgb) {
        var parts = colorStr.split(',');
        if (isArgb) {
            if (parts.length === 4) {
                var a = parseInt(parts[0], 10) / 255;
                return 'rgba(' + parseInt(parts[1], 10) + ',' + parseInt(parts[2], 10) + ',' + parseInt(parts[3], 10) + ',' + a.toFixed(3) + ')';
            }
        } else {
            if (parts.length === 3) {
                return 'rgb(' + parseInt(parts[0], 10) + ',' + parseInt(parts[1], 10) + ',' + parseInt(parts[2], 10) + ')';
            }
        }
        return isArgb ? 'rgba(0,0,0,1)' : 'rgb(0,0,0)';
    }

    function getContrastColor(rgbString) {
        var r_val = 0, g_val = 0, b_val = 0;
        var parts = rgbString.split(',');
        if (parts.length === 3) {
            r_val = parseInt(parts[0].replace('rgb(', '').trim(), 10);
            g_val = parseInt(parts[1].trim(), 10);
            b_val = parseInt(parts[2].replace(')', '').trim(), 10);
        } else if (parts.length === 4) {
            r_val = parseInt(parts[1].trim(), 10);
            g_val = parseInt(parts[2].trim(), 10);
            b_val = parseInt(parts[3].replace(')', '').trim(), 10);
        }
        var brightness = (r_val * 299 + g_val * 587 + b_val * 114) / 1000;
        return brightness > 128 ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
    }

    function parseSettings(settingsContent) {
        var lines = settingsContent.split('\n');
        var parsed = {};
        var defaults = getDefaultSettings();
        for (var i = 0; i < settingKeys.length; i++) {
            var key = settingKeys[i];
            if (lines[i]) {
                var valuePart = lines[i].split('-')[0].trim();
                parsed[key] = valuePart ? valuePart : defaults[key];
            } else {
                parsed[key] = defaults[key];
            }
        }
        return parsed;
    }

    function applySettings(settings) {
        appSettings = settings;
        appSettings.soundChoiceMade = false;
        appSettings.soundEnabledByUser = false;

        manualScrollAmount = parseInt(appSettings.manualScrollAmount, 10) || 30;
        autoScrollSpeedBase = parseInt(appSettings.autoScrollSpeedBase, 10) || 1;

        var css = "";
        var bgColor = parseColorString(appSettings.bgColor, false);
        var menuFontColor = parseColorString(appSettings.menuFontColor, true);
        var menuSelectedBgColor = parseColorString(appSettings.menuSelectedSettings, true);
        var menuSelectedFontColor = getContrastColor(appSettings.menuSelectedSettings);
        var textFontColor = parseColorString(appSettings.textFontColor, false);
        var scrollbarMain = parseColorString(appSettings.scrollbarMainColor, true);
        var scrollbarBorder = parseColorString(appSettings.scrollbarBorderColor, true);
        var cursorMain = parseColorString(appSettings.cursorMainColor, false);
        var clockMain = parseColorString(appSettings.clockMainColor, true);
        var clockBorderParts = appSettings.clockBorderColor.split(',');
        var clockBorderCss = 'transparent';
        if (clockBorderParts.length === 4) {
            clockBorderCss = 'rgba(' + parseInt(clockBorderParts[1], 10) + ',' + parseInt(clockBorderParts[2], 10) + ',' + parseInt(clockBorderParts[3], 10) + ',' + (parseInt(clockBorderParts[0], 10) / 255).toFixed(3) + ')';
        } else if (clockBorderParts.length === 3) {
            clockBorderCss = 'rgb(' + parseInt(clockBorderParts[0], 10) + ',' + parseInt(clockBorderParts[1], 10) + ',' + parseInt(clockBorderParts[2], 10) + ')';
        }
        var lineSpacing = (parseInt(appSettings.lineSpacing, 10) || 0) + 'px';
        var useBgImg = appSettings.useBgImage.toLowerCase() === 'yes';
        var bgDimAlpha = (parseInt(appSettings.bgImageDimLevel, 10) || 0) / 255;

        css += "body { background-color: " + bgColor + "; }\n";
        css += ".status-bar { color: " + clockMain + "; text-shadow: -1px -1px 0 " + clockBorderCss + ", 1px -1px 0 " + clockBorderCss + ", -1px 1px 0 " + clockBorderCss + ", 1px 1px 0 " + clockBorderCss + "; }\n";
        css += ".main-content { background-color: " + bgColor + "; ";
        if (useBgImg) {
            css += "background-image: url('img/fon.png'), linear-gradient(rgba(0,0,0," + bgDimAlpha.toFixed(3) + "), rgba(0,0,0," + bgDimAlpha.toFixed(3) + ")); background-size: cover; background-position: center; background-blend-mode: overlay;";
        }
        css += "scrollbar-color: " + scrollbarMain + " " + scrollbarBorder + "; }\n";
        css += ".main-content::-webkit-scrollbar { width: 10px; }\n";
        css += ".main-content::-webkit-scrollbar-track { background: " + scrollbarBorder + "; }\n";
        css += ".main-content::-webkit-scrollbar-thumb { background: " + scrollbarMain + "; }\n";
        css += "#menu-list li, #link-list-ul li { color: " + menuFontColor + "; border-bottom-color: " + menuFontColor.replace('rgba', 'rgba').replace('rgb', 'rgba').replace(')', ',0.3)') + "; }\n";
        css += "#menu-list li.selected, #link-list-ul li.selected { background-color: " + menuSelectedBgColor + "; color: " + menuSelectedFontColor + "; }\n";
        css += "#content-viewer { color: " + textFontColor + "; line-height: calc(1em + " + lineSpacing + "); caret-color: " + cursorMain + "; }\n";
        css += "#link-list-ul { background-color: " + bgColor + "; }\n";

        var dynamicStylesEl = document.getElementById('dynamic-styles');
        if (dynamicStylesEl) { dynamicStylesEl.innerHTML = css; }
    }

    function initializeApp() {
        vendorLogoScreenEl.classList.add('hidden');
        soundConfirmScreenEl.classList.add('hidden');
        splashScreenEl.classList.add('hidden');

        appStatusBarEl.style.visibility = 'visible';
        appMainContentEl.style.visibility = 'visible';
        appSoftkeysEl.style.visibility = 'visible';

        loadMnu(INITIAL_MENU, APP_NAME);
        if (soundEnabled) { playBackgroundMusic(); }
        startupStep = 'app';
        updateSoftkeys();
    }

    function showVendorLogo() {
        startupStep = 'vendorLogo';
        vendorLogoScreenEl.classList.remove('hidden');
        updateSoftkeys();
        vendorLogoTimerId = setTimeout(function () {
            vendorLogoScreenEl.classList.add('hidden');
            if (appSettings.promptSound && appSettings.promptSound.toLowerCase() === 'yes') {
                showSoundConfirmation();
            } else {
                soundEnabled = false;
                appSettings.soundChoiceMade = true;
                appSettings.soundEnabledByUser = false;
                showSplashScreen();
            }
        }, 2000);
    }

    function showSoundConfirmation() {
        startupStep = 'soundConfirm';
        soundConfirmScreenEl.classList.remove('hidden');
        updateSoftkeys();
    }

    function handleSoundConfirmation(enable) {
        soundEnabled = enable;
        soundConfirmScreenEl.classList.add('hidden');
        if (appSettings.promptSound && appSettings.promptSound.toLowerCase() === 'yes') {
            appSettings.soundChoiceMade = true;
            appSettings.soundEnabledByUser = enable;
        }
        showSplashScreen();
    }

    function showSplashScreen() {
        startupStep = 'splash';
        splashScreenEl.classList.remove('hidden');
        splashScreenEl.style.backgroundImage = "url('img/fon.png')";
        splashScreenEl.style.backgroundSize = 'cover';
        splashScreenEl.style.backgroundPosition = 'center';
        splashScreenEl.style.backgroundColor = 'black';
        updateSoftkeys();
        splashTimerId = setTimeout(function () {
            splashScreenEl.classList.add('hidden');
            initializeApp();
        }, 2500);
    }

    function playBackgroundMusic() {
        if (soundEnabled && MUSIC_FILE_PATH) {
            backgroundMusic.src = MUSIC_FILE_PATH;
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.5;
            var playPromise = backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(function (error) {
                    console.warn("Background music autoplay prevented:", error);
                });
            }
        }
    }

    function stopBackgroundMusic() {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    function loadAndApplySettings(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', SETTINGS_FILE, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var settingsToApply;
                if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                    settingsToApply = parseSettings(xhr.responseText);
                } else {
                    console.warn("Failed to load settings.txt. Using default. Status: " + xhr.status);
                    settingsToApply = parseSettings("");
                }
                applySettings(settingsToApply);
                callback();
            }
        };
        xhr.onerror = function () {
            console.error("Network error loading settings.txt. Using default.");
            applySettings(parseSettings(""));
            callback();
        };
        xhr.send();
    }

    function loadFile(filePath, successCallback, errorCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', filePath, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                    successCallback(xhr.responseText);
                } else {
                    var errorMsg = "Load failed: " + filePath.split('/').pop();
                    if (xhr.status !== 0) { errorMsg += " (Status: " + xhr.status + ")"; }
                    errorCallback(errorMsg, filePath);
                }
            }
        };
        xhr.onerror = function () { errorCallback("Network error: " + filePath.split('/').pop(), filePath); };
        xhr.send();
    }

    function loadMnu(mnuFileName, title, restoreState) {
        var fullPath = BASE_SYS_PATH + mnuFileName;
        title = title || mnuFileName;
        loadFile(fullPath, function (mnuContent) {
            currentMenuItems = parseMnuContent(mnuContent);
            renderMenu(title);
            currentView = 'menu';
            menuListEl.style.display = 'block';
            contentViewerEl.style.display = 'none';
            contentViewerEl.classList.add('hidden');
            linkListOverlayEl.classList.add('hidden');
            selectedIndex = (restoreState && typeof restoreState.selectedIndex === 'number') ? restoreState.selectedIndex : 0;
            updateSelectionDisplay();

            var lastHistory = historyStack.length > 0 ? historyStack[historyStack.length - 1] : null;
            if (!restoreState) {
                if (!lastHistory || lastHistory.path !== fullPath || lastHistory.type !== 'menu') {
                    historyStack.push({ type: 'menu', path: fullPath, title: title, scrollPos: 0, selectedIndex: 0 });
                } else {
                    lastHistory.title = title;
                    lastHistory.selectedIndex = 0;
                    lastHistory.scrollPos = 0;
                }
            } else {
                if (lastHistory && lastHistory.path === fullPath && lastHistory.type === 'menu') {
                    lastHistory.title = title;
                    lastHistory.selectedIndex = selectedIndex;
                    lastHistory.scrollPos = restoreState.scrollPos;
                }
            }
            if (restoreState && typeof restoreState.scrollPos === 'number') {
                setTimeout(function () { menuListEl.scrollTop = restoreState.scrollPos; updateSelectionDisplay(); }, 0);
            } else {
                menuListEl.scrollTop = 0;
                updateSelectionDisplay();
            }
            updateSoftkeys();
            currentTextLinks = [];
        }, function (errorMessage, attemptedPath) { displayError(errorMessage, attemptedPath); });
    }

    function parseMnuContent(content) {
        var lines = content.split('\n').map(function (line) { return line.trim(); }).filter(function (line) { return line; });
        var items = [];
        for (var i = 0; i < lines.length; i += 2) {
            if (lines[i] && lines[i + 1]) {
                items.push({ title: lines[i], target: lines[i + 1] });
            }
        }
        return items;
    }

    function renderMenu(title) {
        statusBarTitleEl.textContent = title || APP_NAME;
        menuListEl.innerHTML = '';
        currentMenuItems.forEach(function (item, index) {
            var li = document.createElement('li');
            li.textContent = item.title;
            li.dataset.index = index;
            li.addEventListener('click', function () { handleMenuItemClick(index); });
            menuListEl.appendChild(li);
        });
    }

    function updateSelectionDisplay() {
        var listEl = currentView === 'menu' ? menuListEl : linkListUlEl;
        var items = currentView === 'menu' ? currentMenuItems : currentTextLinks;
        var childrenArray = Array.prototype.slice.call(listEl.children);
        childrenArray.forEach(function (li) { li.classList.remove('selected'); });
        if (items.length > 0 && selectedIndex >= 0 && selectedIndex < items.length) {
            var selectedLi = listEl.children[selectedIndex];
            if (selectedLi) {
                selectedLi.classList.add('selected');
                setTimeout(function () {

                    scrollIntoViewPolyfill(selectedLi, { block: 'center', inline: 'nearest' });

                }, 0);
            }
        }
    }

    function loadTxt(txtFileName, title, restoreState) {
        getKaiAd({
            publisher: publisherid,
            app: appname,
            slot: slotname,
            onerror: err => console.error('Custom catch:', err),
            onready: ad => {
                ad.call('display');
            }
        });
        var fullPath = BASE_TEXT_PATH + txtFileName;
        title = title || txtFileName;
        loadFile(fullPath, function (txtContent) {
            renderTxtContent(txtContent, title);
            if (restoreState && restoreState.textLinks) { currentTextLinks = restoreState.textLinks.slice(); }
            currentView = 'content';
            menuListEl.style.display = 'none';
            contentViewerEl.style.display = 'block';
            contentViewerEl.classList.remove('hidden');
            linkListOverlayEl.classList.add('hidden');
            stopAutoScroll();

            var lastHistory = historyStack.length > 0 ? historyStack[historyStack.length - 1] : null;
            if (!restoreState) {
                if (!lastHistory || lastHistory.path !== fullPath || lastHistory.type !== 'text') {
                    historyStack.push({ type: 'text', path: fullPath, title: title, scrollPos: 0, textLinks: currentTextLinks.slice() });
                } else {
                    lastHistory.title = title;
                    lastHistory.textLinks = currentTextLinks.slice();
                    lastHistory.scrollPos = 0;
                }
            } else {
                if (lastHistory && lastHistory.path === fullPath && lastHistory.type === 'text') {
                    lastHistory.title = title;
                    lastHistory.textLinks = currentTextLinks.slice();
                    lastHistory.scrollPos = restoreState.scrollPos;
                }
            }
            if (restoreState && typeof restoreState.scrollPos === 'number') {
                setTimeout(function () { contentViewerEl.scrollTop = restoreState.scrollPos; }, 0);
            } else { contentViewerEl.scrollTop = 0; }
            updateSoftkeys();
        }, function (errorMessage, attemptedPath) { displayError(errorMessage, attemptedPath); });
    }

    function renderTxtContent(content, fileTitle) {
        statusBarTitleEl.textContent = fileTitle;
        contentViewerEl.innerHTML = ''; currentTextLinks = [];
        var lines = content.split('\n');
        var inLinkBlock = false; var linkTitle = '', linkUrl = '';
        var p = document.createElement('p'); var textBuffer = "";
        function flushTextBuffer() {
            if (textBuffer.length > 0) {
                p.appendChild(document.createTextNode(textBuffer));
                contentViewerEl.appendChild(p);
                p = document.createElement('p'); textBuffer = "";
            }
        }
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i]; var trimmedLine = line.trim();
            if (trimmedLine === '###') {
                flushTextBuffer();
                if (inLinkBlock) {
                    if (linkTitle && linkUrl) { currentTextLinks.push({ title: linkTitle, url: linkUrl }); }
                    linkTitle = ''; linkUrl = '';
                }
                inLinkBlock = !inLinkBlock; continue;
            }
            if (inLinkBlock) {
                if (!linkTitle) linkTitle = trimmedLine; else if (!linkUrl) linkUrl = trimmedLine; continue;
            }
            if (trimmedLine.indexOf('[IMG]') === 0) {
                flushTextBuffer();
                if (lines[i + 1]) {
                    var imgFileName = lines[i + 1].trim();
                    if (imgFileName) {
                        var img = document.createElement('img'); img.src = BASE_IMG_PATH + imgFileName; img.alt = imgFileName;
                        img.onerror = function () { this.alt = "Failed: " + this.src.split('/').pop(); this.style = "border:1px dashed red;padding:5px;color:red;"; };
                        contentViewerEl.appendChild(img); i++;
                    }
                }
            } else { textBuffer += line + '\n'; }
        }
        flushTextBuffer();
    }

    function showLinkList() {
        if (currentTextLinks.length === 0) return;
        var lastHistory = historyStack[historyStack.length - 1];
        if (lastHistory && (lastHistory.type === 'content' || lastHistory.type === 'text')) {
            lastHistory.scrollPos = contentViewerEl.scrollTop;
        }
        currentView = 'link-list';
        linkListOverlayEl.classList.remove('hidden');
        linkListUlEl.innerHTML = '';
        currentTextLinks.forEach(function (link, index) {
            var li = document.createElement('li'); li.textContent = link.title; li.dataset.index = index;
            li.addEventListener('click', function () { handleLinkListItemClick(index); });
            linkListUlEl.appendChild(li);
        });
        selectedIndex = 0; updateSelectionDisplay(); updateSoftkeys(); linkListUlEl.focus();
    }

    function hideLinkList() {
        linkListOverlayEl.classList.add('hidden'); currentView = 'content'; updateSoftkeys(); contentViewerEl.focus();
        var lastHistory = historyStack[historyStack.length - 1];
        if (lastHistory && (lastHistory.type === 'content' || lastHistory.type === 'text') && typeof lastHistory.scrollPos === 'number') {
            setTimeout(function () { contentViewerEl.scrollTop = lastHistory.scrollPos; }, 0);
        }
    }

    function handleLinkListItemClick(index) { selectedIndex = index; updateSelectionDisplay(); handleCenterKey(); }

    function startAutoScroll() {
        if (scrollIntervalId) clearInterval(scrollIntervalId);
        isAutoScrolling = true;
        scrollIntervalId = setInterval(function () {
            contentViewerEl.scrollTop += autoScrollSpeedBase;
            if (contentViewerEl.scrollTop >= (contentViewerEl.scrollHeight - contentViewerEl.clientHeight)) {
                stopAutoScroll();
            }
        }, SCROLL_INTERVAL_MS);
        updateSoftkeys();
    }

    function stopAutoScroll() {
        if (scrollIntervalId) clearInterval(scrollIntervalId);
        scrollIntervalId = null; isAutoScrolling = false; updateSoftkeys();
    }

    function toggleAutoScroll() { if (isAutoScrolling) { stopAutoScroll(); } else { startAutoScroll(); } }

    function handleKeyDown(e) {
        if (startupStep === 'vendorLogo') { e.preventDefault(); return; }
        if (startupStep === 'soundConfirm') {
            switch (e.key) {
                case 'SoftLeft': case 'F1': handleSoundConfirmation(true); e.preventDefault(); break;
                case 'SoftRight': case 'F2': handleSoundConfirmation(false); e.preventDefault(); break;
                case 'Enter': case 'Accept': handleSoundConfirmation(true); e.preventDefault(); break;
            }
            return;
        }
        if (startupStep === 'splash') { e.preventDefault(); return; }

        switch (e.key) {
            case 'ArrowUp': case 'Up': navigateItem(-1); e.preventDefault(); break;
            case 'ArrowDown': case 'Down': navigateItem(1); e.preventDefault(); break;
            case 'ArrowLeft': case 'Left':
                if (currentView === 'content' && !isAutoScrolling) {
                    contentViewerEl.scrollTop = Math.max(0, contentViewerEl.scrollTop - contentViewerEl.clientHeight);
                    e.preventDefault();
                }
                break;
            case 'ArrowRight': case 'Right':
                if (currentView === 'content' && !isAutoScrolling) {
                    contentViewerEl.scrollTop += contentViewerEl.clientHeight;

                    if (contentViewerEl.scrollTop > (contentViewerEl.scrollHeight - contentViewerEl.clientHeight)) {
                        contentViewerEl.scrollTop = contentViewerEl.scrollHeight - contentViewerEl.clientHeight;
                    }
                    e.preventDefault();
                }
                break;
            case 'Enter': case 'Accept': handleCenterKey(); e.preventDefault(); break;
            case 'SoftLeft': case 'F1': handleSoftLeftKey(); e.preventDefault(); break;
            case 'SoftRight': case 'F2': handleSoftRightKey(); e.preventDefault(); break;
            case 'Backspace':
                if (currentView !== 'menu' || (historyStack.length > 1 || (historyStack.length === 1 && historyStack[0].type === 'error'))) {
                    handleSoftRightKey(); e.preventDefault();
                } else if (currentView === 'menu' && historyStack.length === 1 && !(historyStack[0].path && historyStack[0].path.endsWith(INITIAL_MENU))) {
                    handleSoftRightKey(); e.preventDefault();
                }
                break;
            case '1': if (currentView === 'content' && !isAutoScrolling) contentViewerEl.scrollTop = 0; break;
            case '2': if (currentView === 'content' && !isAutoScrolling) contentViewerEl.scrollTop -= (manualScrollAmount * 2); break;
            case '3': if (currentView === 'content' && !isAutoScrolling) contentViewerEl.scrollTop = Math.max(0, contentViewerEl.scrollHeight - contentViewerEl.clientHeight); break;
            case '4': if (currentView === 'content' && isAutoScrolling) autoScrollSpeedBase = Math.max(1, autoScrollSpeedBase - 1); break;
            case '5': if (currentView === 'content') toggleAutoScroll(); break;
            case '6': if (currentView === 'content' && isAutoScrolling) autoScrollSpeedBase += 1; break;
            case '8': if (currentView === 'content' && !isAutoScrolling) contentViewerEl.scrollTop += (manualScrollAmount * 2); break;
        }
    }

    function navigateItem(direction) {
        var listEl, items;
        if (currentView === 'menu') { listEl = menuListEl; items = currentMenuItems; }
        else if (currentView === 'link-list') { listEl = linkListUlEl; items = currentTextLinks; }
        else if (currentView === 'content') {
            if (!isAutoScrolling) {
                contentViewerEl.scrollTop += direction * manualScrollAmount;
            } else {
                autoScrollSpeedBase = Math.max(1, autoScrollSpeedBase + direction);
            }
            return;
        } else { return; }

        if (items.length > 0) {
            selectedIndex = (selectedIndex + direction + items.length) % items.length;
            updateSelectionDisplay();
        }
    }

    function handleMenuItemClick(index) { selectedIndex = index; updateSelectionDisplay(); handleCenterKey(); }

    function handleCenterKey() {
        if (startupStep === 'soundConfirm') { handleSoundConfirmation(true); return; }
        if (startupStep !== 'app') return;

        if (currentView === 'menu' && currentMenuItems.length > 0 && selectedIndex < currentMenuItems.length) {
            var selectedItem = currentMenuItems[selectedIndex];
            var lastHistory = historyStack[historyStack.length - 1];
            if (lastHistory && lastHistory.type === 'menu') { lastHistory.scrollPos = menuListEl.scrollTop; lastHistory.selectedIndex = selectedIndex; }

            if (selectedItem.target.toLowerCase().indexOf('.mnu') !== -1) { loadMnu(selectedItem.target, selectedItem.title); }
            else if (selectedItem.target.toLowerCase().indexOf('.txt') !== -1) { loadTxt(selectedItem.target, selectedItem.title); }
            else if (selectedItem.target === '[EXIT]') { exitApp(); }

        } else if (currentView === 'content') { toggleAutoScroll(); }
        else if (currentView === 'link-list' && currentTextLinks.length > 0 && selectedIndex < currentTextLinks.length) {
            var linkToOpen = currentTextLinks[selectedIndex].url;
            var openLinkConfirmed = true;
            if (appSettings.promptSound && appSettings.promptSound.toLowerCase() === 'yes') {
                if (appSettings.soundChoiceMade && !appSettings.soundEnabledByUser) {
                    openLinkConfirmed = true;
                } else {
                    openLinkConfirmed = window.confirm("Open link: " + currentTextLinks[selectedIndex].title + "\n(" + linkToOpen + ")?");
                }
            }
            if (openLinkConfirmed) {
                try { new MozActivity({ name: "view", data: { type: "url", url: linkToOpen } }); }
                catch (e) { window.open(linkToOpen, '_blank'); }
            }
        }
    }

    function handleSoftLeftKey() {
        if (startupStep === 'soundConfirm') { handleSoundConfirmation(true); return; }
        if (startupStep !== 'app') return;

        if (currentView === 'content' && currentTextLinks.length > 0) { showLinkList(); }
    }

    function handleSoftRightKey() {
        if (startupStep === 'soundConfirm') { handleSoundConfirmation(false); return; }
        if (startupStep !== 'app') return;

        stopAutoScroll();
        if (currentView === 'link-list') { hideLinkList(); return; }

        if (historyStack.length > 1) {
            var C = historyStack.pop();
            var B = historyStack[historyStack.length - 1];

            if (C.type === 'error' && C.failedPath && B.path === C.failedPath) {
                if (historyStack.length > 1) {
                    historyStack.pop();
                    B = historyStack[historyStack.length - 1];
                } else {
                    loadMnu(INITIAL_MENU, APP_NAME);
                    historyStack = [{ type: 'menu', path: BASE_SYS_PATH + INITIAL_MENU, title: APP_NAME, scrollPos: 0, selectedIndex: 0 }];
                    return;
                }
            }

            while (B.type === 'error' && historyStack.length > 1) {
                historyStack.pop();
                B = historyStack[historyStack.length - 1];
            }

            if (B.type === 'menu') {
                loadMnu(B.path.replace(BASE_SYS_PATH, ''), B.title, { selectedIndex: B.selectedIndex, scrollPos: B.scrollPos });
            } else if (B.type === 'text') {
                loadTxt(B.path.replace(BASE_TEXT_PATH, ''), B.title, { scrollPos: B.scrollPos, textLinks: B.textLinks ? B.textLinks.slice() : [] });
            } else if (B.type === 'error') {
                loadMnu(INITIAL_MENU, APP_NAME);
                historyStack = [{ type: 'menu', path: BASE_SYS_PATH + INITIAL_MENU, title: APP_NAME, scrollPos: 0, selectedIndex: 0 }];
            }
        } else {
            if (currentView === 'error' && historyStack.length === 1 && historyStack[0].type === 'error') {
                loadMnu(INITIAL_MENU, APP_NAME);
                historyStack = [{ type: 'menu', path: BASE_SYS_PATH + INITIAL_MENU, title: APP_NAME, scrollPos: 0, selectedIndex: 0 }];
            } else {
                exitApp();
            }
        }
    }

    function updateSoftkeys() {
        softkeyLeftEl.textContent = ''; softkeyCenterEl.textContent = ''; softkeyRightEl.textContent = '';
        if (startupStep === 'vendorLogo' || startupStep === 'splash') { return; }
        if (startupStep === 'soundConfirm') {
            softkeyLeftEl.textContent = 'YES';
            softkeyRightEl.textContent = 'NO';
            return;
        }

        if (currentView === 'menu') {
            softkeyCenterEl.textContent = currentMenuItems.length > 0 ? 'SELECT' : '';
            var isInitialMenuScreen = historyStack.length === 1 && historyStack[0].path === (BASE_SYS_PATH + INITIAL_MENU);
            softkeyRightEl.textContent = (historyStack.length <= 1 && isInitialMenuScreen) ? 'EXIT' : 'BACK';
        } else if (currentView === 'content') {
            softkeyLeftEl.textContent = currentTextLinks.length > 0 ? 'LINKS' : '';
            softkeyCenterEl.textContent = isAutoScrolling ? 'PAUSE' : 'SCROLL';
            softkeyRightEl.textContent = 'BACK';
        } else if (currentView === 'link-list') {
            softkeyCenterEl.textContent = currentTextLinks.length > 0 ? 'OPEN' : '';
            softkeyRightEl.textContent = 'CLOSE';
        } else if (currentView === 'error') {
            softkeyCenterEl.textContent = '';
            if (historyStack.length > 1 || (historyStack.length === 1 && historyStack[0].failedPath === (BASE_SYS_PATH + INITIAL_MENU))) {
                softkeyRightEl.textContent = 'BACK';
            } else {
                softkeyRightEl.textContent = 'EXIT';
            }
        }
    }

    function displayError(message, failedPathContext) {
        statusBarTitleEl.textContent = "Error";
        contentViewerEl.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">' + message + '</p>';
        menuListEl.style.display = 'none'; contentViewerEl.style.display = 'block';
        contentViewerEl.classList.remove('hidden'); linkListOverlayEl.classList.add('hidden');
        currentView = 'error'; currentTextLinks = []; stopAutoScroll();

        var lastHistory = historyStack.length > 0 ? historyStack[historyStack.length - 1] : null;
        var actualFailedPath = failedPathContext || '';

        if (lastHistory && lastHistory.type === 'error' && lastHistory.failedPath === actualFailedPath) {
            lastHistory.title = 'Error: ' + message;
        } else {
            historyStack.push({ type: 'error', path: '', title: 'Error: ' + message, scrollPos: 0, failedPath: actualFailedPath });
        }
        updateSoftkeys();
    }

    function exitApp() {
        getKaiAd({
            publisher: publisherid,
            app: appname,
            slot: slotname,
            onerror: err => console.error('Custom catch:', err),
            onready: ad => {
                ad.call('display');
            }
        });

        var exitConfirmed = true;
        if (appSettings.promptSound && appSettings.promptSound.toLowerCase() === 'yes') {
            exitConfirmed = confirm('Sure to Exit ?');
        }
        if (exitConfirmed) {
            stopBackgroundMusic();
            try { window.close(); } catch (e) { console.warn("window.close() failed.", e); }
        }
    }

    window.addEventListener('keydown', handleKeyDown);
    softkeyLeftEl.addEventListener('click', handleSoftLeftKey);
    softkeyCenterEl.addEventListener('click', handleCenterKey);
    softkeyRightEl.addEventListener('click', handleSoftRightKey);

    loadAndApplySettings(showVendorLogo);
    getKaiAd({
        publisher: publisherid,
        app: appname,
        slot: slotname,
        onerror: err => console.error('Custom catch:', err),
        onready: ad => {
            ad.call('display');
        }
    });
});