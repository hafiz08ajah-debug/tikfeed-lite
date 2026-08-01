// 1. Konfigurasi Supabase
// Pastikan ganti SUPABASE_URL dengan URL project Supabase milikmu (contoh: https://xyz.supabase.co)
const SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data Cadangan (Fallback Data) jika Supabase belum diisi atau gagal dimuat
const fallbackVideos = [
    {
        id: "1",
        username: "@kreatorfavorit",
        caption: "Menikmati pemandangan alam indah hari ini! 🌿 #nature #vibes",
        music: "Suara Asli - Musik Santai",
        profile_pic: "https://picsum.photos/100/100?random=1",
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
        likes: 1240,
        comments: 89
    },
    {
        id: "2",
        username: "@codinglife",
        caption: "Bikin TikTok Clone dengan JavaScript & Supabase! 🚀 #coding #developer",
        music: "Coding Ambient Beats",
        profile_pic: "https://picsum.photos/100/100?random=2",
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41525-large.mp4",
        likes: 3500,
        comments: 210
    }
];

const videoFeed = document.getElementById("videoFeed");

// 2. Fungsi Mengambil Data Video
async function fetchVideos() {
    try {
        // Mengambil data dari tabel 'videos' di Supabase
        let { data: videos, error } = await supabase
            .from('videos')
            .select('*');

        if (error || !videos || videos.length === 0) {
            console.warn("Menggunakan data cadangan (Supabase belum terisi atau terjadi error):", error);
            renderVideos(fallbackVideos);
        } else {
            renderVideos(videos);
        }
    } catch (err) {
        console.error("Gagal terhubung ke Supabase:", err);
        renderVideos(fallbackVideos);
    }
}

// 3. Render Elemen Video ke DOM
function renderVideos(videos) {
    videoFeed.innerHTML = "";

    videos.forEach((video) => {
        const videoCard = document.createElement("div");
        videoCard.className = "video-card";

        videoCard.innerHTML = `
            <video loop playsinline src="${video.video_url}"></video>
            
            <div class="action-sidebar">
                <img src="${video.profile_pic}" class="profile-icon" alt="Profile">
                
                <div class="action-btn" onclick="toggleLike(this, '${video.id}', ${video.likes})">
                    <i class="fa-solid fa-heart"></i>
                    <span class="like-count">${video.likes}</span>
                </div>
                
                <div class="action-btn">
                    <i class="fa-solid fa-comment-dots"></i>
                    <span>${video.comments || 0}</span>
                </div>

                <div class="action-btn">
                    <i class="fa-solid fa-bookmark"></i>
                    <span>Save</span>
                </div>
                
                <div class="action-btn">
                    <i class="fa-solid fa-share"></i>
                    <span>Share</span>
                </div>
            </div>

            <div class="video-info">
                <div class="username">${video.username}</div>
                <div class="caption">${video.caption}</div>
                <div class="music">
                    <i class="fa-solid fa-music"></i>
                    <span>${video.music}</span>
                </div>
            </div>
        `;

        videoFeed.appendChild(videoCard);
    });

    setupIntersectionObserver();
}

// 4. Autoplay & Pause Menggunakan Intersection Observer (Sesuai Scroll)
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target.querySelector("video");
            if (entry.isIntersecting) {
                video.play().catch(e => console.log("Autoplay dicegah oleh browser:", e));
            } else {
                video.pause();
                video.currentTime = 0; // Reset ke awal jika tidak terlihat
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll(".video-card").forEach((card) => {
        observer.observe(card);
    });
}

// 5. Fungsi Interaksi Like (Mengirim Update ke Supabase)
async function toggleLike(element, videoId, currentLikes) {
    const icon = element.querySelector("i");
    const countSpan = element.querySelector(".like-count");
    const isLiked = icon.classList.contains("liked");

    let newCount = isLiked ? currentLikes : currentLikes + 1;
    
    // UI Update langsung (Optimistic Update)
    icon.classList.toggle("liked");
    countSpan.textContent = newCount;

    // Update Data ke Supabase
    try {
        const { error } = await supabase
            .from('videos')
            .update({ likes: newCount })
            .eq('id', videoId);

        if (error) {
            console.error("Gagal mengupdate likes ke Supabase:", error);
        }
    } catch (err) {
        console.error("Error saat update database:", err);
    }
}

// Jalankan aplikasi saat dokumen selesai dimuat
document.addEventListener("DOMContentLoaded", fetchVideos);
