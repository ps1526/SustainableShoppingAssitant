const SHANGHAI_LAT = 31.2304;
const SHANGHAI_LON = 121.4737;

const emissionsData = {
    Acrylic: { Egypt: 5, General: 5.4 },
    Cotton: {
        General: { Average: (null + 44.19 + null + 2 + null + 6 + 2.62 + 1.76) / 6 },
        Afghanistan: 6, Africa: 0.871, Brazil: 6, China: { Average: (0.72 + 2.37 + 3.4) / 3 },
        Gambia: 6, India: { Average: (7.28 + 0.89 + 9.466) / 3 }, "India for handloom": 9.46,
        Egypt: 0.63, Pakistan: 3.15, Syria: 6, Spain: 6, Turkey: 5.5, USA: 0.62
    },
    Flax: { General: 3.8 }, Hemp: { General: 29.5 }, Jute: { General: -1.5 },
    "Merino Wool": { Australia: 22.25, "New Zealand": 2.2 },
    Nylon: { "Nylon 6": 5.5, "Nylon 66": { Average: (8.0 + 6.5) / 2 } },
    "Organic Cotton": { General: { Average: (2.5 + 0.978) / 2 }, Finland: 3.9, India: 1.08, Turkey: 1.95 },
    Polypropylene: { General: { Average: (2.8 + 1.7) / 2 } },
    Polyester: { 
        General: { Average: (2.8 + null + 2.24 + 5.55) / 3 }, 
        Australia: 5, China: 3.1, "Western Europe": 4.1 
    },
    Polyethylene: { General: 1.015 }, "Poly Vinyl Chloride (PVC)": { General: 1.92 },
    "Recycled Cotton": { Spain: 0.214 }, "Recycled Polyester": { General: 5.4 },
    Tencel: { Austria: 0.05, "Lenzing Austria": 1.1 },
    Silk: { General: 52.5, India: 80.9 },
    "Synthetic Spider Silk": { General: 313.5 },
    "Viscose Rayon": { 
        General: { Average: (9.0 + 3.43) / 2 }, 
        Asia: 3.8, Austria: -0.25 
    },
    Wool: { 
        General: { Average: (2.2 + 1.7 + 24.7) / 3 }, 
        China: 30.2, India: 30.2 
    }
};

const ghgData = [
    { minDistance: 0, maxDistance: 14, ghg: 0.242 },
    { minDistance: 14, maxDistance: 25, ghg: 0.242 },
    { minDistance: 25, maxDistance: 50, ghg: 0.24 },
    { minDistance: 50, maxDistance: 100, ghg: 0.24 },
    { minDistance: 100, maxDistance: Infinity, ghg: 0.237 }
];

function displayCurrentLocation(lat, lon) {
    const locationElement = document.getElementById('current-location');
    if (locationElement) {
        locationElement.textContent = `Current Location: Latitude ${lat.toFixed(4)}, Longitude ${lon.toFixed(4)}`;
    } else {
        console.error('Element with ID "current-location" not found.');
    }
}

function displayEmissions(distance, emissions) {
    const emissionsElement = document.getElementById('emissions');
    const ghgCalculationElement = document.getElementById('ghg-calculation'); // Element for GHG calculation display

    if (emissionsElement) {
        emissionsElement.textContent = `Estimated Net Carbon Emissions: ${emissions.toFixed(2)} kg CO2e`;
    } else {
        console.error('Element with ID "emissions" not found.');
    }

    if (ghgCalculationElement) {
        const ghg = ghgData.find(entry => distance >= entry.minDistance && distance < entry.maxDistance)?.ghg || ghgData[ghgData.length - 1].ghg;
        const ghgCalculation = (ghg * distance).toFixed(2);
        ghgCalculationElement.textContent = `GHG Emissions Calculation: ${ghg} kg CO2e/km * ${distance.toFixed(2)} km = ${ghgCalculation} kg CO2e`;
    } else {
        console.error('Element with ID "ghg-calculation" not found.');
    }
}



function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

function getEmissions(distance) {
    for (let i = 0; i < ghgData.length; i++) {
        const { minDistance, maxDistance, ghg } = ghgData[i];
        if (distance >= minDistance && distance < maxDistance) {
            return ghg * distance;
        }
    }
    return 0;
}

function calculatePercentile(score, scores) {
    if (!scores.length) return 0;

    // Sort the scores in ascending order
    scores.sort((a, b) => a - b);

    // Calculate the rank
    let rank = scores.filter(s => s < score).length;

    // Calculate the percentile
    return ((rank / scores.length) * 100).toFixed(2);
}

