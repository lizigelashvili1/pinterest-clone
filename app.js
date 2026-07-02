// ====== 1. უსაფრთხოება და ავტორიზაციის შემოწმება (AUTH GUARD) ======
const checkAuth = () => {
    const loggedInUser = localStorage.getItem('current_user');
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!loggedInUser && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (loggedInUser && isLoginPage) {
        window.location.href = 'index.html';
    }
};
checkAuth();

// LOGIN და REGISTER გადამრთველები
const goToLogin = document.getElementById('go-to-login');
const goToReg = document.getElementById('go-to-reg');
const registerBox = document.getElementById('register-box');
const loginBox = document.getElementById('login-box');

if (goToLogin && registerBox && loginBox) {
    goToLogin.addEventListener('click', () => {
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });
}
if (goToReg && registerBox && loginBox) {
    goToReg.addEventListener('click', () => {
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });
}

// რეგისტრაციის ლოგიკა
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = {
            name: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim().toLowerCase(),
            password: document.getElementById('reg-pass').value
        };
        localStorage.setItem('user_account', JSON.stringify(user));
        localStorage.setItem('current_user', JSON.stringify(user));
        localStorage.setItem('user_albums', JSON.stringify(["💅 ჩემი ფრჩხილები", "✒️ ტატუები", "🏡 სასურველი სახლები"]));
        window.location.href = 'index.html';
    });
}

// შესვლის ლოგიკა
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const pass = document.getElementById('login-pass').value;
        const account = JSON.parse(localStorage.getItem('user_account'));

        if (account && account.email === email && account.password === pass) {
            localStorage.setItem('current_user', JSON.stringify(account));
            window.location.href = 'index.html';
        } else {
            alert('არასწორი ელ-ფოსტა ან პაროლი! თავიდან სცადეთ ან დარეგისტრირდით.');
        }
    });
}

// გამოსვლა (Logout)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('current_user');
        window.location.href = 'login.html';
    });
}

// მომხმარებლის პროფილის ასახვა სხვადასხვა გვერდებზე
const currentUser = JSON.parse(localStorage.getItem('current_user'));
if (currentUser) {
    const navAv = document.getElementById('nav-avatar');
    const contAv = document.getElementById('contact-avatar');
    const profAv = document.getElementById('profile-avatar');
    const profName = document.getElementById('profile-name');
    const profEmail = document.getElementById('profile-email');

    if(navAv) navAv.innerText = currentUser.name[0].toUpperCase();
    if(contAv) contAv.innerText = currentUser.name[0].toUpperCase();
    if(profAv) profAv.innerText = currentUser.name[0].toUpperCase();
    if(profName) profName.innerText = currentUser.name;
    if(profEmail) profEmail.innerText = currentUser.email;
}


// ====== 2. თემის შეცვლა (DARK MODE) ======
const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pin_theme', theme);
    });
}
document.documentElement.setAttribute('data-theme', localStorage.getItem('pin_theme') || 'light');


// ====== 3. ნამდვილი UNSPLASH API-დან ფოტოების წამოღება ======
const homeGrid = document.getElementById('home-grid');
const mainLoader = document.getElementById('main-loader');

