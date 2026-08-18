console.log("EfsunDev Web Inspector loaded");


function analyzeSEO() {
    const title = document.title || "";

    const description =
        document.querySelector('meta[name="description"]')
            ?.getAttribute("content") || "";

    const h1Elements = [...document.querySelectorAll("h1")];
    const h2Elements = [...document.querySelectorAll("h2")];

    const canonical =
        document.querySelector('link[rel="canonical"]')
            ?.getAttribute("href") || "";

    const robots =
        document.querySelector('meta[name="robots"]')
            ?.getAttribute("content") || "";

    const ogTitle =
        document.querySelector('meta[property="og:title"]')
            ?.getAttribute("content") || "";

    const ogDescription =
        document.querySelector('meta[property="og:description"]')
            ?.getAttribute("content") || "";

    const images = [...document.querySelectorAll("img")];

    const imagesWithoutAlt = images.filter((image) => {
        return !image.hasAttribute("alt") ||
               image.getAttribute("alt").trim() === "";
    });

    return {
        title: {
            value: title,
            length: title.length
        },

        description: {
            value: description,
            length: description.length
        },

        headings: {
            h1Count: h1Elements.length,
            h1: h1Elements.map((element) =>
                element.textContent.trim()
            ),
            h2Count: h2Elements.length
        },

        canonical,

        robots,

        openGraph: {
            title: ogTitle,
            description: ogDescription
        },

        images: {
            total: images.length,
            withoutAlt: imagesWithoutAlt.length
        }
    };
}


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "ANALYZE_SEO") {
            const seoData = analyzeSEO();

            sendResponse({
                success: true,
                data: seoData
            });
        }
    }
);