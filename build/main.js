document.addEventListener('DOMContentLoaded', () => {
    const assetGrid = document.getElementById('assetGrid');
    const searchInput = document.getElementById('searchInput');
    const tabButtons = document.querySelectorAll('.tab-button');
    let audioPlayers = new Map(); // Store audio players by asset title
    let currentTab = 'images';

    // GitHub API endpoint for images
    const githubApiUrl = "https://api.github.com/repos/Yamura3/thumb/contents/";

    let assets = []; // Dynamic assets list

    async function fetchAssets() {
        try {
            const response = await fetch(githubApiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch assets: ${response.status} - ${response.statusText}`);
            }

            // Parse the JSON response and create asset objects
            const files = await response.json();

            // Dynamically populate assets with images
            const images = files
                .filter(file => file.type === "file" && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
                .map(file => ({
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                    url: file.download_url,
                    type: 'image',
                    tags: file.name.replace(/\.[^/.]+$/, "").toLowerCase() // Example tag generation
                }));

            // Merge with other static asset types if needed
            assets = [...images];
            renderAssets();
        } catch (error) {
            console.error("Error fetching assets:", error);
            assetGrid.innerHTML = `
                <div class="col-span-full text-center p-4 bg-gray-100 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-700">Error loading assets, please try again later.</h2>
                </div>
            `;
        }
    }

    function createImageCard(asset) {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <img src="${asset.url}" alt="${asset.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2">${asset.title}</h3>
                    <a href="${asset.url}" target="_blank" Download class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function renderAssets(filteredAssets = assets) {
        const images = filteredAssets.filter(asset => asset.type === 'image');
        const videos = filteredAssets.filter(asset => asset.type === 'video');
        const sfx = filteredAssets.filter(asset => asset.type === 'sfx');
        const music = filteredAssets.filter(asset => asset.type === 'music');
        const fonts = filteredAssets.filter(asset => asset.type === 'font');

        let assetsToRender;
        switch (currentTab) {
            case 'images':
                assetsToRender = images;
                break;
            case 'videos':
                assetsToRender = videos;
                break;
            case 'sfx':
                assetsToRender = sfx;
                break;
            case 'music':
                assetsToRender = music;
                break;
            case 'fonts':
                assetsToRender = fonts;
                break;
            default:
                assetsToRender = images;
        }

        if (assetsToRender.length === 0) {
            assetGrid.innerHTML = `
                <div class="col-span-full text-center p-4 bg-gray-100 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-700">No assets found, try something else...</h2>
                </div>
            `;
            return;
        }

        assetGrid.innerHTML = assetsToRender.map(asset => {
            if (asset.type === 'image') return createImageCard(asset);
            if (asset.type === 'video') return createVideoCard(asset);
            if (asset.type === 'font') return createFontCard(asset);
            return createAudioCard(asset);
        }).join('');

        // Initialize audio players
        assetsToRender.forEach(asset => {
            if (asset.type === 'sfx' || asset.type === 'music') {
                const id = `audio-${asset.title.replace(/\s+/g, '-').toLowerCase()}`;
                const audio = document.getElementById(id);
                if (audio) {
                    audioPlayers.set(asset.title, audio);
                }
            }
        });
    }

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab styles
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            button.classList.remove('border-transparent', 'text-gray-500');
            button.classList.add('border-blue-500', 'text-blue-600');

            // Update current tab and render
            currentTab = button.dataset.tab;
            renderAssets();
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const searchTerms = searchTerm.split(/\s+/).filter(term => term.length > 1); // Ignore very short terms

        const filteredAssets = assets.filter(asset => {
            const tagsArray = asset.tags.toLowerCase().split(/\s+/);
            const titleArray = asset.title.toLowerCase().split(/\s+/);

            return searchTerms.some(term =>
                titleArray.some(word => word.includes(term)) ||
                tagsArray.some(tag => tag.includes(term))
            );
        });

        // Display all assets if no actual search term is entered (only spaces)
        if (searchTerms.length === 0) {
            renderAssets();
        } else {
            renderAssets(filteredAssets);
        }
    });

    // Fetch assets and render on load
    fetchAssets();
});