const fetchUnsplashPhotos = async (topic = 'nails,manicure') => {
    if (!homeGrid) return;
    if (mainLoader) mainLoader.classList.remove('hidden');
    homeGrid.innerHTML = '';

    try {
        const UNSPLASH_ACCESS_KEY = 'lENwE_BjCuPosRWzBCJa8Dr9HxIXj1qEIXUbht1KgGo';
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${topic}&count=30&client_id=${UNSPLASH_ACCESS_KEY}`);

        if (!response.ok) {
            throw new Error(`Unsplash API დააბრუნა სტატუსი: ${response.status}`);
        }
        const data = await response.json();
        
        if (mainLoader) mainLoader.classList.add('hidden');

        if (Array.isArray(data)) {
            data.forEach(photo => {
                const card = document.createElement('div');
                card.className = 'pin-card';
                card.innerHTML = `
                    <img src="${photo.urls.regular}" alt="Pinterest Idea">
                    <div class="pin-overlay"><h5>${photo.alt_description || "ესთეტიკური ინსპირაცია"}</h5></div>
                `;
                homeGrid.appendChild(card);
            });
        }
    } catch (error) {
        if (mainLoader) mainLoader.innerHTML = '<p style="color:#ff6b8b">API-ს ლიმიტი ამოიწურა. ცოტა ხანში ახლიდან ჩაიტვირთება.</p>';
    }
};

// კატეგორიების ღილაკების მუშაობა კლიკზე
const filterButtons = document.querySelectorAll('#main-filter-bar .filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchUnsplashPhotos(btn.dataset.topic);
    });
});

// საწყისი ჩატვირთვა მთავარზე
if (homeGrid) {
    fetchUnsplashPhotos('nails,manicure');
}


// ====== 4. ალბომების მართვა და ჩახატვა ======
const albumsContainer = document.getElementById('user-albums-container');
const albumSelectDropdown = document.getElementById('pin-album-select');

const renderAlbumsUI = () => {
    const albums = JSON.parse(localStorage.getItem('user_albums')) || ["💅 ჩემი ფრჩხილები", "✒️ ტატუები"];
    
    if (albumsContainer) {
        albumsContainer.innerHTML = '';
        albums.forEach(albumName => {
            const card = document.createElement('div');
            card.className = 'album-card';
            card.innerHTML = `
                <div class="album-cover"><i class="fas fa-folder-open"></i></div>
                <h4>${albumName}</h4>
            `;
            card.addEventListener('click', () => renderProfilePins(albumName));
            albumsContainer.appendChild(card);
        });
    }

    if (albumSelectDropdown) {
        albumSelectDropdown.innerHTML = '';
        albums.forEach(albumName => {
            const opt = document.createElement('option');
            opt.value = albumName;
            opt.innerText = albumName;
            albumSelectDropdown.appendChild(opt);
        });
    }
};

// ახალი ალბომის შექმნა პროფილზე
const createAlbumBtn = document.getElementById('create-album-btn');
if (createAlbumBtn) {
    createAlbumBtn.addEventListener('click', () => {
        const input = document.getElementById('new-album-name');
        const name = input.value.trim();
        if (name.length < 2) return alert('გთხოვთ შეიყვანოთ ვალიდური ალბომის სახელი!');

        const currentAlbums = JSON.parse(localStorage.getItem('user_albums')) || [];
        currentAlbums.push(name);
        localStorage.setItem('user_albums', JSON.stringify(currentAlbums));
        input.value = '';
        renderAlbumsUI();
    });
}

renderAlbumsUI();


// ====== 5. პროფილის სექციის ჩვენება / დამალვა ======
const profileNavBtn = document.getElementById('profile-nav-btn');
const profileSection = document.getElementById('profile-section');
const closeProfile = document.getElementById('close-profile');
const profilePinsGrid = document.getElementById('profile-pins-grid');
const mainFilterBar = document.getElementById('main-filter-bar');

if (profileNavBtn && profileSection) {
    profileNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profileSection.classList.remove('hidden');
        if (homeGrid) homeGrid.classList.add('hidden');
        if (mainFilterBar) mainFilterBar.classList.add('hidden');
        renderProfilePins(null); // აჩვენოს ყველა პირადი ფოტო
    });
}

if (closeProfile && profileSection) {
    closeProfile.addEventListener('click', () => {
        profileSection.classList.add('hidden');
        if (homeGrid) homeGrid.classList.remove('hidden');
        if (mainFilterBar) mainFilterBar.classList.remove('hidden');
    });
}

let currentProfileFilter = null; // ვინახავთ მიმდინარე ალბომის ფილტრს, წაშლის შემდეგ თავიდან დასარენდერებლად

const renderProfilePins = (filterAlbum = null) => {
    if (!profilePinsGrid) return;
    currentProfileFilter = filterAlbum;
    profilePinsGrid.innerHTML = '';
    const userPins = JSON.parse(localStorage.getItem('user_created_pins')) || [];

    const filtered = filterAlbum ? userPins.filter(p => p.album === filterAlbum) : userPins;

    filtered.forEach(pin => {
        const card = document.createElement('div');
        card.className = 'pin-card';
        card.innerHTML = `
            <img src="${pin.url}" alt="${pin.title}">
            <button type="button" class="pin-delete-btn" data-pin-id="${pin.id}" title="ფოტოს წაშლა"><i class="fas fa-trash-alt"></i></button>
            <div class="pin-overlay"><h5>${pin.title} <br><small>📂 ${pin.album}</small></h5></div>
        `;
        profilePinsGrid.appendChild(card);
    });

    if (filtered.length === 0) {
        profilePinsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-secondary);">ამ ალბომში ფოტოები ჯერ არ გაქვს ჩამატებული.</p>`;
    }
};

