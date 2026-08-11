console.log("EfsunDev Service Worker started");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "PAGE_DATA") {

        console.log("Page data received:");
        console.log(message.payload);

        console.log("Data came from tab:");
        console.log(sender.tab);

        sendResponse({
            success: true,
            message: "Page data received by Service Worker"
        });
    }

});