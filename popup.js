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
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            const html = await response.text();
            return html;
        } catch (error) {
            console.error("Error fetching page HTML:", error);
            displayResult(`Failed to fetch product details. Error: ${error.message}`);
            return null;
        }
    }
    

    async function extractProductDetailsFromText(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get all text content from the page
        const pageText = doc.body.innerText.toLowerCase();
        
        // Helper function to find matches with both direct and fuzzy matching
        function findMatches(text, searchTerms, targetTerms, windowSize = 100) {
            // Helper function for fuzzy matching
            function fuzzyMatch(text, term) {
                text = text.toLowerCase();
                term = term.toLowerCase();
                
                // Direct includes
                if (text.includes(term)) return true;
                
                // Check for plural forms
                if (text.includes(term + 's')) return true;
                if (text.includes(term + 'es')) return true;
                
                // Check for hyphenated forms
                if (text.includes(term.replace(' ', '-'))) return true;
                
                return false;
            }
    
            // First try direct pattern matching
            for (const searchTerm of searchTerms) {
                const pattern = new RegExp(`${searchTerm}\\s*([\\w\\s,-]+)(?=[.,\\n]|$)`, 'i');
                const match = text.match(pattern);
                if (match) {
                    const contextAfterLabel = match[1].toLowerCase().trim();
                    for (const target of targetTerms) {
                        if (fuzzyMatch(contextAfterLabel, target)) {
                            return {
                                value: target,
                                isDirectMatch: true
                            };
                        }
                    }
                }
            }
    
            // If no direct match, look for content around keywords
            for (const searchTerm of searchTerms) {
                const index = text.indexOf(searchTerm.toLowerCase());
                if (index !== -1) {
                    const start = Math.max(0, index - windowSize);
                    const end = Math.min(text.length, index + searchTerm.length + windowSize);
                    const context = text.slice(start, end);
                    
                    for (const target of targetTerms) {
                        if (fuzzyMatch(context, target)) {
                            return {
                                value: target,
                                isDirectMatch: false
                            };
                        }
                    }
                }
            }
    
            // Final attempt: look for product terms anywhere in the text
            for (const target of targetTerms) {
                if (fuzzyMatch(text, target)) {
                    return {
                        value: target,
                        isDirectMatch: false
                    };
                }
            }
            
            return null;
        }
    
        // Expanded materials list
        const materials = [
            // Natural fibers
            'cotton', 'organic cotton', 'wool', 'merino wool', 'cashmere', 'silk', 'linen', 'hemp',
            // Synthetic fibers
            'polyester', 'nylon', 'spandex', 'elastane', 'lycra', 'acrylic', 'rayon', 'viscose',
            // Leather and alternatives
            'leather', 'suede', 'faux leather', 'vegan leather', 'pu leather',
            // Blends and specialty materials
            'cotton blend', 'wool blend', 'cotton-polyester', 'modal', 'tencel', 'bamboo',
            // Technical materials
            'gore-tex', 'polartec', 'cordura', 'kevlar',
            // Sustainable materials
            'recycled polyester', 'organic hemp', 'recycled cotton', 'econyl'
        ];
    
        // Expanded product types with categories and variations
        const productTypes = {
            tops: [
                't-shirt', 'shirt', 'polo', 'polo shirt', 'blouse', 'tank top', 'sweater', 
                'sweatshirt', 'hoodie', 'cardigan', 'tunic', 'crop top', 'jersey',
                'turtleneck', 'henley', 'button-up', 'button-down'
            ],
            bottoms: [
                'pants', 'jeans', 'trousers', 'shorts', 'skirt', 'leggings', 'chinos',
                'joggers', 'sweatpants', 'cargo pants', 'bermuda shorts', 'capri pants',
                'culottes', 'palazzo pants'
            ],
            dresses: [
                'dress', 'maxi dress', 'mini dress', 'midi dress', 'gown', 'sundress',
                'shirt dress', 'wrap dress', 'cocktail dress', 'evening dress'
            ],
            outerwear: [
                'jacket', 'coat', 'blazer', 'windbreaker', 'parka', 'raincoat',
                'vest', 'bomber jacket', 'denim jacket', 'leather jacket', 'peacoat'
            ],
            activewear: [
                'sports bra', 'athletic shorts', 'running tights', 'gym shirt',
                'workout top', 'tennis skirt', 'track pants', 'yoga pants'
            ],
            swimwear: [
                'swimsuit', 'bikini', 'swim trunks', 'one-piece', 'boardshorts',
                'rash guard', 'swim shorts'
            ],
            accessories: [
                'hat', 'cap', 'scarf', 'gloves', 'belt', 'tie', 'socks',
                'beanie', 'headband', 'wristband', 'bandana'
            ],
            footwear: [
                'shoes', 'sneakers', 'boots', 'sandals', 'slippers', 'loafers',
                'heels', 'flats', 'oxford shoes', 'athletic shoes', 'running shoes'
            ],
            underwear: [
                'underwear', 'bra', 'briefs', 'boxers', 'panties', 'lingerie',
                'undershirt', 'boxer briefs', 'thong', 'boyshorts'
            ]
        };
    
        // Flatten product types for searching
        const flattenedProductTypes = Object.values(productTypes).flat();
    
        // Material detection
        const materialKeywords = [
            'material:', 'fabric:', 'made from', 'composition:', 
            'made of', 'materials used:', 'fabric composition',
            'shell:', 'outer:', 'lining:', 'main:'
        ];
        const materialMatch = findMatches(pageText, materialKeywords, materials);
        const detectedMaterial = materialMatch ? materialMatch.value : null;
    
        // Manufacturing location detection
        const locationKeywords = [
            'made in', 'manufactured in', 'origin:', 
            'country of origin', 'imported from', 'produced in',
            'manufactured by', 'factory location'
        ];
        const countries = [
            'china', 'india', 'bangladesh', 'vietnam', 'turkey', 
            'italy', 'usa', 'spain', 'portugal', 'japan',
            'indonesia', 'cambodia', 'thailand', 'mexico', 'pakistan',
            'sri lanka', 'morocco', 'taiwan', 'south korea', 'malaysia'
        ];
        const locationMatch = findMatches(pageText, locationKeywords, countries);
        const manufacturingLocation = locationMatch ? 
            locationMatch.value.charAt(0).toUpperCase() + locationMatch.value.slice(1) : 
            null;
    
        // Product type detection with fuzzy matching
        const productTypeKeywords = [
            'category:', 'product type:', 'department:', 
            'section:', 'collection:', 'style:', 'item type:',
            'product:', 'clothing type:'
        ];
        const typeMatch = findMatches(pageText, productTypeKeywords, flattenedProductTypes);
        const productType = typeMatch ? typeMatch.value : null;
    
        // Find product name
        const titleElement = doc.querySelector('title');
        const productName = titleElement ? 
            titleElement.innerText.split('|')[0].trim() : 
            'Product name not found';
    
    
        // Get product category based on detected type
        let productCategory = null;
        if (productType) {
            for (const [category, types] of Object.entries(productTypes)) {
                if (types.some(type => type.toLowerCase() === productType.toLowerCase())) {
                    productCategory = category;
                    break;
                }
            }
        }
    
        return {
            name: productName,
            type: productType || 'Type not detected',
            category: productCategory || 'Category not detected',
            material: detectedMaterial || 'Material not detected',
            manufacturingLocation: manufacturingLocation || 'Location not detected',
            confidence: {
                material: materialMatch?.isDirectMatch ? 'high' : 'medium',
                location: locationMatch?.isDirectMatch ? 'high' : 'medium',
                productType: typeMatch?.isDirectMatch ? 'high' : 'medium'
            },
            emissionScore: detectedMaterial ? 
                'test co2' : null
        };
    }

    async function scrapeProductInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await fetch(tab.url);
            const html = await response.text();
            
            const productDetails = await extractProductDetailsFromText(html);
            
            let resultMessage = `
                Product Name: ${productDetails.name}
                Type: ${productDetails.type}
                Material: ${productDetails.material}
                Manufacturing Location: ${productDetails.manufacturingLocation}
                
            `;
            /*
            ${productDetails.emissionScore ? 
                    `Estimated Material Emissions: ${productDetails.emissionScore.toFixed(2)} kg CO2e` : 
                    'Emissions data not available'}
            */
            displayResult(resultMessage);
    
            // Calculate transportation emissions if manufacturing location is detected
            if (productDetails.manufacturingLocation !== 'Location not detected') {
                getUserLocationAndCalculateDistance((distance) => {
                    const transportEmissions = getEmissions(distance);
                    displayEmissions(distance, transportEmissions);
                });
            }
        } catch (error) {
            console.error('Error in scrapeProductInfo:', error);
            displayResult(`Error analyzing product: ${error.message}`);
        }
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
