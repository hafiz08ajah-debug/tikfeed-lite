// Setup Supabase Client
const SUPABASE_URL = 'https://vchoytldpoavasrs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Default Master Videos Data
const defaultVideos = [
  {
    id: 1,
    username: "ceopay_official",
    caption: "Website top up game otomatis termurah, tercepat & 100% amanah! Cek bio sekarang 🔥 #topupgame #ceopay #gaming",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    likes: 12400,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
    commentsCount: 3,
    commentsList: [
      { user: "gamer_pro", text: "Prosesnya beneran instan ga bang?" },
      { user: "ceopay_official", text: "Otomatis detik itu juga masuk bang!" },
      { user: "sultan_ml", text: "Mantap udh langganan disini 🔥" }
    ],
    music: "Suara Asli - @ceopay_official",
    category: "foryou"
  },
  {
    id: 2,
    username: "titl_sutera",
    caption: "Keseruan praktikum anak TITL SMK N 1 Sutera! Listrik itu seni bro ⚡ #smkn1sutera #titl #elektro #cinematic",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 24800,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
    commentsCount: 2,
    commentsList: [
      { user: "rudi_listrik", text: "Salam tenaga listrik! Mantap jiwaku" },
      { user: "anak_tkj", text: "Keren jurusannya dokumentasinya rapi" }
    ],
    music: "Dj Remix Slow Bass - Titl Squad",
    category: "foryou"
  },
  {
    id: 3,
    username: "gaming_nusantara",
    caption: "Mabar santai malam minggu push rank bersama bestie 😎 #mobilelegends #gaming #mabar",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    likes: 8900,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
    commentsCount: 1,
    commentsList: [
      { user: "fanny_main", text: "Ajak-ajak dong bro!" }
    ],
    music: "Original Sound - Gaming Indo",
    category: "following"
  }
];

let videosData = [];
let activeIndex = 0;
let swiperInstance = null;
let currentSelectedFileUrl = "";
let currentTab = "foryou";

// Load Videos (Supabase + LocalStorage Backup + Offline Ready)
async function loadVideos() {
  try {
    const { data, error } = await supabaseClient
      .from('videos')
      .select('*, comments(*)');

    if (error || !data || data.length === 0) {
      videosData = defaultVideos;
    } else {
      videosData = data.map(v => ({
        id: v.id,
        username: v.username || "user_tiktok",
        caption: v.caption || "",
        videoUrl: v.video_url,
        likes: v.likes || 0,
        isLiked: false,
        isSaved: false,
        isFollowed: false,
        commentsCount: v.comments ? v.comments.length : 0,
        commentsList: v.comments ? v.comments.map(c => ({ user: c.username, text: c.comment_text })) : [],
        music: v.music || "Suara Asli - " + (v.username || "user"),
        category: v.category || "foryou"
      }));
    }
  } catch (err) {
    videosData = defaultVideos;
  }

  // Load custom local uploads & comment persistence from localStorage
  const localUploaded = JSON.parse(localStorage.getItem('local_videos_v2')) || [];
  if (localUploaded.length > 0) {
    videosData = [...localUploaded, ...videosData];
  }

  videosData.forEach(item => {
    const localComments = JSON.parse(localStorage.getItem(`comments_v_${item.id}`)) || [];
    if (localComments.length > 0) {
      // Merge unique comments
      const existingTexts = new Set(item.commentsList.map(c => c.text));
      localComments.forEach(lc => {
        if (!existingTexts.has(lc.text)) {
          item.commentsList.push(lc);
        }
      });
      item.commentsCount = item.commentsList.length;
    }
  });

  renderFeed();
  initSwiperFeed();
}

