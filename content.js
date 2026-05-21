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

const COPY_SHARED_LINK_BUTTON_SELECTOR = '[data-testid="modal-content-container"] [data-target-id="Button-CopySharedLink"]';
const LEGACY_COPY_SHARED_LINK_BUTTON_SELECTOR = 'button[data-resin-target="link|copy"]';
const SELECTED_PAGE_THUMBNAIL_SELECTOR = '.bp-thumbnail-is-selected[data-bp-page-num]';
const VIDEO_TIMESTAMP_SELECTOR = '.bp-DurationLabels-label';

function getSelectedPageNumber() {
    return document.querySelector(SELECTED_PAGE_THUMBNAIL_SELECTOR)?.getAttribute('data-bp-page-num')?.trim();
}

function getVideoTimeCode() {
    return document.querySelector(VIDEO_TIMESTAMP_SELECTOR)?.innerText?.trim();
}

async function getCopiedSharedLink() {
    try {
        const clipboardText = await navigator.clipboard?.readText?.();
        if (clipboardText) {
            return clipboardText.trim();
        }
    } catch (error) {
        console.warn('Failed to read copied shared link from clipboard.', error);
    }

    return window.getSelection()?.toString()?.trim() || '';
}

// Create toast
async function createToast(value, type) {

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
    toastDiv.style.pointerEvents = 'auto';

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
            stateObservers()
        } else {
            width -= decrement;
            progressBar.style.width = width + '%';
        }
    }

    document.getElementById('yesButton').addEventListener('click', async function () {
        // Get selected text: page number or timecode
        let linkValue;
        const text = await getCopiedSharedLink();
        if (!text) {
            console.log('Shared link not found.');
            return;
        }

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
        try {
            await navigator.clipboard.writeText(linkValue);
        } catch (error) {
            console.warn('Failed to copy shared link with page number or time code.', error);
            return;
        }

        // Remove the toast and progress bar after the button click
        clearInterval(id);
        toastDiv.remove();
        stateObservers();
    });
    document.getElementById('noButton').addEventListener('click', function () {
        console.log('Shared link not copied')
        clearInterval(id);
        toastDiv.remove();
        stateObservers()
    });
}

function retryGetPageNumber(retryInterval, maxRetryTime, createToast) {

    let retryTime = 0;
    const intervalId = setInterval(() => {
        const pageNumber = getSelectedPageNumber();
        const timeCode = getVideoTimeCode();

        if (pageNumber) {
            clearInterval(intervalId);
            createToast(pageNumber, 'page');
            return;
        }

        if (timeCode) {
            console.log('timecode', timeCode);
            clearInterval(intervalId);
            createToast(timeCode, 'movie');
            return;
        }

        retryTime += retryInterval;
        if (retryTime >= maxRetryTime) {
            clearInterval(intervalId);
            console.log('Failed to get page number or time code.');
        }
    }, retryInterval);
    return intervalId;
}


let isCopyButtonClickListenerInstalled = false;
let activeRetryIntervalId = null;

function stateObservers() {
    if (isCopyButtonClickListenerInstalled) {
        return;
    }

    // Event delegation: keeps working even if the button is re-rendered.
    document.addEventListener(
        'click',
        function (e) {
            const target = e.target;
            if (!(target instanceof Element)) {
                return;
            }

            const copyButton = target.closest(COPY_SHARED_LINK_BUTTON_SELECTOR)
                || target.closest(LEGACY_COPY_SHARED_LINK_BUTTON_SELECTOR);
            if (!copyButton) {
                return;
            }

            const retryInterval = 100; // 100 ms
            const maxRetryTime = 5000; // 5 seconds

            if (activeRetryIntervalId) {
                clearInterval(activeRetryIntervalId);
                activeRetryIntervalId = null;
            }

            activeRetryIntervalId = retryGetPageNumber(retryInterval, maxRetryTime, createToast);
        },
        true
    );

    isCopyButtonClickListenerInstalled = true;
}
stateObservers();
