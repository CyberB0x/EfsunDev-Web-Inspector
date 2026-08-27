console.log("EfsunDev Service Worker started");


// ========================================
// Messages from Content Script
// ========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

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
    }
);


// ========================================
// Security Data Collector
// ========================================

function getSecurityData(details) {

    const headers =
        details.responseHeaders || [];


    function getHeader(name) {

        const header = headers.find(
            (item) =>
                item.name.toLowerCase() ===
                name.toLowerCase()
        );

        return header?.value || "";
    }


    return {
        url: details.url,

        statusCode: details.statusCode,

        https:
            details.url.startsWith("https://"),

        csp:
            getHeader("content-security-policy"),

        hsts:
            getHeader("strict-transport-security"),

        xContentTypeOptions:
            getHeader("x-content-type-options"),

        xFrameOptions:
            getHeader("x-frame-options"),

        referrerPolicy:
            getHeader("referrer-policy"),

        permissionsPolicy:
            getHeader("permissions-policy")
    };
}


// ========================================
// Security Analyzer
// ========================================

function analyzeSecurity(securityData) {

    const checks = [];


    // 1. HTTPS
    checks.push({
        name: "HTTPS",

        status:
            securityData.https
                ? "pass"
                : "fail",

        message:
            securityData.https
                ? "Website uses HTTPS."
                : "Website does not use HTTPS."
    });


    // 2. Content Security Policy
    checks.push({
        name: "Content-Security-Policy",

        status:
            securityData.csp
                ? "pass"
                : "fail",

        message:
            securityData.csp
                ? "Content Security Policy is configured."
                : "Content Security Policy is missing."
    });


    // 3. HSTS
    checks.push({
        name: "Strict-Transport-Security",

        status:
            securityData.hsts
                ? "pass"
                : "warning",

        message:
            securityData.hsts
                ? "HSTS is enabled."
                : "HSTS header is missing."
    });


    // 4. X-Content-Type-Options
    const hasNoSniff =
        securityData.xContentTypeOptions
            .toLowerCase() === "nosniff";


    checks.push({
        name: "X-Content-Type-Options",

        status:
            hasNoSniff
                ? "pass"
                : "warning",

        message:
            hasNoSniff
                ? "MIME sniffing protection is enabled."
                : "X-Content-Type-Options should be set to nosniff."
    });


    // 5. X-Frame-Options
    const frameOption =
        securityData.xFrameOptions.toLowerCase();


    const validFrameOption =
        frameOption === "deny" ||
        frameOption === "sameorigin";


    checks.push({
        name: "X-Frame-Options",

        status:
            validFrameOption
                ? "pass"
                : "warning",

        message:
            validFrameOption
                ? "Clickjacking protection is configured."
                : "X-Frame-Options is missing or not configured securely."
    });


    // 6. Referrer Policy
    checks.push({
        name: "Referrer-Policy",

        status:
            securityData.referrerPolicy
                ? "pass"
                : "warning",

        message:
            securityData.referrerPolicy
                ? "Referrer Policy is configured."
                : "Referrer-Policy header is missing."
    });


    // 7. Permissions Policy
    checks.push({
        name: "Permissions-Policy",

        status:
            securityData.permissionsPolicy
                ? "pass"
                : "warning",

        message:
            securityData.permissionsPolicy
                ? "Permissions Policy is configured."
                : "Permissions-Policy header is missing."
    });


    // Calculate Security Score
    let score = 0;


    checks.forEach((check) => {

        if (check.status === "pass") {
            score += 1;
        }

        else if (check.status === "warning") {
            score += 0.5;
        }
    });


    const securityScore = Math.round(
        (score / checks.length) * 100
    );


    return {
        score: securityScore,
        checks: checks
    };
}


// ========================================
// Security Results Storage
// ========================================

const securityResults =
    new Map();


// ========================================
// Listen for Response Headers
// ========================================

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {

        const securityData =
            getSecurityData(details);

        const securityAnalysis =
            analyzeSecurity(securityData);


        if (details.tabId >= 0) {

            securityResults.set(
                details.tabId,
                {
                    securityData,
                    securityAnalysis
                }
            );
        }


        console.log(
            "=== EfsunDev Security Analyzer ==="
        );

        console.log(
            "Security Data:",
            securityData
        );

        console.log(
            "Security Analysis:",
            securityAnalysis
        );
    },

    {
        urls: ["<all_urls>"],
        types: ["main_frame"]
    },

    ["responseHeaders"]
);


// ========================================
// Security Analysis Request from Popup
// ========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            message.type ===
            "GET_SECURITY_ANALYSIS"
        ) {

            const result =
                securityResults.get(
                    message.tabId
                );


            if (!result) {

                sendResponse({
                    success: false
                });

                return;
            }


            sendResponse({
                success: true,

                securityData:
                    result.securityData,

                security:
                    result.securityAnalysis
            });
        }
    }
);