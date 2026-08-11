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


const pageData = getPageData();

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