// ფოტოს წაშლა პროფილიდან (event delegation — ღილაკები დინამიურად იქმნება)
if (profilePinsGrid) {
    profilePinsGrid.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.pin-delete-btn');
        if (!deleteBtn) return;

        const pinId = deleteBtn.dataset.pinId;
        const confirmed = confirm('დარწმუნებული ხარ, რომ გინდა ამ ფოტოს წაშლა?');
        if (!confirmed) return;

        const userPins = JSON.parse(localStorage.getItem('user_created_pins')) || [];
        const updatedPins = userPins.filter(p => String(p.id) !== String(pinId));
        localStorage.setItem('user_created_pins', JSON.stringify(updatedPins));

        renderProfilePins(currentProfileFilter);
    });
}


// ====== 6. ხელით ახალი ფოტოს ჩამატება ალბომში (URL ან ფაილის ატვირთვა) ======
const addPinForm = document.getElementById('add-pin-form');
const modeUrlBtn = document.getElementById('mode-url-btn');
const modeFileBtn = document.getElementById('mode-file-btn');
const urlInputBlock = document.getElementById('url-input-block');
const fileInputBlock = document.getElementById('file-input-block');
const pinUrlInput = document.getElementById('pin-url');
const fileDropZone = document.getElementById('file-drop-zone');
const pinFileInput = document.getElementById('pin-file');
const filePreviewBox = document.getElementById('file-preview-box');
const filePreviewImg = document.getElementById('file-preview-img');
const removeFileBtn = document.getElementById('remove-file-btn');

let uploadedImageData = null; // base64-ად შენახული ატვირთული ფოტო

// URL / ფაილის რეჟიმებს შორის გადართვა
if (modeUrlBtn && modeFileBtn) {
    modeUrlBtn.addEventListener('click', () => {
        modeUrlBtn.classList.add('active');
        modeFileBtn.classList.remove('active');
        urlInputBlock.classList.remove('hidden');
        fileInputBlock.classList.add('hidden');
    });

    modeFileBtn.addEventListener('click', () => {
        modeFileBtn.classList.add('active');
        modeUrlBtn.classList.remove('active');
        fileInputBlock.classList.remove('hidden');
        urlInputBlock.classList.add('hidden');
    });
}

// ფოტოს ზომის შემცირება Canvas-ის საშუალებით (localStorage-ის დასაზოგად)
const resizeImageToBase64 = (file, maxDimension = 1280, quality = 0.82) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > height && width > maxDimension) {
                    height = Math.round(height * (maxDimension / width));
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round(width * (maxDimension / height));
                    height = maxDimension;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const handleSelectedFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
        alert('გთხოვთ აირჩიოთ სურათის ფაილი (JPG, PNG, WEBP)!');
        return;
    }
    if (file.size > 8 * 1024 * 1024) {
        alert('ფაილის ზომა არ უნდა აღემატებოდეს 8MB-ს!');
        return;
    }

    try {
        uploadedImageData = await resizeImageToBase64(file);
        filePreviewImg.src = uploadedImageData;
        filePreviewBox.classList.remove('hidden');
        fileDropZone.classList.add('hidden');
    } catch (err) {
        alert('ფოტოს დამუშავება ვერ მოხერხდა, სცადეთ სხვა ფაილი.');
    }
};

