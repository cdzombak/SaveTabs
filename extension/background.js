/// Returns a string of the given number, padded to the given length with leading zeros.
function pad(x, len) {
    var str = '' + x;
    while (str.length < len) str = '0' + str;
    return str;
}

/// Returns the current date, in human-friendly "yyyy-mm-dd h:mm" format.
function getCurrentDateTime() {
    var now = new Date();
    return now.getFullYear() + '-' + pad(now.getMonth()+1,2) + '-' + pad(now.getDate(),2) + ' ' + now.getHours() + ':' + pad(now.getMinutes(),2);
}

/// Changes the browser action icon to the "done" state.
/// Schedules a timer to change the icon back later.
function changeIcon() {
    chrome.browserAction.setIcon({"path": "icon-done.png"});
    chrome.alarms.create("cdz.savetabs.resetIconAlarm", {delayInMinutes: 0.025}); // 1500 ms == 0.025 minutes
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "cdz.savetabs.resetIconAlarm") {
        chrome.browserAction.setIcon({"path": "icon.png"});
    }
});

chrome.browserAction.onClicked.addListener(function(currentTab) {
    // default settings:
    if (!localStorage['firstStart']) {
        localStorage['bookmarkFolderId'] = 1;
        localStorage['firstStart'] = 1;
    }

    var parentFolderId = localStorage['bookmarkFolderId'];

    chrome.tabs.getAllInWindow(currentTab.windowId, function(tabs){
        // Don't save an empty folder
        if (!tabs.length) return;

        chrome.bookmarks.create({
            'parentId': parentFolderId,
            'title':    getCurrentDateTime()
        }, function(folder) {
            for (var i=0; i<tabs.length; i++) {
                chrome.bookmarks.create({
                    'parentId': folder.id,
                    'index':    i,
                    'title':    tabs[i].title,
                    'url':      tabs[i].url
                });
            }
        });

        changeIcon();
    });
});
