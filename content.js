//global variables :todo: remove
let observer = new MutationObserver(observerCallback);
// Fetch language data
async function fetchLanguageData(language, type) {
    const response = await fetch(chrome.runtime.getURL(`lib/l18n/l18n.json`));
    const data = await response.json();
    let message = '';
    let str_yesButton = '';
    let str_noButton = '';

    switch (type) {
        case 'page':
            message = data[language].msgTitlePage;
            break;
        case 'movie':
            message = data[language].msgTitleMovie;
            break;
    }
    str_yesButton = data[language].yesBtn;
    str_noButton = data[language].noBtn;

    return { message, str_yesButton, str_noButton };
}

// Create toast
async function createToast(value, type) {
    observer.disconnect();
    const browserLanguage = navigator.language || navigator.userLanguage;
    const { message, str_yesButton, str_noButton } = browserLanguage.startsWith('ja') ?
        await fetchLanguageData('ja', type) :
        await fetchLanguageData('en', type);

   // Create 'toast' div element
    const toastDiv = document.createElement('div');
    toastDiv.setAttribute('id', 'clipboardMonitorToast');
    toastDiv.style.position = 'fixed';
    toastDiv.style.top = '10px';
    toastDiv.style.right = '10px';
    toastDiv.style.backgroundColor = '#333';
    toastDiv.style.color = 'white';
    toastDiv.style.padding = '15px';
    toastDiv.style.borderRadius = '5px';
    toastDiv.style.zIndex = '9999';

    // Create a 'progress' div element
    const progressBar = document.createElement('div');
    progressBar.style.height = '5px';
    progressBar.style.width = '100%';
    progressBar.style.backgroundColor = '#4CAF50';
    toastDiv.innerHTML = `
<span>${message}</span>
<button id="yesButton" style="margin-left: 10px;">${str_yesButton}</button>
<button id="noButton" style="margin-left: 10px;">${str_noButton}</button>
`;
    toastDiv.appendChild(progressBar);
    document.body.appendChild(toastDiv);

    // Initialize progress bar
    let width = 100;
    const timeToDisappear = 5000; // 5 seconds
    const interval = 10; // Update every 10 ms
    const decrement = (100 / (timeToDisappear / interval));
    const id = setInterval(frame, interval);

    function frame() {
        if (width <= 0) {
            clearInterval(id);
            toastDiv.remove();
        } else {
            width -= decrement;
            progressBar.style.width = width + '%';
        }
    }

    document.getElementById('yesButton').addEventListener('click', function () {
        // Handle the action
        let linkValue;
        const text = window.getSelection()?.toString();
        if (type === 'page') {
            linkValue = text + '#p=' + value;
            console.log('Appending page number to copied link: ', text);
        }
        if (type === 'movie') {
            let parts = value.split(":");
            let beforeColon = parts[0];
            let afterColon = parts[1];
            linkValue = text + `#t=${beforeColon}m${afterColon}s`;
            console.log('Appending timecode to copied link: ', text);
        }

        //copy string to clipboard
        navigator.clipboard.writeText(linkValue);
        // Remove the toast and progress bar after the button click
        clearInterval(id);
        toastDiv.remove();
    });
    document.getElementById('noButton').addEventListener('click', function () {
        console.log('do nothing')
        clearInterval(id);
        toastDiv.remove();       
    });
}

function retryGetPageNumber(retryInterval, maxRetryTime, createToast) {

    let retryTime = 0;
    const intervalId = setInterval(() => {
        const pageNumber = document.querySelectorAll('.bp-thumbnail-is-selected .bp-thumbnail-page-number')[0]?.innerText;
        const timeCocde = document.getElementsByClassName('bp-media-controls-timecode')[0]?.innerHTML;

        if (pageNumber) {
            clearInterval(intervalId);
            createToast(pageNumber, "page");
        }
        if (timeCocde) {
            console.log('timecode', timeCocde);
            clearInterval(intervalId);
            createToast(timeCocde, "movie");
        } else {
            retryTime += retryInterval;
            if (retryTime >= maxRetryTime) {
                clearInterval(intervalId);
                console.log('Failed to get page number.');
            }
        }
    }, retryInterval);
    return intervalId;
}

function observerCallback(mutations) {    
    let copylink = document.querySelectorAll('button[data-resin-target="link|copy"]');
    console.log('copylink', copylink);
    if (copylink.length > 0) {
        copylink[0].addEventListener('click', async function (e) {       
            const retryInterval = 100; // 100 ms
            const maxRetryTime = 5000; // 5 seconds
            retryGetPageNumber(retryInterval, maxRetryTime, createToast);
        });
    }
   observer.disconnect();
}

function startObserver() {
    observer.observe(document, { childList: true, subtree: true });
}
startObserver();
