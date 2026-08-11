console.log("EfsunDev Web Inspector loaded");

function analyzePage() {

    const headings = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
    );

    const images = document.querySelectorAll("img");

    const links = document.querySelectorAll("a");


    return {
        title: document.title || "No title",

        url: window.location.href,

        headings: headings.length,

        images: images.length,

        links: links.length
    };
}


chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {

        if (request.action === "ANALYZE_PAGE") {

            const result = analyzePage();

            sendResponse(result);
        }

    }
);