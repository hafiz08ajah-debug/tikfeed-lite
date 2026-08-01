// ==========================================
// 1. KONFIGURASI SUPABASE
// ==========================================
// MASUKIN URL PROJECT SUPABASE LU DI BAWAH INI (Contoh: 'https://xyz.supabase.co')
const supabaseUrl = 'MASUKKAN_URL_PROJECT_SUPABASE_LU_DISINI'; 

// Key publishable milik lu yang sudah diinput:
const supabaseKey = 'sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5'; 

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const feedContainer = document.getElementById('feed-container');
let globalMuted = true;

// ==========================================
// 2. FETCH DATA VIDEO DARI DATABASE SUPABASE
// ==========================================
async function fetchFeed() {
    feedContainer.innerHTML = '<div style="text-align:center; padding-top: 50vh; color: #888;">Memuat Tikfeed_lite...</div>';

    let { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Gagal mengambil data:", error);
        feedContainer.innerHTML = '<div style="text-align:center; padding-top: 50vh;">Gagal koneksi ke database.<br>Cek Supabase URL & Key lu.</div>';
        return;
    }

    if (!videos || videos.length === 0) {
        feedContainer.innerHTML = '<div style="text-align:center; padding-top: 50vh;">Belum ada video.<br>Klik tombol + Create di bawah!</div>';
        return;
    }

    renderFeed(videos);
}

// ==========================================
// 3. RENDER UI TIKTOK FEED
// ==========================================
function renderFeed(videos) {
    feedContainer.innerHTML = ''; 

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';

        card.innerHTML = `
            <video src="${video.url}" loop playsinline muted></video>
            <div class="sound-toggle" onclick="toggleSound(this)">🔇 Mute</div>
            
            <div class="overlay">
                <div class="user-info">
                    <div class="username">@${video.username || 'user'}</div>
                    <div class="caption">${video.description || ''}</div>
                </div>
                <div class="action-bar">
                    <button class="btn-action" onclick="likeVideo(${video.id}, this)">
                        ❤️ <span class="like-count">${video.likes || 0}</span>
                    </button>
                    <button class="btn-action" onclick="alert('Fitur Komentar Aktif!')">
                        💬 <span>0</span>
                    </button>
                    <button class="btn-action" onclick="shareVideo('${video.url}')">
                        🔗 <span>Bagikan</span>
                    </button>
                </div>
            </div>
        `;

        const videoElement = card.querySelector('video');

        // Klik 1x buat Pause/Play
        videoElement.addEventListener('click', (e) => {
            if (videoElement.paused) videoElement.play();
            else videoElement.pause();
        });

        // Double Click buat Efek Like (Love Animasi)
        videoElement.addEventListener('dblclick', (e) => {
            createHeartAnimation(e, card);
            const likeBtn = card.querySelector('.btn-action');
            likeVideo(video.id, likeBtn);
        });

        feedContainer.appendChild(card);
    });

    initAutoplayObserver();
}

// ==========================================
// 4. AUTOPLAY OBSERVER (Sama kayak TikTok)
// ==========================================
function initAutoplayObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('video').forEach(vid => observer.observe(vid));
}

// ==========================================
// 5. FITUR SUARA (Mute / Unmute)
// ==========================================
function toggleSound(btnElement) {
    globalMuted = !globalMuted;
    document.querySelectorAll('video').forEach(vid => vid.muted = globalMuted);
    
    document.querySelectorAll('.sound-toggle').forEach(el => {
        el.innerText = globalMuted ? '🔇 Mute' : '🔊 Sound On';
    });
}

// ==========================================
// 6. FITUR ANIMASI DOUBLE TAP LIKE
// ==========================================
function createHeartAnimation(e, card) {
    const heart = document.createElement('div');
    heart.className = 'heart-pop';
    heart.innerHTML = '❤️';
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    card.appendChild(heart);

    setTimeout(() => heart.remove(), 800);
}

// ==========================================
// 7. FITUR LIKE DATABASE REALTIME
// ==========================================
async function likeVideo(videoId, btn) {
    const countSpan = btn.querySelector('.like-count');
    let currentLikes = parseInt(countSpan.innerText) + 1;
    
    countSpan.innerText = currentLikes;
    btn.classList.add('liked');

    await supabase
        .from('videos')
        .update({ likes: currentLikes })
        .eq('id', videoId);
}

// ==========================================
// 8. FITUR SHARE LINK
// ==========================================
function shareVideo(url) {
    navigator.clipboard.writeText(url);
    alert('Link video disalin ke clipboard!');
}

// ==========================================
// 9. FITUR UPLOAD VIDEO KE SUPABASE
// ==========================================
function openUploadModal() { document.getElementById('uploadModal').style.display = 'flex'; }
function closeUploadModal() { document.getElementById('uploadModal').style.display = 'none'; }

async function handleUpload() {
    const username = document.getElementById('inputUsername').value.trim();
    const caption = document.getElementById('inputCaption').value.trim();
    const fileInput = document.getElementById('inputFile');
    const file = fileInput.files[0];

    if (!username || !file) {
        alert("Username dan file video wajib dipilih!");
        return;
    }

    alert("Sedang mengunggah video ke Supabase...");

    try {
        const fileName = `${Date.now()}_${file.name}`;
        
        // Upload ke Storage Bucket
        const { data: storageData, error: storageError } = await supabase.storage
            .from('tikfeed_videos')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // Ambil URL Publik Video
        const { data: publicUrlData } = supabase.storage
            .from('tikfeed_videos')
            .getPublicUrl(fileName);

        const videoPublicUrl = publicUrlData.publicUrl;

        // Insert ke Tabel
        const { error: dbError } = await supabase
            .from('videos')
            .insert([{
                username: username,
                description: caption,
                url: videoPublicUrl,
                likes: 0
            }]);

        if (dbError) throw dbError;

        alert("Video berhasil di-publish!");
        closeUploadModal();
        fetchFeed();

    } catch (err) {
        console.error("Upload error:", err);
        alert("Gagal upload: " + err.message);
    }
}

// Buka Feed Pertama Kali
fetchFeed();