if (fileDropZone && pinFileInput) {
    fileDropZone.addEventListener('click', () => pinFileInput.click());

    pinFileInput.addEventListener('change', () => {
        if (pinFileInput.files[0]) handleSelectedFile(pinFileInput.files[0]);
    });

    // Drag & Drop მხარდაჭერა
    ['dragenter', 'dragover'].forEach(evt => {
        fileDropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            fileDropZone.classList.add('drag-over');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        fileDropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            fileDropZone.classList.remove('drag-over');
        });
    });
    fileDropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) handleSelectedFile(file);
    });
}

if (removeFileBtn) {
    removeFileBtn.addEventListener('click', () => {
        uploadedImageData = null;
        pinFileInput.value = '';
        filePreviewImg.src = '';
        filePreviewBox.classList.add('hidden');
        fileDropZone.classList.remove('hidden');
    });
}

if (addPinForm) {
    addPinForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isFileMode = fileInputBlock && !fileInputBlock.classList.contains('hidden');
        const finalUrl = isFileMode ? uploadedImageData : pinUrlInput.value.trim();

        if (!finalUrl) {
            alert(isFileMode ? 'გთხოვთ ატვირთოთ ფოტო!' : 'გთხოვთ ჩაწეროთ ფოტოს ლინკი!');
            return;
        }

        const newPin = {
            id: (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)),
            title: document.getElementById('pin-title').value.trim(),
            album: document.getElementById('pin-album-select').value,
            url: finalUrl
        };


        const currentPins = JSON.parse(localStorage.getItem('user_created_pins')) || [];
        currentPins.unshift(newPin);

        try {
            localStorage.setItem('user_created_pins', JSON.stringify(currentPins));
        } catch (err) {
            alert('მეხსიერება გადავსებულია — ვერ ინახება ამდენი ფოტო. წაშალეთ ძველი ფოტოები და სცადეთ თავიდან.');
            return;
        }

        addPinForm.classList.add('hidden');
        const successBox = document.getElementById('success-box');
        if (successBox) successBox.classList.remove('hidden');

        uploadedImageData = null;
    });
}


// ====== 7. ძებნა (SEARCH ON ENTER) ======
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.toLowerCase().trim();
            if (query.length > 0) {
                fetchUnsplashPhotos(query);
            }
        }
    });
}
// ====== 8. Catalog Page ლოგიკა (დაამატეთ app.js-ის ბოლოს) ======
const catalogGrid = document.getElementById('catalog-grid');
const loader = document.getElementById('loader');

const fetchCatalogPhotos = async () => {
    if (!catalogGrid) return; // თუ ამ გვერდზე არ ვართ, კოდი არ შესრულდება

    try {
        const UNSPLASH_ACCESS_KEY = 'lENwE_BjCuPosRWzBCJa8Dr9HxIXj1qEIXUbht1KgGo';
        const response = await fetch(`https://api.unsplash.com/photos/random?query=trends&count=20&client_id=${UNSPLASH_ACCESS_KEY}`);
        
        const data = await response.json();
        
        // ლოუდერის დამალვა
        if (loader) loader.classList.add('hidden');
        catalogGrid.classList.remove('hidden');

        // ფოტოების რენდერი
        catalogGrid.innerHTML = '';
        data.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'pin-card';
            card.innerHTML = `
                <img src="${photo.urls.regular}" alt="Trend">
                <div class="pin-overlay"><h5>${photo.alt_description || "ტრენდული იდეა"}</h5></div>
            `;
            catalogGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching catalog:", error);
        if (loader) loader.innerHTML = '<p>სამწუხაროდ, მონაცემები ვერ ჩაიტვირთა.</p>';
    }
};

// გვერდის ჩატვირთვისას გამოძახება
if (window.location.pathname.includes('catalog.html')) {
    fetchCatalogPhotos();
}