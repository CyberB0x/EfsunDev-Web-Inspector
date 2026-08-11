const analyzeButton =
    document.getElementById("analyze-btn");

const results =
    document.getElementById("results");

const pageTitle =
    document.getElementById("page-title");

const pageUrl =
    document.getElementById("page-url");


async function getCurrentTab() {

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tabs[0];
}


async function loadCurrentPage() {

    const tab = await getCurrentTab();

    if (!tab) {
        return;
    }

    pageTitle.textContent =
        tab.title || "Unknown page";

    pageUrl.textContent =
        tab.url || "-";
}


analyzeButton.addEventListener(
    "click",
    async () => {

        const tab = await getCurrentTab();

        if (!tab?.id) {
            return;
        }

        analyzeButton.textContent =
            "Analyzing...";

        analyzeButton.disabled = true;


        try {

            const response =
                await chrome.tabs.sendMessage(
                    tab.id,
                    {
                        action: "ANALYZE_PAGE"
                    }
                );


            document.getElementById(
                "result-title"
            ).textContent =
                response.title;


            document.getElementById(
                "result-headings"
            ).textContent =
                response.headings;


            document.getElementById(
                "result-images"
            ).textContent =
                response.images;


            document.getElementById(
                "result-links"
            ).textContent =
                response.links;


            results.classList.remove(
                "hidden"
            );

        } catch (error) {

            console.error(
                "EfsunDev analysis error:",
                error
            );

        } finally {

            analyzeButton.textContent =
                "Analyze Website";

            analyzeButton.disabled = false;
        }

    }
);


loadCurrentPage();