// Render TikTok Feed berdasarkan Sisi 4 (Content Area)
function renderFeed() {
  const container = document.getElementById("videoContainer");
  if (!container) return;

  const filteredData = videosData.filter(item => {
    if (currentTab === 'following') {
      return item.isFollowed || item.username === 'ceopay_official';
    }
    return true; // foryou
  });

  if (filteredData.length === 0) {
    container.innerHTML = `
      <div class="swiper-slide relative w-full h-full bg-black flex flex-col items-center justify-center p-6 text-center">
        <p class="text-zinc-400 text-xs mb-3">Belum ada video di tab Mengikuti.</p>
        <button onclick="switchTab('foryou')" class="bg-pink-600 text-white font-bold text-xs px-4 py-2 rounded-full">Kembali ke Untuk Anda</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredData.map((item, index) => `
    <div class="swiper-slide relative w-full h-full bg-black select-none" data-id="${item.id}">
      
      <!-- Video Element -->
      <video loop playsinline webkit-playsinline muted class="feed-video" src="${item.videoUrl}"></video>
      
      <!-- Unmute Hint Banner -->
      <div onclick="toggleAudio(this)" class="unmute-hint absolute top-20 left-4 z-30 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-zinc-200 flex items-center gap-1.5 cursor-pointer shadow-md">
        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        <span>Ketuk layar untuk mengaktifkan suara</span>
      </div>

      <!-- Gradient Overlay Bawah -->
      <div class="absolute inset-0 gradient-bottom pointer-events-none"></div>

      <!-- SISI KIRI: Keterangan / Caption & Audio -->
      <div class="absolute bottom-20 left-3.5 z-20 max-w-[76%] text-left">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-bold text-sm drop-shadow-md tracking-wide">@${item.username}</span>
          ${item.username === 'ceopay_official' ? '<span class="bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Official</span>' : ''}
        </div>

        <p class="text-xs text-zinc-100 line-clamp-3 leading-snug drop-shadow mb-2.5 font-normal">${item.caption}</p>
        
        <div class="flex items-center gap-2 text-[11px] text-zinc-200">
          <svg class="w-3.5 h-3.5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <div class="overflow-hidden w-44 whitespace-nowrap">
            <p class="font-medium text-xs truncate">${item.music}</p>
          </div>
        </div>
      </div>

      <!-- SISI KANAN: Action Bar Interaktif -->
      <div class="absolute right-2 bottom-20 z-20 flex flex-col items-center gap-4">
        
        <!-- Avatar & Follow Button -->
        <div class="relative mb-1">
          <div class="w-10 h-10 rounded-full border-2 border-white/90 overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-xs shadow-md">
            ${item.username.charAt(0).toUpperCase()}
          </div>
          <button onclick="toggleFollowByDataId(${item.id})" class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 ${item.isFollowed ? 'bg-zinc-700 text-zinc-300' : 'bg-pink-600 text-white'} rounded-full text-[11px] font-extrabold flex items-center justify-center shadow">
            ${item.isFollowed ? '✓' : '+'}
          </button>
        </div>

        <!-- Tombol Suka / Like -->
        <button onclick="toggleLikeByDataId(${item.id})" class="flex flex-col items-center group">
          <div class="w-10 h-10 flex items-center justify-center transition-transform active:scale-125">
            <svg class="w-7 h-7 ${item.isLiked ? 'text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' : 'text-white drop-shadow'}" fill="${item.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">${formatCount(item.likes)}</span>
        </button>

        <!-- Tombol Komentar -->
        <button onclick="openCommentsByDataId(${item.id})" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center text-white transition-transform active:scale-110">
            <svg class="w-7 h-7 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">${formatCount(item.commentsCount)}</span>
        </button>

        <!-- Tombol Simpan / Bookmark -->
        <button onclick="toggleBookmarkByDataId(${item.id})" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center transition-transform active:scale-110">
            <svg class="w-6 h-6 ${item.isSaved ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'text-white drop-shadow'}" fill="${item.isSaved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">Simpan</span>
        </button>

        <!-- Tombol Bagikan / Share -->
        <button onclick="shareVideo('${item.caption}')" class="flex flex-col items-center">
          <div class="w-10 h-10 flex items-center justify-center text-white transition-transform active:scale-110">
            <svg class="w-6 h-6 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">Bagikan</span>
        </button>

        <!-- Piringan Vinil Musik Berputar -->
        <div class="mt-2 w-9 h-9 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-vinyl shadow-xl overflow-hidden">
          <div class="w-3.5 h-3.5 rounded-full bg-pink-600 border border-black flex items-center justify-center">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>

      </div>

    </div>
  `).join('');
}

// Inisialisasi Swiper Feed Vertikal
function initSwiperFeed() {
  if (swiperInstance) swiperInstance.destroy(true, true);

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

  // Tap to Pause/Play video pada area video
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'VIDEO' && e.target.classList.contains('feed-video')) {
      e.target.paused ? e.target.play() : e.target.pause();
    }
  });
}

function playVideoAt(index) {
  const videos = document.querySelectorAll('.feed-video');
  videos.forEach((v, idx) => {
    if (idx === index) {
      v.currentTime = 0;
      v.play().catch(e => console.log('Autoplay handled:', e));
    } else {
      v.pause();
    }
  });
}

function toggleAudio(btn) {
  const activeVideo = document.querySelectorAll('.feed-video')[activeIndex];
  if (activeVideo) {
    activeVideo.muted = !activeVideo.muted;
    btn.style.opacity = '0';
    setTimeout(() => btn.style.display = 'none', 300);
  }
}

// Tab Switching (Mengikuti / Untuk Anda)
function switchTab(tab) {
  currentTab = tab;
  const tabFollowing = document.getElementById("tabFollowing");
  const tabForyou = document.getElementById("tabForyou");

  if (tab === 'following') {
    tabFollowing.className = "text-white border-b-2 border-white pb-0.5 font-bold cursor-pointer drop-shadow";
    tabForyou.className = "text-white/60 cursor-pointer transition-colors hover:text-white pb-0.5";
  } else {
    tabForyou.className = "text-white border-b-2 border-white pb-0.5 font-bold cursor-pointer drop-shadow";
    tabFollowing.className = "text-white/60 cursor-pointer transition-colors hover:text-white pb-0.5";
  }

  renderFeed();
  initSwiperFeed();
}

// Navigasi Bawah
function setActiveNav(navName) {
  ['navHome', 'navFriends', 'navInbox', 'navProfile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = "flex flex-col items-center gap-1 text-zinc-400 transition-transform active:scale-95";
  });
  const activeEl = document.getElementById('nav' + navName.charAt(0).toUpperCase() + navName.slice(1));
  if (activeEl) activeEl.className = "flex flex-col items-center gap-1 text-white transition-transform active:scale-95";
}

// FUNGSI UTAMA TOMBOL '+': MEMBUKA GALERI / ALBUM BAWAAN HP
function openGallery() {
  const mediaInput = document.getElementById("mediaInput");
  if (mediaInput) {
    mediaInput.click();
  }
}

function openCameraOrLive() {
  alert("Mode Live & Creator Studio aktif! Anda juga dapat langsung menekan tombol '+' di bawah untuk memilih video/foto dari album HP.");
  openGallery();
}

// Menangani File yang Dipilih dari Galeri HP
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  currentSelectedFileUrl = URL.createObjectURL(file);

  const prevVideo = document.getElementById("previewVideo");
  const prevImage = document.getElementById("previewImage");
  const prevPlaceholder = document.getElementById("previewPlaceholder");

  prevPlaceholder.classList.add("hidden");

  if (file.type.startsWith("video/")) {
    prevVideo.src = currentSelectedFileUrl;
    prevVideo.classList.remove("hidden");
    prevImage.classList.add("hidden");
  } else if (file.type.startsWith("image/")) {
    prevImage.src = currentSelectedFileUrl;
    prevImage.classList.remove("hidden");
    prevVideo.classList.add("hidden");
  }

  toggleUploadModal(true);
}

function toggleUploadModal(show) {
  const modal = document.getElementById("uploadModal");
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

// Publikasi Video Baru ke Feed & LocalStorage
async function handleUploadMedia(event) {
  event.preventDefault();
  const username = document.getElementById("uploadUsername").value.trim() || "ceopay_official";
  const caption = document.getElementById("uploadCaption").value.trim();
  const music = document.getElementById("uploadMusic").value.trim() || "Suara Asli - @" + username;

  if (!currentSelectedFileUrl) {
    alert("Silakan pilih file video atau foto dari galeri HP Anda terlebih dahulu.");
    return;
  }

  const newVid = {
    id: Date.now(),
    username: username,
    caption: caption,
    videoUrl: currentSelectedFileUrl,
    likes: 1,
    isLiked: true,
    isSaved: false,
    isFollowed: true,
    commentsCount: 0,
    commentsList: [],
    music: music,
    category: "foryou"
  };

  videosData.unshift(newVid);

  // Simpan ke LocalStorage agar permanen di sesi device
  const localUploaded = JSON.parse(localStorage.getItem('local_videos_v2')) || [];
  localUploaded.unshift(newVid);
  localStorage.setItem('local_videos_v2', JSON.stringify(localUploaded));

  // Sync Supabase in background
  supabaseClient.from('videos').insert([{
    username: username,
    caption: caption,
    video_url: currentSelectedFileUrl,
    music: music,
    likes: 1,
    category: "foryou"
  }]).catch(() => {});

  toggleUploadModal(false);
  renderFeed();
  initSwiperFeed();
  
  // Reset input
  document.getElementById("mediaInput").value = "";
  alert("Konten berhasil diunggah dan langsung masuk ke Feed TikTok Lite!");
}

// Interaksi Berdasarkan ID Data (Anti-Bug Index)
function toggleLikeByDataId(id) {
  const item = videosData.find(v => v.id === id);
  if (!item) return;
  item.isLiked = !item.isLiked;
  item.likes += item.isLiked ? 1 : -1;
  renderFeed();
  if (swiperInstance) swiperInstance.update();
}

function toggleBookmarkByDataId(id) {
  const item = videosData.find(v => v.id === id);
  if (!item) return;
  item.isSaved = !item.isSaved;
  renderFeed();
}

function toggleFollowByDataId(id) {
  const item = videosData.find(v => v.id === id);
  if (!item) return;
  item.isFollowed = !item.isFollowed;
  renderFeed();
}

let activeCommentVideoId = null;

function openCommentsByDataId(id) {
  activeCommentVideoId = id;
  const item = videosData.find(v => v.id === id);
  if (!item) return;

  const modal = document.getElementById("commentModal");
  const list = document.getElementById("commentList");
  const header = document.getElementById("commentCountHeader");

  header.innerText = `${item.commentsCount} Komentar`;

  if (!item.commentsList || item.commentsList.length === 0) {
    list.innerHTML = `<p class="text-center text-xs text-zinc-500 py-10">Belum ada komentar. Jadilah yang pertama!</p>`;
  } else {
    list.innerHTML = item.commentsList.map(c => `
      <div class="flex gap-3 items-start text-xs">
        <div class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white shrink-0 text-[10px]">
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
  if (!text || !activeCommentVideoId) return;

  const item = videosData.find(v => v.id === activeCommentVideoId);
  if (!item) return;

  const newC = { user: 'ceopay_official', text: text };
  item.commentsList.push(newC);
  item.commentsCount = item.commentsList.length;

  // Simpan ke LocalStorage komentar per video
  localStorage.setItem(`comments_v_${item.id}`, JSON.stringify(item.commentsList));

  input.value = "";
  openCommentsByDataId(activeCommentVideoId);
  renderFeed();
}

// Modal Profil
function toggleProfileModal(show) {
  const modal = document.getElementById("profileModal");
  if (show) {
    const grid = document.getElementById("profileGrid");
    const userVideos = videosData.filter(v => v.username === 'ceopay_official');
    document.getElementById("userVideoCount").innerText = `${userVideos.length} video`;

    if (userVideos.length === 0) {
      grid.innerHTML = `<div class="col-span-3 text-center text-xs text-zinc-500 py-12">Belum ada video yang diunggah. Ketuk tombol + untuk mulai!</div>`;
    } else {
      grid.innerHTML = userVideos.map(v => `
        <div onclick="playVideoFromProfile(${v.id})" class="relative aspect-[3/4] bg-zinc-900 overflow-hidden cursor-pointer border border-zinc-950 group">
          <video src="${v.videoUrl}" class="w-full h-full object-cover"></video>
          <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow bg-black/40 px-1.5 py-0.5 rounded">
            ▶ ${formatCount(v.likes)}
          </div>
        </div>
      `).join('');
    }
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

function playVideoFromProfile(id) {
  toggleProfileModal(false);
  setActiveNav('home');
  const index = videosData.findIndex(v => v.id === id);
  if (index !== -1 && swiperInstance) {
    swiperInstance.slideTo(index);
  }
}

// Modal Pencarian
function toggleSearchModal(show) {
  const modal = document.getElementById("searchModal");
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
  if (show) setTimeout(() => document.getElementById("searchInput").focus(), 100);
}

function handleSearch(query) {
  const resultsContainer = document.getElementById("searchResults");
  const q = query.toLowerCase().trim();

  if (!q) {
    resultsContainer.innerHTML = `<p class="text-center text-xs text-zinc-500 py-12">Ketik kata kunci untuk mencari video atau kreator...</p>`;
    return;
  }

  const filtered = videosData.filter(v => 
    v.caption.toLowerCase().includes(q) || 
    v.username.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `<p class="text-center text-xs text-zinc-500 py-12">Tidak ditemukan video yang cocok dengan "${q}".</p>`;
    return;
  }

  resultsContainer.innerHTML = filtered.map(v => `
    <div onclick="selectSearchResult(${v.id})" class="flex gap-3 bg-zinc-900/90 p-2.5 rounded-xl items-center cursor-pointer border border-zinc-800 active:scale-98 transition-transform">
      <div class="w-12 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-zinc-800">
        <video src="${v.videoUrl}" class="w-full h-full object-cover"></video>
      </div>
      <div class="flex-1 overflow-hidden">
        <h4 class="text-xs font-bold text-white flex items-center gap-1">@${v.username}</h4>
        <p class="text-[11px] text-zinc-400 truncate mt-0.5">${v.caption}</p>
      </div>
    </div>
  `).join('');
}

function selectSearchResult(id) {
  toggleSearchModal(false);
  setActiveNav('home');
  const index = videosData.findIndex(v => v.id === id);
  if (index !== -1 && swiperInstance) {
    swiperInstance.slideTo(index);
  }
}

function toggleInboxModal(show, title = 'Kotak Masuk') {
  const modal = document.getElementById("inboxModal");
  document.getElementById("inboxTitle").innerText = title;
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

function shareVideo(caption) {
  if (navigator.share) {
    navigator.share({ title: 'TikTok Lite', text: caption, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Tautan video berhasil disalin ke clipboard!");
  }
}

function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

// Inisialisasi saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  loadVideos();
});