function percentageToOrdinal(percentage) {
    // Remove the '%' symbol and convert to integer
    let num = parseInt(percentage.replace('%', ''), 10);

    // Define the suffix based on the last digit
    let suffix = "th";
    if (num % 10 === 1 && num % 100 !== 11) {
        suffix = "st";
    } else if (num % 10 === 2 && num % 100 !== 12) {
        suffix = "nd";
    } else if (num % 10 === 3 && num % 100 !== 13) {
        suffix = "rd";
    }

    // Return the number with the corrert suffix
    return num + suffix;
}



function displayResult(message) {
    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.textContent = message;
    } else {
        console.error('Element with ID "result" not found.');
    }
}

function displaySustainabilityScore(message, score, percentile) {
    const scoreElement = document.getElementById('sustainability-score');
    
    let numericScore = parseFloat(score);
    let percentileText = percentile !== undefined ? `${percentageToOrdinal(percentile)}% percentile compared to the other top fashion brands` : '';

    if (isNaN(numericScore)) {
        numericScore = 0;
    }

    if (scoreElement) {
        if (message === "No matching company found.") {
            scoreElement.innerHTML = message;
        } else {
            let color;
            if (numericScore >= 7) {
                color = 'green'; // High score
            } else if (numericScore >= 3) {
                color = 'orange'; // Medium score
            } else {
                color = 'red'; // Low score
            }
            scoreElement.innerHTML = `${message} <span style="color: ${color}; font-weight: bold;">${numericScore.toFixed(2)}/10</span><br>${percentileText}`;
        }
    } else {
        console.error('Element with ID "score-details" not found.');
    }
}


