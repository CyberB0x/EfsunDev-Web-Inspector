function getPageData() {
    const title = document.title;

    const metaDescription =
        document.querySelector('meta[name="description"]')
            ?.getAttribute("content") || "";

    const h1Elements = [...document.querySelectorAll("h1")];

    const h1 = h1Elements.map((element) =>
        element.textContent.trim()
    );

    const images = [...document.images].map((image) => ({
        src: image.src,
        alt: image.alt || "",
        width: image.naturalWidth,
        height: image.naturalHeight,
    }));

    const canonical =
        document.querySelector('link[rel="canonical"]')
            ?.getAttribute("href") || "";

    const lang =
        document.documentElement.getAttribute("lang") || "";

    return {
        url: window.location.href,
        title,
        metaDescription,
        h1,
        images,
        canonical,
        lang,
    };
}


function analyzeSEO(pageData) {
    const checks = [];

    // 1. TITLE
    if (!pageData.title) {
        checks.push({
            name: "Title",
            status: "fail",
            message: "Title tag is missing",
            points: 0,
            maxPoints: 20,
        });
    } else if (pageData.title.length < 30) {
        checks.push({
            name: "Title",
            status: "warning",
            message: `Title is too short (${pageData.title.length} characters)`,
            points: 10,
            maxPoints: 20,
        });
    } else if (pageData.title.length > 60) {
        checks.push({
            name: "Title",
            status: "warning",
            message: `Title is too long (${pageData.title.length} characters)`,
            points: 10,
            maxPoints: 20,
        });
    } else {
        checks.push({
            name: "Title",
            status: "pass",
            message: `Title length is good (${pageData.title.length} characters)`,
            points: 20,
            maxPoints: 20,
        });
    }


    // 2. META DESCRIPTION
    if (!pageData.metaDescription) {
        checks.push({
            name: "Meta Description",
            status: "fail",
            message: "Meta description is missing",
            points: 0,
            maxPoints: 20,
        });
    } else if (pageData.metaDescription.length < 70) {
        checks.push({
            name: "Meta Description",
            status: "warning",
            message: `Meta description is too short (${pageData.metaDescription.length} characters)`,
            points: 10,
            maxPoints: 20,
        });
    } else if (pageData.metaDescription.length > 160) {
        checks.push({
            name: "Meta Description",
            status: "warning",
            message: `Meta description is too long (${pageData.metaDescription.length} characters)`,
            points: 10,
            maxPoints: 20,
        });
    } else {
        checks.push({
            name: "Meta Description",
            status: "pass",
            message: `Meta description length is good (${pageData.metaDescription.length} characters)`,
            points: 20,
            maxPoints: 20,
        });
    }


    // 3. H1
    if (pageData.h1.length === 0) {
        checks.push({
            name: "H1",
            status: "fail",
            message: "H1 heading is missing",
            points: 0,
            maxPoints: 20,
        });
    } else if (pageData.h1.length > 1) {
        checks.push({
            name: "H1",
            status: "warning",
            message: `Multiple H1 headings found (${pageData.h1.length})`,
            points: 10,
            maxPoints: 20,
        });
    } else {
        checks.push({
            name: "H1",
            status: "pass",
            message: "Exactly one H1 heading found",
            points: 20,
            maxPoints: 20,
        });
    }


    // 4. CANONICAL
    if (!pageData.canonical) {
        checks.push({
            name: "Canonical",
            status: "warning",
            message: "Canonical URL is missing",
            points: 5,
            maxPoints: 10,
        });
    } else {
        checks.push({
            name: "Canonical",
            status: "pass",
            message: "Canonical URL is present",
            points: 10,
            maxPoints: 10,
        });
    }


    // 5. LANGUAGE
    if (!pageData.lang) {
        checks.push({
            name: "Language",
            status: "warning",
            message: "HTML lang attribute is missing",
            points: 5,
            maxPoints: 10,
        });
    } else {
        checks.push({
            name: "Language",
            status: "pass",
            message: `Page language is "${pageData.lang}"`,
            points: 10,
            maxPoints: 10,
        });
    }


    // 6. IMAGE ALT
    const imagesWithoutAlt = pageData.images.filter(
        (image) => !image.alt.trim()
    );

    if (pageData.images.length === 0) {
        checks.push({
            name: "Image ALT",
            status: "pass",
            message: "No images found on the page",
            points: 20,
            maxPoints: 20,
        });
    } else if (imagesWithoutAlt.length === 0) {
        checks.push({
            name: "Image ALT",
            status: "pass",
            message: "All images have ALT text",
            points: 20,
            maxPoints: 20,
        });
    } else {
        const missingPercentage =
            (imagesWithoutAlt.length / pageData.images.length) * 100;

        let points = 10;

        if (missingPercentage > 50) {
            points = 0;
        }

        checks.push({
            name: "Image ALT",
            status: missingPercentage > 50 ? "fail" : "warning",
            message: `${imagesWithoutAlt.length} of ${pageData.images.length} images are missing ALT text`,
            points,
            maxPoints: 20,
        });
    }


    // TOTAL SCORE
    const score = checks.reduce(
        (total, check) => total + check.points,
        0
    );

    return {
        score,
        checks,
    };
}

chrome.runtime.onMessage.addListener(
   (message, sender, sendResponse) => {
      if (message.type === "ANALYZE_PAGE"){
         const pageData = getPageData();
         const seoResult = analyzeSEO(pageData);

         console.log("=== EfsunDev Page Data ===");
         console.log(pageData);

         console.log("=== EfsunDev SEO Analysis ===");
         console.log(seoResult);

         sendResponse({
            success: true,
            pageData: pageData,
            seo: seoResult,
         });
      }
   }
);


// Send data to Service Worker
chrome.runtime.sendMessage(
    {
        type: "PAGE_DATA",
        payload: pageData,
    },
    (response) => {
        console.log("Response from Service Worker:");
        console.log(response);
    }
);