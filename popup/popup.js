document.addEventListener("DOMContentLoaded", async () => {

    const scoreElement =
        document.getElementById("seo-score");

    const checksElement =
        document.getElementById("seo-checks");

    const pageTitleElement =
        document.getElementById("page-title");

    const pageUrlElement =
        document.getElementById("page-url");


    try {

        // Get current active browser tab
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });


        // Send command to Content Script
        chrome.tabs.sendMessage(
            tab.id,
            {
                type: "ANALYZE_PAGE",
            },
            (response) => {

                if (chrome.runtime.lastError) {

                    console.error(
                        chrome.runtime.lastError.message
                    );

                    checksElement.textContent =
                        "Unable to analyze this page.";

                    return;
                }


                if (!response || !response.success) {

                    checksElement.textContent =
                        "Analysis failed.";

                    return;
                }


                renderPageInfo(response.pageData);

                renderSEO(response.seo);
            }
        );


    } catch (error) {

        console.error(error);

        checksElement.textContent =
            "Unexpected error occurred.";
    }


    function renderPageInfo(pageData) {

        pageTitleElement.textContent =
            pageData.title || "No title";

        pageUrlElement.textContent =
            pageData.url;
    }


    function renderSEO(seo) {

        scoreElement.textContent =
            seo.score;

        checksElement.innerHTML = "";


        seo.checks.forEach((check) => {

            const item =
                document.createElement("div");

            item.className =
                `seo-check ${check.status}`;


            const icon =
                getStatusIcon(check.status);


            item.innerHTML = `
                <div class="check-header">

                    <strong>
                        ${icon} ${check.name}
                    </strong>

                    <span>
                        ${check.points}/${check.maxPoints}
                    </span>

                </div>

                <p>${check.message}</p>
            `;


            checksElement.appendChild(item);
        });
    }


    function getStatusIcon(status) {

        if (status === "pass") {
            return "✓";
        }

        if (status === "warning") {
            return "⚠";
        }

        return "✕";
    }

});