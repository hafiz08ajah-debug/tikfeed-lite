// 1. Setup Supabase Client
const SUPABASE_URL = 'https://vchoytldpoavasrs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Data Cadangan (Pencegah Layar Blank Jika Supabase Kosong atau Belum Ada Video)
const backupVideos = [
  {
    id: 1,
    username: "titl_sutera",
    caption: "Cinematic Jurusan TITL SMK N 1 Sutera! 🔥 Keren parah bro #smkn1sutera #titl #cinematic",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tokyo-street-at-night-42867-large.mp4",
    likes: 15400,
    isLiked: false,
    isSaved: false,
    commentsCount: 128,
    commentsList: [
      { user: "rudi_listrik", text: "Mantap bang anak TITL nih! 🔥" },
      { user: "sari_designer", text: "Cinematic-nya dapet banget bang!" }
    ],
    music: "Suara Asli - @titl_sutera"
  },
  {
    id: 2,
    username: "ceopay_official",
    caption: "Website top up game otomatis murah & amanah! Cek link bio 🔥 #topupgame #ceopay",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    likes: 8900,
    isLiked: false,
    isSaved: false,
    commentsCount: 45,
    commentsList: [
      { user: "gamer_pro", text: "Proses cepat ga bang?" },
      { user: "ceopay_official", text: "@gamer_pro Otomatis detik itu juga!" }
    ],
    music: "Musik Populer - Ceopay Sound"
  }
];

let videosData = [];
let activeIndex = 0;
let swiperInstance = null;

// 2. Ambil Data Video dari Supabase Database
async function loadVideos() {
  try {
    const { data, error } = await supabaseClient
      .from('videos')
      .select('*, comments(*)');

    if (error || !data || data.length === 0) {
      console.warn('Menggunakan data cadangan karena Supabase kosong/error:', error);
      videosData = backupVideos;
    } else {
      videosData = data.map(v => ({
        id: v.id,
        username: v.username || "user_tiktok",
        caption: v.caption || "",
        videoUrl: v.video_url,
        likes: v.likes || 0,
        isLiked: false,
        isSaved: false,
        commentsCount: v.comments ? v.comments.length : 0,
        commentsList: v.comments ? v.comments.map(c => ({ user: c.username, text: c.comment_text })) : [],
        music: v.music || "Suara Asli - " + (v.username || "user")
      }));
    }
  } catch (err) {
    console.error('Fetch error:', err);
    videosData = backupVideos;
  }

  renderFeed();
  initSwiperFeed();
}

// 3. Render Tampilan TikTok 95% Presisi
function renderFeed() {
  const container = document.getElementById("videoContainer");
  if (!container) return;

  container.innerHTML = videosData.map((item, index) => `
    <div class="swiper-slide relative w-full h-full bg-black select-none">
      
      <!-- Video Element -->
      <video loop playsinline preload="metadata" class="feed-video" src="${item.videoUrl}"></video>
      
      <!-- Gradient Overlay TikTok -->
      <div class="absolute inset-0 gradient-overlay pointer-events-none"></div>

      <!-- BOTTOM LEFT: User Info, Caption & Music -->
      <div class="absolute bottom-16 left-3 z-20 max-w-[75%] text-left">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-bold text-sm drop-shadow">@${item.username}</span>
        </div>

        <p class="text-xs text-zinc-100 line-clamp-2 leading-snug drop-shadow-sm mb-2">${item.caption}</p>
        
        <!-- Moving Music Text -->
        <div class="flex items-center gap-2 text-[11px] text-zinc-200">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <div class="overflow-hidden w-40 whitespace-nowrap">
            <p class="font-medium text-xs truncate">${item.music}</p>
          </div>
        </div>
      </div>

      <!-- RIGHT SIDE: ACTION BUTTONS TIKTOK -->
      <div class="absolute right-2 bottom-16 z-20 flex flex-col items-center gap-4">
        
        <!-- Avatar + Follow Button -->
        <div class="relative mb-2">
          <div class="w-11 h-11 rounded-full border border-white overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-sm">
            ${item.username.charAt(0).toUpperCase()}
          </div>
          <button onclick="toggleFollow(this)" class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full text-white text-xs font-bold flex items-center justify-center shadow">+</button>
        </div>

        <!-- Like Button -->
        <button onclick="toggleLike(${index})" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center text-2xl transition-transform active:scale-125">
            <svg class="w-8 h-8 ${item.isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'}" fill="${item.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <span class="text-[11px] font-bold mt-0.5 drop-shadow">${formatCount(item.likes)}</span>
        </button>

        <!-- Comment Button -->
        <button onclick="openComments(${index})" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center text-white">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          </div>
          <span class="text-[11px] font-bold mt-0.5 drop-shadow">${formatCount(item.commentsCount)}</span>
        </button>

        <!-- Bookmark / Save Button -->
        <button onclick="toggleBookmark(${index})" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center">
            <svg class="w-7 h-7 ${item.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}" fill="${item.isSaved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </div>
          <span class="text-[11px] font-bold mt-0.5 drop-shadow">Simpan</span>
        </button>

        <!-- Share Button -->
        <button onclick="shareVideo('${item.caption}')" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center text-white">
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          </div>
          <span class="text-[11px] font-bold mt-0.5 drop-shadow">Bagikan</span>
        </button>

        <!-- Vinyl Disk Spinning TikTok -->
        <div class="mt-2 w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-vinyl shadow-lg overflow-hidden">
          <div class="w-4 h-4 rounded-full bg-pink-600 border border-black flex items-center justify-center">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>

      </div>

    </div>
  `).join('');
}

