document.addEventListener('copy', async function (e) {

    // Detect the browser's language
    const browserLanguage = navigator.language || navigator.userLanguage;
    let message = '';
    let str_yesButton = '';
    let str_noButton = ''

    const fetchLanguageData = async (language) => {
        const response = await fetch(chrome.runtime.getURL(`lib/l18n/l18n.json`));
        const data = await response.json();
        message = data[language].msgTitle;
        str_yesButton = data[language].yesBtn;
        str_noButton = data[language].noBtn;
    };

    // If the browser language is Japanese, change the message
    if (browserLanguage.startsWith('ja')) {
        await fetchLanguageData('ja')
    }
    else {
        await fetchLanguageData('en')
    }


    const text = window.getSelection().toString();
    const retryInterval = 100;
    const maxRetryTime = 10000; // Maximum retry time in milliseconds (10 seconds)
    let retryTime = 0;

    const retryGetPageNumber = setInterval(() => {
        const pageNumber = document.querySelectorAll('.bp-thumbnail-is-selected .bp-thumbnail-page-number')[0]?.innerText;

        if (pageNumber) {
            clearInterval(retryGetPageNumber);
            createToast(pageNumber);
        } else {
            retryTime += retryInterval;
            if (retryTime >= maxRetryTime) {
                clearInterval(retryGetPageNumber);
                console.log('Failed to get page number.');
            }
        }
    }, retryInterval);
    //  const pageNumber = document.querySelectorAll('.bp-thumbnail-is-selected .bp-thumbnail-page-number')[0].innerText;
    const createToast = (pageNumber) => {
        if (pageNumber != null || pageNumber != undefined || pageNumber != '') {
            // Create a 'toast' div element
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

            // Add a message, a button, and a progress bar to the toast
            toastDiv.innerHTML = `
      <span>${message}</span>
      <button id="yesButton" style="margin-left: 10px;">${str_yesButton}</button>
      <button id="noButton" style="margin-left: 10px;">${str_noButton}</button>
    `;
            toastDiv.appendChild(progressBar);

            // Append the toast div to the document body
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

            // Listen for button click
            document.getElementById('yesButton').addEventListener('click', function () {
                // Handle the action, for example, append the page number to the copied link
                console.log('Appending page number to copied link: ', text);

                const linkwithPageNumber = text + '#p=' + pageNumber;
                //copy string to clipboard
                navigator.clipboard.writeText(linkwithPageNumber);
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
    }
});
