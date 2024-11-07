chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "getRetailerSustainability") {
        const brand = request.brand;
        getRetailerSustainability(brand).then((sustainabilityData) => {
            sendResponse(sustainabilityData);
        });
        return true;  
    }
});

function getRetailerSustainability(brand) {
    return new Promise((resolve) => {
        const retailersData = [
            { retailer: "Patagonia", score: 95 },
            { retailer: "Everlane", score: 88 },
            { retailer: "FastFashionBrand", score: 20 },
            { retailer: "H&M", score: 30 },
            { retailer: "Zara", score: 35 }
        ];

        const retailer = retailersData.find(item => item.retailer.toLowerCase() === brand.toLowerCase());

        if (retailer) {
            const score = retailer.score;
            let rating = '';

            if (score >= 80) {
                rating = 'Highly sustainable';
            } else if (score >= 50) {
                rating = 'Moderately sustainable';
            } else {
                rating = 'Low sustainability';
            }

            resolve({ score, rating });
        } else {
            resolve({ score: null, rating: 'No data available' });
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapeData') {
      console.log('Product Info:', message.data);
      // You can also store the data or do other processing here
    }
  });

console.log("Background script is running");
