document.addEventListener('DOMContentLoaded', () => {
    const lightSwitch = document.getElementById('lightSwitch');

    // Apply saved theme from localStorage
    if (localStorage.getItem('dark-mode') === 'true') {
        document.documentElement.classList.add('dark');
        lightSwitch.checked = true;
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Add event listener for theme toggling
    lightSwitch.addEventListener('change', () => {
        const isDark = lightSwitch.checked;
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('dark-mode', isDark);
    });
    const assetGrid = document.getElementById('assetGrid');
    const searchInput = document.getElementById('searchInput');
    const tabButtons = document.querySelectorAll('.tab-button');
    let audioPlayers = new Map();
    let currentTab = 'images';
    let assets = {
        images: [],
        videos: [],
        sfx: [],
        music: [],
        fonts: []
    };

    const githubApiUrl = "https://api.github.com/repos/Yxmura/assets/contents/";

    async function fetchAssets(category) {
        try {
            const response = await fetch(githubApiUrl + category);
            if (!response.ok) throw new Error(`Failed to fetch ${category} assets`);
            
            const files = await response.json();
            const categoryAssets = files
                .filter(file => file.type === "file")
                .map(file => ({
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    url: file.download_url,
                    type: category,
                    extension: file.name.split('.').pop().toLowerCase(),
                    tags: file.name.replace(/\.[^/.]+$/, "").toLowerCase()
                }));

            assets[category] = categoryAssets;
            renderAssets();
        } catch (error) {
            console.error(`Error fetching ${category} assets:`, error);
            assetGrid.innerHTML = `
                <div class="col-span-full text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">Error loading assets, please try again later.</h2>
                </div>
            `;
        }
    }

    function createImageCard(asset) {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] h-[400px] flex flex-col">
                <div class="h-48 overflow-hidden">
                    <img src="${asset.url}" alt="${asset.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">${asset.title}</h3>
                    <a href="${asset.url}" download="${asset.title}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function createVideoCard(asset) {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] h-[400px] flex flex-col">
                <div class="h-48 bg-black flex items-center justify-center">
                    <video src="${asset.url}" class="w-full h-full object-cover" controls></video>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">${asset.title}</h3>
                    <a href="${asset.url}" download="${asset.title}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function createAudioCard(asset) {
        const id = `audio-${asset.title.replace(/\s+/g, '-')}`;
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] h-[300px] flex flex-col">
                <div class="bg-gradient-to-br from-[#9b87f5] to-[#8a74f4] flex items-center justify-center p-4">
                    <div class="w-full">
                        <div id="waveform-${id}" class="w-full h-16 mb-2"></div>
                        <div class="flex justify-between items-center text-white text-sm mb-2">
                            <span class="duration-${id}">0:00</span>
                            <button onclick="toggleAudio('${id}')" class="play-button-${id} bg-white text-[#9b87f5] px-4 py-1 rounded-full hover:bg-gray-100 transition-colors">
                                Play
                            </button>
                        </div>
                    </div>
                    <audio id="${id}" src="${asset.url}" class="custom-audio-player"></audio>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">${asset.title}</h3>
                    <a href="${asset.url}" download="${asset.title}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function createFontCard(asset) {
        // Create a unique font-family name using the asset title
        const fontFamily = `font-${asset.title.replace(/\s+/g, '-')}`;
    
        // Dynamically inject the @font-face CSS rule
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @font-face {
                font-family: '${fontFamily}';
                src: url('${asset.url}');
            }
        `;
        document.head.appendChild(styleElement);
    
        // Return the font card HTML with the custom font applied
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] h-[200px] flex flex-col">
                <div class="h-48 bg-gradient-to-br from-[#9b87f5] to-[#8a74f4] flex items-center justify-center p-4">
                    <span class="text-4xl text-white" style="font-family: '${fontFamily}';">${asset.title}</span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <a href="${asset.url}" download="${asset.title}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded hover:bg-[#8a74f4] transition-colors">
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

    function renderAssets(filteredAssets = assets[currentTab]) {
        if (!filteredAssets || filteredAssets.length === 0) {
            assetGrid.innerHTML = `
                <div class="col-span-full text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">No assets found</h2>
                </div>
            `;
            return;
        }

        assetGrid.innerHTML = filteredAssets.map(asset => {
            switch(currentTab) {
                case 'images':
                    return createImageCard(asset);
                case 'videos':
                    return createVideoCard(asset);
                case 'music':
                case 'sfx':
                    return createAudioCard(asset);
                case 'fonts':
                    return createFontCard(asset);
                default:
                    return createImageCard(asset);
            }
        }).join('');

        // Initialize WaveSurfer for audio assets
        if (currentTab === 'music' || currentTab === 'sfx') {
            filteredAssets.forEach(asset => {
                const id = `audio-${asset.title.replace(/\s+/g, '-')}`;
                const wavesurfer = WaveSurfer.create({
                    container: `#waveform-${id}`,
                    waveColor: '#ffffff99',
                    progressColor: '#ffffff',
                    cursorColor: '#ffffff',
                    barWidth: 2,
                    barGap: 1,
                    height: 64,
                    responsive: true
                });
                wavesurfer.load(asset.url);
                
                // Update duration when audio is loaded
                wavesurfer.on('ready', () => {
                    const duration = wavesurfer.getDuration();
                    const durationElement = document.querySelector(`.duration-${id}`);
                    if (durationElement) {
                        durationElement.textContent = formatDuration(duration);
                    }
                });
                
                audioPlayers.set(id, { wavesurfer, isPlaying: false });
            });
        }
    }

    // Global function for audio control
    window.toggleAudio = (id) => {
        const player = audioPlayers.get(id);
        if (!player) return;

        const button = document.querySelector(`.play-button-${id}`);
        if (player.isPlaying) {
            player.wavesurfer.pause();
            button.textContent = 'Play';
        } else {
            player.wavesurfer.play();
            button.textContent = 'Pause';
        }
        player.isPlaying = !player.isPlaying;
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            button.classList.remove('border-transparent', 'text-gray-500');
            button.classList.add('border-blue-500', 'text-blue-600');

            currentTab = button.dataset.tab;
            audioPlayers.forEach(player => {
                player.wavesurfer.destroy();
            });
            audioPlayers.clear();
            fetchAssets(currentTab);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const searchTerms = searchTerm.split(/\s+/).filter(term => term.length > 1);

        if (searchTerms.length === 0) {
            renderAssets();
            return;
        }

        const filteredAssets = assets[currentTab].filter(asset => {
            return searchTerms.some(term =>
                asset.title.toLowerCase().includes(term) ||
                asset.tags.toLowerCase().includes(term)
            );
        });

        renderAssets(filteredAssets);
    });

    fetchAssets(currentTab);
});