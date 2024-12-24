document.addEventListener('DOMContentLoaded', () => {
    const assetGrid = document.getElementById('assetGrid');
    const searchInput = document.getElementById('searchInput');
    const tabButtons = document.querySelectorAll('.tab-button');
    let audioPlayers = new Map(); // Store audio players by asset title
    let currentTab = 'thumbnails';

    function createThumbnailCard(asset) {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <img src="${asset.url}" alt="${asset.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2">${asset.title}</h3>
                    <a href="${asset.url}" download class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function createAudioCard(asset) {
        const id = `audio-${asset.title.replace(/\s+/g, '-').toLowerCase()}`;
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2">${asset.title}</h3>
                    <div class="flex items-center space-x-2 mb-3">
                        <button onclick="togglePlay('${asset.title}')" class="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                            <svg id="play-icon-${asset.title}" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <span id="duration-${id}" class="text-sm text-gray-600">Loading...</span>
                        <audio id="${id}" src="${asset.url}" onloadedmetadata="updateDuration('${id}')"></audio>
                    </div>
                    <a href="${asset.url}" download class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function renderAssets(filteredAssets = assets) {
        const thumbnails = filteredAssets.filter(asset => asset.type === 'thumbnail');
        const sfx = filteredAssets.filter(asset => asset.type === 'sfx');
        const music = filteredAssets.filter(asset => asset.type === 'music');

        let assetsToRender;
        switch(currentTab) {
            case 'thumbnails':
                assetsToRender = thumbnails;
                break;
            case 'sfx':
                assetsToRender = sfx;
                break;
            case 'music':
                assetsToRender = music;
                break;
            default:
                assetsToRender = thumbnails;
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
            return asset.type === 'thumbnail' ? createThumbnailCard(asset) : createAudioCard(asset);
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
            renderAssets(assets);
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
            renderAssets(assets);
        } else {
            renderAssets(filteredAssets);
        }
    });

    // Audio control function
    window.togglePlay = function(assetTitle) {
        const audio = audioPlayers.get(assetTitle);
        const playIcon = document.getElementById(`play-icon-${assetTitle}`);
        const playPath = document.getElementById(`play-path-${assetTitle}`);
        const pausePath = document.getElementById(`pause-path-${assetTitle}`);
        if (!audio) return;

        if (audio.paused) {
            // Stop all other playing audio
            audioPlayers.forEach(player => {
                if (player !== audio && !player.paused) {
                    player.pause();
                    player.currentTime = 0;
                }
            });
            audio.play();
            playPath.style.display = 'none';
            pausePath.style.display = 'block';
        } else {
            audio.pause();
            audio.currentTime = 0;
            playPath.style.display = 'block';
            pausePath.style.display = 'none';
        }
    };

    // Duration update function
    window.updateDuration = function(id) {
        const audio = document.getElementById(id);
        const durationElement = document.getElementById(`duration-${id}`);
        if (audio && durationElement) {
            durationElement.textContent = formatDuration(audio.duration);
        }
    };

    // Initial render
    renderAssets();
});