// 4. Inisialisasi Swiper Slider Vertical
function initSwiperFeed() {
  swiperInstance = new Swiper('.mySwiper', {
    direction: 'vertical',
    mousewheel: true,
    touchReleaseOnEdges: true,
    on: {
      init: function () {
        playVideoAt(this.activeIndex);
      },
      slideChange: function () {
        activeIndex = this.activeIndex;
        playVideoAt(this.activeIndex);
      }
    }
  });

  // Tap layar untuk Play / Pause Video
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'VIDEO') {
      e.target.paused ? e.target.play() : e.target.pause();
    }
  });
}

function playVideoAt(index) {
  const videos = document.querySelectorAll('.feed-video');
  videos.forEach((v, idx) => {
    if (idx === index) {
      v.currentTime = 0;
      v.play().catch(e => console.log('Autoplay:', e));
    } else {
      v.pause();
    }
  });
}

// 5. Fitur Like (Terkoneksi ke Supabase)
async function toggleLike(index) {
  const item = videosData[index];
  item.isLiked = !item.isLiked;
  item.likes += item.isLiked ? 1 : -1;

  renderFeed();
  if (swiperInstance) swiperInstance.update();

  if (item.id && typeof item.id === 'number') {
    await supabaseClient
      .from('videos')
      .update({ likes: item.likes })
      .eq('id', item.id);
  }
}

// Fitur Bookmark
function toggleBookmark(index) {
  const item = videosData[index];
  item.isSaved = !item.isSaved;
  renderFeed();
}

// Fitur Follow
function toggleFollow(btn) {
  btn.style.display = 'none';
}

// 6. Modal & Fitur Komentar (Terkoneksi ke Supabase)
function openComments(index) {
  activeIndex = index;
  const modal = document.getElementById("commentModal");
  const list = document.getElementById("commentList");
  const header = document.getElementById("commentCountHeader");

  const item = videosData[index];
  header.innerText = `${item.commentsCount} Komentar`;

  if (item.commentsList.length === 0) {
    list.innerHTML = `<p class="text-center text-xs text-zinc-500 py-8">Belum ada komentar. Jadilah yang pertama!</p>`;
  } else {
    list.innerHTML = item.commentsList.map(c => `
      <div class="flex gap-3 items-start text-xs">
        <div class="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white shrink-0">
          ${c.user.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1">
          <span class="font-bold text-zinc-400">@${c.user}</span>
          <p class="text-zinc-100 mt-0.5 leading-relaxed">${c.text}</p>
        </div>
      </div>
    `).join('');
  }

  modal.classList.remove("hidden");
}

function toggleComments(show) {
  const modal = document.getElementById("commentModal");
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

async function addComment(event) {
  event.preventDefault();
  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) return;

  const currentItem = videosData[activeIndex];

  if (currentItem.id) {
    await supabaseClient
      .from('comments')
      .insert([{ video_id: currentItem.id, username: 'user_kamu', comment_text: text }]);
  }

  currentItem.commentsList.push({ user: 'user_kamu', text: text });
  currentItem.commentsCount += 1;
  input.value = "";
  openComments(activeIndex);
  renderFeed();
}

function shareVideo(caption) {
  if (navigator.share) {
    navigator.share({ title: 'TikTok Lite', text: caption, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Tautan berhasil disalin!");
  }
}

function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

// Inisialisasi Aplikasi Saat Ditinggal Load
document.addEventListener("DOMContentLoaded", () => {
  loadVideos();
});
