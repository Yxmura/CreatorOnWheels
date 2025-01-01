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
        fonts: [],
        presets: [],
        minecraft: [{
            title: "Minecraft Item And Blocks Icons",
            description: "Browse and download Minecraft item icons",
            url: "https://mcicons.ccleaf.com/",
            tags: "minecraft icons items blocks"
        }]
    };

    // for the presets (to filter like the 2 categories yk)
    let presetFilters = {
        davinci: true,
        premiere: true
    };

    const filterButtons = document.createElement('div');
    filterButtons.className = 'flex gap-2 ml-4';
    filterButtons.innerHTML = `
    <button id="davinciFilter" class="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-[#8a74f4] transition-colors flex items-center gap-2 shadow-lg" data-type="davinci">
    <img src="./assets/Davinci.svg" alt="Icon" class="w-4 h-4" />
        DaVinci Resolve
    </button>
    <button id="premiereFilter" class="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-[#8a74f4] transition-colors flex items-center gap-2 shadow-lg" data-type="premiere">
    <svg class="w-4 h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12.1333C2 8.58633 2 6.81283 2.69029 5.45806C3.29749 4.26637 4.26637 3.29749 5.45806 2.69029C6.81283 2 8.58633 2 12.1333 2H19.8667C23.4137 2 25.1872 2 26.5419 2.69029C27.7336 3.29749 28.7025 4.26637 29.3097 5.45806C30 6.81283 30 8.58633 30 12.1333V19.8667C30 23.4137 30 25.1872 29.3097 26.5419C28.7025 27.7336 27.7336 28.7025 26.5419 29.3097C25.1872 30 23.4137 30 19.8667 30H12.1333C8.58633 30 6.81283 30 5.45806 29.3097C4.26637 28.7025 3.29749 27.7336 2.69029 26.5419C2 25.1872 2 23.4137 2 19.8667V12.1333Z" fill="#00005B"/>
    <path d="M8 21.7957V9.20796C8 9.12233 8.0351 9.0734 8.11701 9.0734C9.32624 9.0734 10.5349 9 11.7445 9C13.7071 9 15.8323 9.68403 16.5772 11.7769C16.7527 12.2907 16.8463 12.8167 16.8463 13.3672C16.8463 14.4192 16.6123 15.2877 16.1442 15.9728C14.8368 17.8864 12.5706 17.8567 10.5392 17.8567V21.7834C10.5551 21.8997 10.4579 21.9547 10.3637 21.9547H8.14042C8.04681 21.9547 8 21.9058 8 21.7957ZM10.5509 11.4344V15.5446C11.3564 15.6048 12.1992 15.6113 12.9731 15.3489C13.8275 15.0977 14.2954 14.3439 14.2954 13.4406C14.3192 12.6709 13.9077 11.9323 13.2072 11.6546C12.4426 11.3305 11.3763 11.3111 10.5509 11.4344Z" fill="#9999FF"/>
    <path d="M18.4325 12.2119H20.4861C20.5993 12.213 20.701 12.2947 20.7309 12.4089C20.8814 12.7582 20.9 13.1795 20.9005 13.5566C21.2527 13.1279 21.6773 12.7708 22.1533 12.5029C22.6638 12.201 23.2425 12.0479 23.8289 12.0598C23.9263 12.0452 24.0124 12.1353 23.9985 12.237V14.6201C23.9985 14.7122 23.9355 14.758 23.8101 14.758C22.9409 14.6953 21.5877 14.91 20.9561 15.6246V21.821C20.9561 21.9392 20.9059 21.9983 20.8054 21.9983H18.6021C18.4939 22.0145 18.3984 21.9127 18.4137 21.8013V15.0731C18.4137 14.1716 18.4324 13.2429 18.3007 12.3498C18.2804 12.2676 18.3556 12.1912 18.4325 12.2119Z" fill="#9999FF"/>
    </svg>
        Premiere Pro
    </button>
`;
    filterButtons.style.display = 'none';
    searchInput.parentElement.appendChild(filterButtons);

    // Add filter button functionality
    const filterButtonElements = filterButtons.querySelectorAll('button');
    filterButtonElements.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            button.classList.toggle('opacity-50');
            presetFilters[type] = !presetFilters[type];
            if (currentTab === 'presets') {
                renderAssets(filterPresets());
            }
        });
    });

    const githubApiUrl = "https://api.github.com/repos/Yxmura/assets/contents/";

    async function fetchContentsRecursively(path) {
        try {
            const response = await fetch(`${githubApiUrl}${path}`);
            if (!response.ok) throw new Error(`Failed to fetch contents from ${path}`);
            
            const contents = await response.json();
            let files = [];

            for (const item of contents) {
                if (item.type === "file") {
                    const presetType = path.includes('davinci') ? 'davinci' : 
                                     path.includes('premiere') ? 'premiere' : null;
                    files.push({
                        title: item.name.replace(/\.[^/.]+$/, ""),
                        url: item.download_url,
                        type: path.split('/')[0],
                        extension: item.name.split('.').pop().toLowerCase(),
                        tags: `${path.replace(/\//g, ' ')} ${item.name.replace(/\.[^/.]+$/, "")}`.toLowerCase(),
                        presetType: presetType
                    });
                } else if (item.type === "dir") {
                    const subFiles = await fetchContentsRecursively(`${path}/${item.name}`);
                    files = files.concat(subFiles);
                }
            }

            return files;
        } catch (error) {
            console.error(`Error fetching contents from ${path}:`, error);
            return [];
        }
    }

    async function fetchPresets() {
        try {
            const davinciPresets = await fetchContentsRecursively('presets/davinci');
            const premierePresets = await fetchContentsRecursively('presets/premiere');
            assets.presets = [...davinciPresets, ...premierePresets];
            renderAssets(filterPresets());
        } catch (error) {
            console.error('Error fetching presets:', error);
        }
    }

    function filterPresets() {
        return assets.presets.filter(asset => 
            presetFilters[asset.presetType]
        );
    }

    async function fetchAssets(category) {
        try {
            if (category === 'presets') {
                filterButtons.style.display = 'flex';
                await fetchPresets();
            } else {
                filterButtons.style.display = 'none';
                const categoryAssets = await fetchContentsRecursively(category);
                if (categoryAssets.length === 0) {
                    throw new Error(`No assets found in ${category}`);
                }
                assets[category] = categoryAssets;
                renderAssets();
            }
        } catch (error) {
            console.error(`Error fetching ${category} assets:`, error);
            assetGrid.innerHTML = `
                <div class="col-span-full text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">Error loading assets, please try again later.</h2>
                </div>
            `;
        }
    }

    // Helper function to parse title and credit
    function parseAssetTitle(title) {
        const creditMatch = title.match(/__(.+)$/);
        if (creditMatch) {
            return {
                displayTitle: title.replace(/__(.+)$/, '').trim(),
                credit: creditMatch[1],
                originalTitle: title // Keep the original title for file operations
            };
        }
        return {
            displayTitle: title,
            credit: null,
            originalTitle: title
        };
    }

    // Credit badge HTML template
    function createCreditBadge(credit) {
        if (!credit) return '';
        return `
            <div class="absolute top-2 right-2 z-10 bg-black/40 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <div class="flex items-center gap-1 sm:gap-1.5">
                    <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-2h2V7h-2v7z"/>
                    </svg>
                    <span class="text-xs sm:text-sm font-medium text-white">Credit: ${credit}</span>
                </div>
            </div>
        `;
    }

    function createImageCard(asset) {
        const { displayTitle, credit, originalTitle } = parseAssetTitle(asset.title);
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] flex flex-col min-h-[300px] sm:h-[400px]">
                <div class="relative h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    ${createCreditBadge(credit)}
                    <div class="w-full h-full flex items-center justify-center">
                        <img 
                            src="${asset.url}" 
                            alt="${displayTitle}" 
                            class="max-w-full max-h-full object-scale-down"
                            loading="lazy"
                            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'%3E%3C/rect%3E%3Ccircle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'%3E%3C/circle%3E%3Cpolyline points=\'21 15 16 10 5 21\'%3E%3C/polyline%3E%3C/svg%3E';"
                        >
                    </div>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">${displayTitle}</h3>
                    <a href="${asset.url}" target="_blank" download="${originalTitle}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded text-sm sm:text-base hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }
    
    function createVideoCard(asset) {
        const { displayTitle, credit, originalTitle } = parseAssetTitle(asset.title);
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] flex flex-col min-h-[300px] sm:h-[400px]">
                <div class="relative h-40 sm:h-48 bg-black flex items-center justify-center">
                    ${createCreditBadge(credit)}
                    <video 
                        class="w-full h-full object-cover" 
                        controls
                        preload="metadata"
                    >
                        <source src="${asset.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">${displayTitle}</h3>
                    <a href="${asset.url}" target="_blank" download="${originalTitle}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded text-sm sm:text-base hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }
    
    function createAudioCard(asset) {
        const { displayTitle, credit, originalTitle } = parseAssetTitle(asset.title);
        const id = `audio-${displayTitle.replace(/\s+/g, '-')}`;
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] flex flex-col min-h-[250px] sm:h-[300px]">
                <div class="relative bg-gradient-to-br from-[#9b87f5] to-[#8a74f4] flex items-center justify-center p-4">
                    ${createCreditBadge(credit)}
                    <div class="w-full">
                        <div id="waveform-${id}" class="w-full h-12 sm:h-16 mb-2"></div>
                        <div class="flex justify-between items-center text-white text-xs sm:text-sm mb-2">
                            <span class="duration-${id}">0:00</span>
                            <button onclick="toggleAudio('${id}')" class="play-button-${id} bg-white text-[#9b87f5] px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm hover:bg-gray-100 transition-colors">
                                Play
                            </button>
                        </div>
                    </div>
                    <audio id="${id}" src="${asset.url}" class="custom-audio-player"></audio>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">${displayTitle}</h3>
                    <a href="${asset.url}" target="_blank" download="${originalTitle}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded text-sm sm:text-base hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function createFontCard(asset) {
        const { displayTitle, credit, originalTitle } = parseAssetTitle(asset.title);
        const fontFamily = `font-${displayTitle.replace(/\s+/g, '-')}`;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @font-face {
                font-family: '${fontFamily}';
                src: url('${asset.url}');
            }
        `;
        document.head.appendChild(styleElement);
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] h-[200px] flex flex-col">
                <div class="relative h-48 bg-gradient-to-br from-[#9b87f5] to-[#8a74f4] flex items-center justify-center p-4">
                    ${createCreditBadge(credit)}
                    <span class="text-4xl text-white" style="font-family: '${fontFamily}';">${displayTitle}</span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <a href="${asset.url}" target="_blank" download="${originalTitle}.${asset.extension}" class="inline-block bg-secondary text-white px-4 py-2 rounded hover:bg-[#8a74f4] transition-colors">
                        Download
                    </a>
                </div>
            </div>
        `;
    }

    function createPresetCard(asset) {
        const davinciBadge = `<img src="./assets/Davinci.svg" alt="davinci" class="w-8 h-8" />
        `;
    
        const premiereBadge = `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 32 32" fill="none">
            <path d="M2 12.1333C2 8.58633 2 6.81283 2.69029 5.45806C3.29749 4.26637 4.26637 3.29749 5.45806 2.69029C6.81283 2 8.58633 2 12.1333 2H19.8667C23.4137 2 25.1872 2 26.5419 2.69029C27.7336 3.29749 28.7025 4.26637 29.3097 5.45806C30 6.81283 30 8.58633 30 12.1333V19.8667C30 23.4137 30 25.1872 29.3097 26.5419C28.7025 27.7336 27.7336 28.7025 26.5419 29.3097C25.1872 30 23.4137 30 19.8667 30H12.1333C8.58633 30 6.81283 30 5.45806 29.3097C4.26637 28.7025 3.29749 27.7336 2.69029 26.5419C2 25.1872 2 23.4137 2 19.8667V12.1333Z" fill="#00005B"/>
            <path d="M8 21.7957V9.20796C8 9.12233 8.0351 9.0734 8.11701 9.0734C9.32624 9.0734 10.5349 9 11.7445 9C13.7071 9 15.8323 9.68403 16.5772 11.7769C16.7527 12.2907 16.8463 12.8167 16.8463 13.3672C16.8463 14.4192 16.6123 15.2877 16.1442 15.9728C14.8368 17.8864 12.5706 17.8567 10.5392 17.8567V21.7834C10.5551 21.8997 10.4579 21.9547 10.3637 21.9547H8.14042C8.04681 21.9547 8 21.9058 8 21.7957ZM10.5509 11.4344V15.5446C11.3564 15.6048 12.1992 15.6113 12.9731 15.3489C13.8275 15.0977 14.2954 14.3439 14.2954 13.4406C14.3192 12.6709 13.9077 11.9323 13.2072 11.6546C12.4426 11.3305 11.3763 11.3111 10.5509 11.4344Z" fill="#9999FF"/>
            <path d="M18.4325 12.2119H20.4861C20.5993 12.213 20.701 12.2947 20.7309 12.4089C20.8814 12.7582 20.9 13.1795 20.9005 13.5566C21.2527 13.1279 21.6773 12.7708 22.1533 12.5029C22.6638 12.201 23.2425 12.0479 23.8289 12.0598C23.9263 12.0452 24.0124 12.1353 23.9985 12.237V14.6201C23.9985 14.7122 23.9355 14.758 23.8101 14.758C22.9409 14.6953 21.5877 14.91 20.9561 15.6246V21.821C20.9561 21.9392 20.9059 21.9983 20.8054 21.9983H18.6021C18.4939 22.0145 18.3984 21.9127 18.4137 21.8013V15.0731C18.4137 14.1716 18.4324 13.2429 18.3007 12.3498C18.2804 12.2676 18.3556 12.1912 18.4325 12.2119Z" fill="#9999FF"/>
        </svg>`;
    
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] h-[300px] flex flex-col">
                <div class="relative h-40 bg-gradient-to-r from-left to-right p-6">
                    <div class="absolute top-4 right-4 text-white bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                        ${asset.presetType === 'davinci' ? davinciBadge : premiereBadge}
                    </div>
                    <div class="flex flex-col h-full justify-center">
                        <h3 class="text-2xl font-semibold text-white mt-2">${asset.title}</h3>
                        <span class="text-white/80 text-sm mt-2">
                            ${asset.presetType === 'davinci' ? 'DaVinci Resolve' : 'Premiere Pro'} Preset
                        </span>
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between">
                    <div class="flex-grow"></div>
                    <a href="${asset.url}" target="_blank" 
                       download="${asset.title}.${asset.extension}" 
                       class="inline-block bg-secondary text-white px-4 py-2.5 rounded-lg hover:bg-[#8a74f4] transition-colors text-center font-medium">
                        Download Preset
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

    function createMinecraftCard() {
        return `
            <div class="col-span-full">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div class="bg-gradient-to-r from-[#9b87f5] to-[#8a74f4] p-6">
                        <h2 class="text-2xl font-bold text-white mb-2">Minecraft Icons & Assets</h2>
                        <p class="text-white/80">Browse and download Minecraft related assets and icons</p>
                    </div>
                    <div class="p-4">
                        <div class="w-full rounded-lg overflow-hidden" style="height: 600px;">
                            
                        </div>
                    </div>
                </div>
            </div>
        `;
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
                case 'presets':
                    return createPresetCard(asset);
                case 'minecraft':
                    return createMinecraftCard(asset);
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
                btn.classList.remove('border-secondary', 'text-secondary', 'font-medium');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            button.classList.remove('border-transparent', 'text-gray-500');
            button.classList.add('border-secondary', 'text-secondary', 'font-medium');

            currentTab = button.dataset.tab;
            if (currentTab === 'presets') {
                filterButtons.style.display = 'flex';
                fetchPresets();
            } else {
                filterButtons.style.display = 'none';
                audioPlayers.forEach(player => {
                    player.wavesurfer.destroy();
                });
                audioPlayers.clear();
                if (currentTab === 'minecraft') {
                    renderAssets(assets.minecraft);
                } else {
                    fetchAssets(currentTab);
                }
            }
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