function getProductDetails() {
    const name = document.querySelector('h1')?.innerText ||
                 document.querySelector('[itemprop="name"]')?.innerText ||
                 'Product title not found';
    
    const brand = document.querySelector('[itemprop="brand"]')?.innerText ||
                  document.querySelector('.brand')?.innerText ||
                  'Brand not found';
    
    const material = document.querySelector('li:contains("Material")')?.innerText ||
                     document.querySelector('[itemprop="material"]')?.innerText ||
                     'Material not found';
    const manufacturingLocation = document.querySelector('[itemprop="manufacturer"]')?.innerText ||
                     document.querySelector('.manufacturing-location')?.innerText ||
                     'Location not found';
    
    return {
        name,
        brand,
        material,
        manufacturingLocation
    };
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getProductDetails') {
        const details = getProductDetails();
        sendResponse({ details });
    }
});