function getUserLocationAndCalculateDistance(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            displayCurrentLocation(userLat, userLon);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        const metaLat = document.querySelector('meta[name="manufacturer-lat"]');
                        const metaLon = document.querySelector('meta[name="manufacturer-lon"]');
                        return {
                            lat: metaLat ? parseFloat(metaLat.getAttribute('content')) : SHANGHAI_LAT,
                            lon: metaLon ? parseFloat(metaLon.getAttribute('content')) : SHANGHAI_LON
                        };
                    }
                }, (results) => {
                    if (results && results[0] && results[0].result) {
                        const manufacturerLat = results[0].result.lat;
                        const manufacturerLon = results[0].result.lon;
                        const distance = calculateDistance(userLat, userLon, manufacturerLat, manufacturerLon);
                        const emissions = getEmissions(distance);
                        displayEmissions(distance, emissions);
                        callback(distance); // Callback for further processing if needed
                    } else {
                        console.error('Error: results or results[0].result is null.');
                        // Handle error gracefully with default values
                        const distance = calculateDistance(userLat, userLon, SHANGHAI_LAT, SHANGHAI_LON);
                        const emissions = getEmissions(distance);
                        displayEmissions(distance, emissions);
                        callback(distance); // Callback for further processing if needed
                    }
                });
            });
        }, (error) => {
            console.error('Error getting location:', error);
            displayCurrentLocation(SHANGHAI_LAT, SHANGHAI_LON);
            const distance = calculateDistance(SHANGHAI_LAT, SHANGHAI_LON, SHANGHAI_LAT, SHANGHAI_LON);
            const emissions = getEmissions(distance);
            displayEmissions(distance, emissions);
            callback(distance); // Callback for further processing if needed
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        displayCurrentLocation(SHANGHAI_LAT, SHANGHAI_LON);
        const distance = calculateDistance(SHANGHAI_LAT, SHANGHAI_LON, SHANGHAI_LAT, SHANGHAI_LON);
        const emissions = getEmissions(distance);
        displayEmissions(distance, emissions);
        callback(distance); // Callback for further processing if needed
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const checkBtn = document.getElementById('check-btn');
    const cartBtn = document.getElementById('cart-btn');

    function cleanDomain(domain) {
        return domain.replace('www.', '').split('.')[0].toLowerCase();
    }

    function fetchAndParseCSV(callback) {
        const csvFilePath = 'envir_scores.csv';
        fetch(chrome.runtime.getURL(csvFilePath))
            .then(response => response.text())
            .then(csvData => {
                Papa.parse(csvData, {
                    header: true,
                    complete: function (results) {
                        if (results && results.data) {
                            callback(results.data);
                        } else {
                            console.error('Error parsing CSV data:', results);
                        }
                    },
                    error: function (error) {
                        console.error('Error parsing CSV:', error);
                    }
                });
            })
            .catch(error => console.error('Error fetching CSV:', error));
    }

    const options = { keys: ['Company'], threshold: 0.2 };

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url);
        const domain = cleanDomain(url.hostname);

        fetchAndParseCSV(function (retailersData) {
            const fuse = new Fuse(retailersData, options);
            const result = fuse.search(domain);

            if (result.length > 0) {
                const companyData = result[0].item;
                const score = companyData.Value;

                // Extract all scores for percentile calculation
                const allScores = retailersData.map(item => parseFloat(item.Value)).filter(val => !isNaN(val));

                // Calculate percentile
                const percentile = calculatePercentile(parseFloat(score), allScores);

                displaySustainabilityScore(`Sustainability score for ${companyData.Company}:`, score, percentile);
            } else {
                displaySustainabilityScore("No matching company found.");
            }
        });
    });

    async function fetchPageHTML(url) {
        try {
          // Check if the URL is a Chrome-specific URL
          if (url.startsWith('chrome://')) {
            // Retrieve the HTML content using chrome.tabs.executeScript
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const html = await chrome.tabs.executeScript(tab.id, {
              code: 'document.documentElement.outerHTML;',
              allFrames: true
            });
            return html[0];
          } else {
            // Use the Fetch API for regular web URLs
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            const html = await response.text();
            return html;
          }
        } catch (error) {
          console.error("Error fetching page HTML:", error);
          displayResult(`Failed to fetch product details. Error: ${error.message}`);
          return null;
        }
      }
    

    async function extractProductDetailsFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
      
        // Define a helper function to extract text content safely
        const safeExtract = (selector) => {
          const element = doc.querySelector(selector);
          return element ? element.textContent.trim() : 'Not Available';
        };
      
        const productDetails = {
          name: safeExtract('.product-title'),
          brand: safeExtract('.brand-name'),
          material: safeExtract('.product-material'),
          manufacturingLocation: safeExtract('.manufacturing-location'),
          description: safeExtract('.product-description')
        };
      
        return productDetails;
      }
      
      async function scrapeProductInfo() {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tabs[0].url;
        const html = await fetchPageHTML(url);
      
        if (html) {
          const productDetails = await extractProductDetailsFromHTML(html);
          displayResult(`
            Product Name: ${productDetails.name}
            Brand: ${productDetails.brand}
            Material: ${productDetails.material}
            Manufacturing Location: ${productDetails.manufacturingLocation}
            Description: ${productDetails.description}
          `);
      
          // Proceed with GHG emissions and distance calculations if manufacturer details are available
          if (productDetails.manufacturingLocation !== 'Not Available') {
            getUserLocationAndCalculateDistance((distance) => {
              const ghg = getGHGEmissions(distance);
              displayResult(`
                Distance to Manufacturer: ${distance.toFixed(2)} km
                GHG Emissions: ${ghg} kg CO2e
              `);
            });
          } else {
            displayResult('Unable to calculate distance and emissions, manufacturer location not available.');
          }
        } else {
          displayResult('Unable to fetch or parse HTML content.');
        }
      }
      
      function getGHGEmissions(distance) {
        // Implement a function to look up GHG emissions based on distance
        // Using the ghgData array or a similar data structure
        const ghgEntry = ghgData.find(entry => distance >= entry.minDistance && distance < entry.maxDistance);
        return ghgEntry ? ghgEntry.ghg : ghgData[ghgData.length - 1].ghg;
      }
    

    if (checkBtn) {
        checkBtn.addEventListener('click', scrapeProductInfo);
    } else {
        console.error("Button with ID 'check-btn' not found.");
    }

    if (cartBtn) {
        cartBtn.addEventListener('click', scrapeCartContents);
    }

    async function scrapeCartContents() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await fetch(tab.url);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const cartItems = doc.querySelectorAll('.cart-item');

            if (cartItems.length === 0) {
                displayResult("Your cart is empty.");
                return;
            }

            let cartMessage = "Your Cart Contents:\n";
            cartItems.forEach((item, index) => {
                const itemName = item.querySelector('.item-name')?.textContent || 'Unknown Item';
                const itemPrice = item.querySelector('.item-price')?.textContent || 'Unknown Price';
                const itemQuantity = item.querySelector('.item-quantity')?.value || 'Unknown Quantity';

                cartMessage += `Item ${index + 1}: ${itemName} - Price: ${itemPrice} - Quantity: ${itemQuantity}\n`;
            });

            displayResult(cartMessage);
        } catch (error) {
            console.error('Error scraping cart contents:', error);
            displayResult("Error fetching cart contents.");
        }
    }
});
