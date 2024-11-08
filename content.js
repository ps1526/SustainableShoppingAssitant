/*
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
*/
// Helper function to find text containing a specific string
function getElementByText(selector, text) {
    return Array.from(document.querySelectorAll(selector))
      .find(element => element.textContent.toLowerCase().includes(text.toLowerCase()));
  }
  
  // Enhanced product details extraction
  function getProductDetails() {
    try {
      // Product Name - try multiple common selectors
      const name = 
        document.querySelector('[itemprop="name"]')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim() ||
        document.querySelector('.product-title')?.textContent?.trim() ||
        document.querySelector('.product-name')?.textContent?.trim() ||
        document.querySelector('[data-testid="product-title"]')?.textContent?.trim();
  
      // Brand - try multiple common selectors
      const brand = 
        document.querySelector('[itemprop="brand"]')?.textContent?.trim() ||
        document.querySelector('.brand')?.textContent?.trim() ||
        document.querySelector('[data-testid="product-brand"]')?.textContent?.trim() ||
        getElementByText('span', 'brand:')?.parentElement?.textContent?.trim();
  
      // Material - try multiple common selectors and patterns
      const materialElement = 
        document.querySelector('[itemprop="material"]') ||
        getElementByText('dt', 'material') ||
        getElementByText('li', 'material') ||
        getElementByText('div', 'material composition');
      
      const material = materialElement?.textContent?.trim()
        ?.replace(/material:/i, '')
        ?.trim();
  
      // Manufacturing Location - try multiple common selectors
      const manufacturingLocation = 
        document.querySelector('[itemprop="manufacturer"]')?.textContent?.trim() ||
        document.querySelector('.manufacturing-location')?.textContent?.trim() ||
        getElementByText('dt', 'made in')?.nextElementSibling?.textContent?.trim() ||
        getElementByText('li', 'made in')?.textContent?.trim();
  
      // Additional product information that might be useful for sustainability scoring
      const price = 
        document.querySelector('[itemprop="price"]')?.content ||
        document.querySelector('.price')?.textContent?.trim();
        
      const category = 
        document.querySelector('[itemprop="category"]')?.textContent?.trim() ||
        document.querySelector('.product-category')?.textContent?.trim();
  
      return {
        name: name || 'Product name not found',
        brand: brand || 'Brand not found',
        material: material || 'Material not found',
        manufacturingLocation: manufacturingLocation || 'Manufacturing location not found',
        price: price || 'Price not found',
        category: category || 'Category not found',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting product details:', error);
      return {
        error: error.message,
        url: window.location.href
      };
    }
  }
  
  // Message listener for communication with popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getHTML') {
        sendResponse({ html: document.documentElement.outerHTML });
    }
    return true; // Required for async response
});
  
  // Optional: Mutation observer to handle dynamic content
  const observer = new MutationObserver((mutations) => {
    // If the page content changes significantly, we might want to re-extract details
    if (mutations.some(mutation => mutation.addedNodes.length > 0)) {
      console.log('Page content changed, product details might need updating');
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });