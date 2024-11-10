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
        resultElement.style.color = '#2e7d32';  // Keep the green color
        resultElement.innerHTML = message.replace(/\n/g, '<br>');
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
        
        // Helper function to get content after product name
        function getContentAfterProductName(doc) {
            // Common product name heading selectors
            const nameSelectors = [
                'h1',
                '[class*="product-name"]',
                '[class*="product-title"]',
                '[class*="title"]',
                '[data-testid*="product-name"]',
                '#product-name',
                '.product-name'
            ];
    
            // Find the product name heading
            let productHeading = null;
            for (const selector of nameSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    productHeading = element;
                    break;
                }
            }
    
            if (!productHeading) {
                return doc.body.innerText.toLowerCase(); // Fallback to all content
            }
    
            // Get all content after the product name heading
            let contentSection = '';
            let currentNode = productHeading;
            
            // Function to check if we've reached common end markers
            function isEndMarker(node) {
                const endMarkers = ['related products', 'you may also like', 'reviews', 'ratings', 'similar items'];
                const text = node.textContent?.toLowerCase() || '';
                return endMarkers.some(marker => text.includes(marker));
            }
    
            // Traverse the DOM tree after the heading
            while (currentNode) {
                if (currentNode.nextSibling) {
                    currentNode = currentNode.nextSibling;
                    // Stop if we hit common end sections
                    if (isEndMarker(currentNode)) break;
                    if (currentNode.textContent) {
                        contentSection += ' ' + currentNode.textContent;
                    }
                } else if (currentNode.parentNode && currentNode.parentNode !== doc.body) {
                    currentNode = currentNode.parentNode;
                } else {
                    break;
                }
            }
    
            return contentSection.toLowerCase();
        }
    
        // Get content after product name
        const pageText = getContentAfterProductName(doc);
        console.log('Content found:', pageText.substring(0, 200)); // Debug log
    
        // Helper function for fuzzy matching
        function findMatches(text, searchTerms, targetTerms, windowSize = 100) {
            function fuzzyMatch(text, term) {
                text = text.toLowerCase();
                term = term.toLowerCase();
                
                // Direct match
                if (text.includes(term)) return true;
                // Plural forms
                if (text.includes(term + 's')) return true;
                if (text.includes(term + 'es')) return true;
                // Hyphenated forms
                if (text.includes(term.replace(' ', '-'))) return true;
                // Percentage matches (e.g., "100% cotton")
                if (text.match(new RegExp(`\\d+%\\s*${term}`))) return true;
                
                return false;
            }
    
            // Look for patterns like "Material: cotton" or "Made of cotton"
            for (const searchTerm of searchTerms) {
                const pattern = new RegExp(`${searchTerm}\\s*[:\\-]?\\s*([\\w\\s,-]+)(?=[.,\\n]|$)`, 'i');
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
    
            // Look for materials mentioned near material-related words
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
    
            // Look for material terms anywhere in the text
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
    
        const materials = [
            'cotton', 'organic cotton', 'wool', 'merino wool', 'cashmere', 'silk', 'linen', 'hemp',
            'polyester', 'nylon', 'spandex', 'elastane', 'lycra', 'acrylic', 'rayon', 'viscose', 'synthetic',
            'leather', 'suede', 'faux leather', 'vegan leather', 'pu leather',
            'cotton blend', 'wool blend', 'cotton-polyester', 'modal', 'tencel', 'bamboo',
            'gore-tex', 'polartec', 'cordura', 'kevlar',
            'recycled polyester', 'organic hemp', 'recycled cotton', 'econyl'
        ];
    
        const productTypes = {
            tops: [
                't-shirt', 't shirt', 'tee', 'shirt', 'polo', 'polo shirt', 'blouse', 'tank top', 'tank', 
                'sweater', 'sweatshirt', 'hoodie', 'hooded', 'cardigan', 'tunic', 'crop top', 'jersey',
                'turtleneck', 'henley', 'button-up', 'button up', 'button-down', 'button down', 'pullover',
                'top', 'long sleeve', 'short sleeve', 'sleeveless', 'v-neck', 'crew neck', 'mock neck',
                'muscle tank', 'cami', 'camisole', 'raglan', 'baseball tee', 'crop', 'cropped',
                'thermal', 'compression', 'base layer', 'tee shirt', 'jersey'
            ],
            bottoms: [
                'pants', 'jeans', 'trousers', 'shorts', 'skirt', 'leggings', 'chinos', 'khakis',
                'joggers', 'sweatpants', 'cargo pants', 'cargo', 'bermuda shorts', 'capri pants', 'capris',
                'culottes', 'palazzo pants', 'track pants', 'slacks', 'dress pants', 'corduroys', 'corduroy',
                'board shorts', 'swim shorts', 'basketball shorts', 'running shorts', 'bike shorts',
                'denim', 'jeggings', 'skinny jeans', 'straight leg', 'bootcut', 'wide leg', 'flare',
                'cropped pants', 'ankle pants', 'cargo shorts', 'jean shorts', 'jorts', 'midi skirt',
                'mini skirt', 'maxi skirt', 'pencil skirt', 'a-line skirt', 'pleated skirt',
                'compression pants', 'tights', 'training pants'
            ],
            dresses: [
                'dress', 'maxi dress', 'mini dress', 'midi dress', 'gown', 'sundress', 'sun dress',
                'shirt dress', 'shirtdress', 'wrap dress', 'cocktail dress', 'evening dress', 'party dress',
                'bodycon dress', 'a-line dress', 'shift dress', 'sweater dress', 't-shirt dress',
                'tee dress', 'slip dress', 'tennis dress', 'workout dress', 'casual dress',
                'formal dress', 'summer dress', 'winter dress', 'spring dress', 'fall dress',
                'sleeveless dress', 'long sleeve dress', 'short sleeve dress', 'halter dress',
                'strapless dress', 'off shoulder dress', 'one shoulder dress'
            ],
            outerwear: [
                'jacket', 'coat', 'blazer', 'windbreaker', 'wind breaker', 'parka', 'raincoat', 'rain jacket',
                'vest', 'bomber jacket', 'bomber', 'denim jacket', 'jean jacket', 'leather jacket',
                'peacoat', 'pea coat', 'trench coat', 'trench', 'winter coat', 'puffer jacket', 'puffer',
                'down jacket', 'down coat', 'fleece jacket', 'fleece', 'track jacket', 'sport jacket',
                'varsity jacket', 'varsity', 'coaches jacket', 'coach jacket', 'utility jacket',
                'military jacket', 'field jacket', 'ski jacket', 'snow jacket', 'snowboard jacket',
                'rain shell', 'shell jacket', 'softshell', 'soft shell', 'hardshell', 'hard shell',
                'windcheater', 'gilet', 'overcoat', 'mac coat', 'poncho', 'cape', 'cardigan coat',
                'shacket', 'shirt jacket', 'anorak', 'duffle coat', 'duffel coat', 'quilted jacket',
                'insulated jacket', 'performance jacket', 'outdoor jacket', 'running jacket',
                'training jacket', 'warm up jacket', 'tracksuit jacket', 'jersey'
            ],
            activewear: [
                'sports bra', 'athletic shorts', 'running tights', 'gym shirt', 'workout top',
                'tennis skirt', 'track pants', 'yoga pants', 'workout leggings', 'compression shorts',
                'compression tights', 'training shorts', 'training pants', 'running shorts', 'running pants',
                'exercise top', 'tank', 'performance tee', 'athletic tee', 'workout jacket',
                'warm up jacket', 'track suit', 'tracksuit', 'jersey', 'athletic dress', 'tennis dress',
                'gym shorts', 'volleyball shorts', 'bike shorts', 'cycling shorts', 'dance pants',
                'dance top', 'yoga top', 'athletic skirt', 'performance tank', 'muscle tank',
                'training shirt', 'workout set', 'active set', 'athletic set', 'fitness wear', 'jersey'
            ],
            swimwear: [
                'swimsuit', 'swim suit', 'bikini', 'swim trunks', 'one-piece', 'one piece',
                'boardshorts', 'board shorts', 'rash guard', 'rashguard', 'swim shorts',
                'bathing suit', 'swimming trunks', 'tankini', 'monokini', 'swim brief', 'speedo',
                'bikini top', 'bikini bottom', 'swim top', 'swim bottom', 'beach cover up',
                'cover up', 'swim cover', 'beach wrap', 'swim skirt', 'swim dress',
                'competition suit', 'racing suit', 'water shorts', 'beach shorts'
            ],
            accessories: [
                'hat', 'cap', 'scarf', 'gloves', 'belt', 'tie', 'socks', 'beanie', 'headband',
                'wristband', 'bandana', 'baseball cap', 'bucket hat', 'visor', 'winter hat',
                'neck gaiter', 'neck warmer', 'mittens', 'arm warmers', 'leg warmers', 'watch cap',
                'snapback', 'fitted cap', 'dad hat', 'trucker hat', 'sun hat', 'fedora',
                'beret', 'ear warmers', 'infinity scarf', 'wool scarf', 'silk scarf',
                'driving gloves', 'winter gloves', 'athletic socks', 'crew socks', 'ankle socks',
                'no-show socks', 'compression socks', 'dress socks', 'bow tie', 'suspenders',
                'wallet', 'backpack', 'duffel bag', 'gym bag', 'tote', 'messenger bag'
            ],
            footwear: [
                'shoes', 'sneakers', 'boots', 'sandals', 'slippers', 'loafers', 'heels', 'flats',
                'oxford shoes', 'oxford', 'athletic shoes', 'running shoes', 'training shoes',
                'basketball shoes', 'tennis shoes', 'walking shoes', 'hiking boots', 'work boots',
                'snow boots', 'rain boots', 'chelsea boots', 'ankle boots', 'dress shoes',
                'casual shoes', 'slip-ons', 'slip ons', 'mules', 'clogs', 'espadrilles',
                'boat shoes', 'deck shoes', 'driving shoes', 'moccasins', 'ballet flats',
                'platforms', 'wedges', 'pumps', 'stilettos', 'flip flops', 'slides', 'sport sandals',
                'water shoes', 'cleats', 'soccer cleats', 'football cleats', 'baseball cleats'
            ],
            underwear: [
                'underwear', 'bra', 'briefs', 'boxers', 'panties', 'lingerie', 'undershirt',
                'boxer briefs', 'thong', 'boyshorts', 'boy shorts', 'hipster', 'bikini underwear',
                'sports bra', 'wireless bra', 'push-up bra', 'push up bra', 'padded bra',
                'unpadded bra', 'strapless bra', 'convertible bra', 'bralette', 'camisole',
                'slip', 'shapewear', 'body shaper', 'compression shorts', 'compression underwear',
                'thermal underwear', 'long underwear', 'base layer', 'tank top undershirt',
                'v-neck undershirt', 'crew neck undershirt'
            ],
            sets_and_suits: [
                'suit', 'tracksuit', 'track suit', 'matching set', 'coordinates', 'co-ords',
                'two piece', 'two-piece', 'three piece', 'three-piece', 'outfit set',
                'pajama set', 'pyjama set', 'lounge set', 'workout set', 'active set',
                'swim set', 'bikini set', 'coords', 'ensemble', 'twin set', 'twinset',
                'pantsuit', 'pant suit', 'skirt suit', 'short set', 'sweater set'
            ],
            sportswear: [
                'jersey', 'uniform', 'team wear', 'team uniform', 'practice jersey',
                'game jersey', 'basketball jersey', 'football jersey', 'soccer jersey',
                'baseball jersey', 'hockey jersey', 'referee shirt', 'official uniform',
                'warm up suit', 'warmup suit', 'training kit', 'competition wear',
                'performance wear', 'athletic uniform', 'sports kit', 'team kit'
            ]
        };
    
        // Get product name from title or h1
        const titleElement = doc.querySelector('h1') || doc.querySelector('title');
        const productName = titleElement ? 
            titleElement.innerText.split('|')[0].trim() : 
            'Product name not found';
    
        // Material detection
        const materialKeywords = [
            'material:', 'fabric:', 'made from', 'composition:', 
            'made of', 'materials used:', 'fabric composition',
            'shell:', 'outer:', 'lining:', 'main:', '%'
        ];
        const materialMatch = findMatches(pageText, materialKeywords, materials);
    
        // Manufacturing location detection
        const locationKeywords = [
            'made in', 'manufactured in', 'origin:', 
            'country of origin', 'imported from', 'produced in'
        ];
        const countries = [
            'china', 'india', 'bangladesh', 'vietnam', 'turkey', 
            'italy', 'usa', 'spain', 'portugal', 'japan',
            'indonesia', 'cambodia', 'thailand', 'mexico', 'pakistan'
        ];
        const locationMatch = findMatches(pageText, locationKeywords, countries);
    
        // Product type detection (looking specifically for 'jacket' since we know it's a jacket)
        const typeMatch = findMatches(pageText, ['type:', 'category:', 'product:'], ['jacket', 'coaches jacket']);
    
        return {
            name: productName.charAt(0).toUpperCase() + productName.slice(1),
            type: typeMatch ? 
                typeMatch.value.charAt(0).toUpperCase() + typeMatch.value.slice(1) : 
                'Jacket',
            category: 'Outerwear',
            material: materialMatch ? 
                materialMatch.value.charAt(0).toUpperCase() + materialMatch.value.slice(1) : 
                'Material not detected',
            manufacturingLocation: locationMatch ? 
                locationMatch.value.charAt(0).toUpperCase() + locationMatch.value.slice(1) : 
                'Location not detected',
            confidence: {
                material: materialMatch?.isDirectMatch ? 'High' : 'Medium',
                location: locationMatch?.isDirectMatch ? 'High' : 'Medium',
                productType: typeMatch?.isDirectMatch ? 'High' : 'Medium'
            }
        };
    }

    async function scrapeProductInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await fetch(tab.url);
            const html = await response.text();
            
            const productDetails = await extractProductDetailsFromText(html);
            
            let resultMessage = `Product Name: ${productDetails.name}\n
    Type: ${productDetails.type}\n
    Material: ${productDetails.material}\n
    Manufacturing Location: ${productDetails.manufacturingLocation}`;
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
