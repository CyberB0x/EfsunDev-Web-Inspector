document.addEventListener("DOMContentLoaded", async () => {

    // =========================
    // DOM Elements
    // =========================

    const seoScoreElement =
        document.getElementById("seo-score");

    const seoChecksElement =
        document.getElementById("seo-checks");

    const securityScoreElement =
        document.getElementById("security-score");

    const securityChecksElement =
        document.getElementById("security-checks");

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


        if (!tab || !tab.id) {
            throw new Error("Active tab not found.");
        }


        // =========================
        // SEO Analyzer
        // =========================

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

                    seoChecksElement.textContent =
                        "Unable to analyze this page.";

                    return;
                }


                if (!response || !response.success) {

                    seoChecksElement.textContent =
                        "Analysis failed.";

                    return;
                }


                renderPageInfo(response.pageData);

                renderSEO(response.seo);
            }
        );


        // =========================
        // Security Analyzer
        // =========================

        chrome.runtime.sendMessage(
            {
                type: "GET_SECURITY_ANALYSIS",
                tabId: tab.id
            },
            (response) => {

                if (chrome.runtime.lastError) {

                    console.error(
                        chrome.runtime.lastError.message
                    );

                    securityChecksElement.textContent =
                        "Unable to analyze security.";

                    return;
                }


                if (!response || !response.success) {

                    securityChecksElement.textContent =
                        "Security data unavailable. Reload the page.";

                    return;
                }


                renderSecurity(response.security);
            }
        );


    } catch (error) {

        console.error(error);

        seoChecksElement.textContent =
            "Unexpected error occurred.";

        securityChecksElement.textContent =
            "Unexpected error occurred.";
    }


    // =========================
    // Page Info
    // =========================

    function renderPageInfo(pageData) {

        pageTitleElement.textContent =
            pageData.title || "No title";

        pageUrlElement.textContent =
            pageData.url;
    }


    // =========================
    // SEO Renderer
    // =========================

    function renderSEO(seo) {

        seoScoreElement.textContent =
            seo.score;

        seoChecksElement.innerHTML = "";


        seo.checks.forEach((check) => {

            const item =
                document.createElement("div");

            item.className =
                `analysis-check ${check.status}`;


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


            seoChecksElement.appendChild(item);
        });
    }


    // =========================
    // Security Renderer
    // =========================

    function renderSecurity(security) {

        securityScoreElement.textContent =
            security.score;

        securityChecksElement.innerHTML = "";


        security.checks.forEach((check) => {

            const item =
                document.createElement("div");

            item.className =
                `analysis-check ${check.status}`;


            const icon =
                getStatusIcon(check.status);


            item.innerHTML = `
                <div class="check-header">

                    <strong>
                        ${icon} ${check.name}
                    </strong>

                </div>

                <p>${check.message}</p>
            `;


            securityChecksElement.appendChild(item);
        });
    }


    // =========================
    // Status Icon
    // =========================

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