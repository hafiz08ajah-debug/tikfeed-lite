// Setup Supabase
const SUPABASE_URL = 'https://vchoytldpoavasrs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Data Cadangan Default
const backupVideos = [
  {
    id: 1,
    username: "ceopay_official",
    caption: "Website top up game otomatis murah & amanah! Cek link bio 🔥 #topupgame #ceopay",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    likes: 8900,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
    commentsCount: 2,
    commentsList: [
      { user: "gamer_pro", text: "Proses cepat ga bang?" },
      { user: "ceopay_official", text: "Otomatis detik itu juga bang!" }
    ],
    music: "Suara Asli - @ceopay_official"
  },
  {
    id: 2,
    username: "titl_sutera",
    caption: "Cinematic Jurusan TITL SMK N 1 Sutera! Keren parah 🔥 #smkn1sutera #titl #cinematic",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 15400,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
    commentsCount: 1,
    commentsList: [
      { user: "rudi_listrik", text: "Mantap anak TITL!" }
    ],
    music: "Suara Asli - @titl_sutera"
  }
];

let videosData = [];
let activeIndex = 0;
let swiperInstance = null;

// Ambil Data & Gabung Komentar Lokal
async function loadVideos() {
  try {
    const { data, error } = await supabaseClient
      .from('videos')
      .select('*, comments(*)');

    if (error || !data || data.length === 0) {
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
        isFollowed: false,
        commentsCount: v.comments ? v.comments.length : 0,
        commentsList: v.comments ? v.comments.map(c => ({ user: c.username, text: c.comment_text })) : [],
        music: v.music || "Suara Asli - " + (v.username || "user")
      }));
    }
  } catch (err) {
    videosData = backupVideos;
  }

  // Synchronize Local Comments
  videosData.forEach(item => {
    const localComments = JSON.parse(localStorage.getItem(`comments_v_${item.id}`)) || [];
    if (localComments.length > 0) {
      item.commentsList = [...item.commentsList, ...localComments];
      item.commentsCount = item.commentsList.length;
    }
  });

  renderFeed();
  initSwiperFeed();
}

// Render Main TikTok Feed
function renderFeed() {
  const container = document.getElementById("videoContainer");
  if (!container) return;

  container.innerHTML = videosData.map((item, index) => `
    <div class="swiper-slide relative w-full h-full bg-black select-none">
      
      <!-- Video Element -->
      <video loop playsinline webkit-playsinline muted class="feed-video" src="${item.videoUrl}"></video>
      
      <!-- Unmute Hint -->
      <div onclick="toggleAudio(this)" class="unmute-hint absolute top-20 left-4 z-30 bg-black/60 px-3 py-1 rounded-full text-[10px] text-zinc-300 flex items-center gap-1.5 cursor-pointer">
        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        <span>Ketuk layar untuk suara</span>
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 gradient-overlay pointer-events-none"></div>

      <!-- Bottom Info -->
      <div class="absolute bottom-20 left-3 z-20 max-w-[75%] text-left">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="font-bold text-sm drop-shadow">@${item.username}</span>
        </div>

        <p class="text-xs text-zinc-100 line-clamp-2 leading-snug drop-shadow-sm mb-2">${item.caption}</p>
        
        <div class="flex items-center gap-2 text-[11px] text-zinc-200">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <div class="overflow-hidden w-40 whitespace-nowrap">
            <p class="font-medium text-xs truncate">${item.music}</p>
          </div>
        </div>
      </div>

      <!-- Right Action Sidebar -->
      <div class="absolute right-2 bottom-20 z-20 flex flex-col items-center gap-4">
        
        <!-- Profile Avatar & Follow Button -->
        <div class="relative mb-1">
          <div class="w-10 h-10 rounded-full border border-white overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-xs">
            ${item.username.charAt(0).toUpperCase()}
          </div>
          <button onclick="toggleFollow(${index})" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 ${item.isFollowed ? 'bg-zinc-700 text-zinc-300' : 'bg-pink-500 text-white'} rounded-full text-[10px] font-bold flex items-center justify-center">
            ${item.isFollowed ? '✓' : '+'}
          </button>
        </div>

        <!-- Like Button -->
        <button onclick="toggleLike(${index})" class="flex flex-col items-center">
          <div class="w-9 h-9 flex items-center justify-center transition-transform active:scale-125">
            <svg class="w-7 h-7 ${item.isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'}" fill="${item.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">${formatCount(item.likes)}</span>
        </button>

        <!-- Comment Button -->
        <button onclick="openComments(${index})" class="flex flex-col items-center">
          <div class="w-9 h-9 flex items-center justify-center text-white">
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">${formatCount(item.commentsCount)}</span>
        </button>

        <!-- Bookmark Button -->
        <button onclick="toggleBookmark(${index})" class="flex flex-col items-center">
          <div class="w-9 h-9 flex items-center justify-center">
            <svg class="w-6 h-6 ${item.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}" fill="${item.isSaved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">Simpan</span>
        </button>

        <!-- Share Button -->
        <button onclick="shareVideo('${item.caption}')" class="flex flex-col items-center">
          <div class="w-9 h-9 flex items-center justify-center text-white">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          </div>
          <span class="text-[10px] font-bold mt-0.5 drop-shadow">Bagikan</span>
        </button>

        <!-- Vinyl Disk -->
        <div class="mt-1 w-9 h-9 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-vinyl shadow-lg overflow-hidden">
          <div class="w-3.5 h-3.5 rounded-full bg-pink-600 border border-black flex items-center justify-center">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>

      </div>

    </div>
  `).join('');
}

// Inisialisasi Swiper Vertical
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
      v.play().catch(e => console.log('Autoplay Error:', e));
    } else {
      v.pause();
    }
  });
}

function toggleAudio(btn) {
  const activeVideo = document.querySelectorAll('.feed-video')[activeIndex];
  if (activeVideo) {
    activeVideo.muted = !activeVideo.muted;
    btn.style.display = 'none';
  }
}

// Fitur Like, Save, Follow
async function toggleLike(index) {
  const item = videosData[index];
  item.isLiked = !item.isLiked;
  item.likes += item.isLiked ? 1 : -1;

  renderFeed();
  if (swiperInstance) swiperInstance.update();

  if (item.id) {
    await supabaseClient.from('videos').update({ likes: item.likes }).eq('id', item.id);
  }
}

function toggleBookmark(index) {
  const item = videosData[index];
  item.isSaved = !item.isSaved;
  renderFeed();
}

function toggleFollow(index) {
  const item = videosData[index];
  item.isFollowed = !item.isFollowed;
  renderFeed();
}

// Fitur Modal Komentar
function openComments(index) {
  activeIndex = index;
  const modal = document.getElementById("commentModal");
  const list = document.getElementById("commentList");
  const header = document.getElementById("commentCountHeader");

  const item = videosData[index];
  header.innerText = `${item.commentsCount} Komentar`;

  if (!item.commentsList || item.commentsList.length === 0) {
    list.innerHTML = `<p class="text-center text-xs text-zinc-500 py-8">Belum ada komentar. Jadilah yang pertama!</p>`;
  } else {
    list.innerHTML = item.commentsList.map(c => `
      <div class="flex gap-3 items-start text-xs">
        <div class="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white shrink-0 text-[10px]">
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
  const newComment = { user: 'kamu', text: text };

  // LocalStorage Sync
  const existingLocal = JSON.parse(localStorage.getItem(`comments_v_${currentItem.id}`)) || [];
  existingLocal.push(newComment);
  localStorage.setItem(`comments_v_${currentItem.id}`, JSON.stringify(existingLocal));

  // Supabase Insert
  if (currentItem.id) {
    supabaseClient
      .from('comments')
      .insert([{ video_id: currentItem.id, username: 'kamu', comment_text: text }])
      .then(() => {})
      .catch(err => console.log(err));
  }

  currentItem.commentsList.push(newComment);
  currentItem.commentsCount += 1;
  input.value = "";
  openComments(activeIndex);
  renderFeed();
}

// FITUR UPLOAD VIDEO BARU (Tombol +)
function toggleUploadModal(show) {
  const modal = document.getElementById("uploadModal");
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

async function handleUploadVideo(event) {
  event.preventDefault();
  const url = document.getElementById("uploadUrl").value.trim();
  const username = document.getElementById("uploadUsername").value.trim() || "ceopay_official";
  const caption = document.getElementById("uploadCaption").value.trim();
  const music = document.getElementById("uploadMusic").value.trim() || "Suara Asli - @" + username;

  const newVideoData = {
    username: username,
    caption: caption,
    video_url: url,
    music: music,
    likes: 0
  };

  // Simpan ke Supabase
  const { data, error } = await supabaseClient.from('videos').insert([newVideoData]).select();

  const createdItem = {
    id: data && data[0] ? data[0].id : Date.now(),
    username: username,
    caption: caption,
    videoUrl: url,
    likes: 0,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
    commentsCount: 0,
    commentsList: [],
    music: music
  };

  videosData.unshift(createdItem); // Tambahkan ke paling atas feed
  toggleUploadModal(false);
  renderFeed();
  initSwiperFeed();
  alert("Video berhasil diposting!");
}

// FITUR MODAL PROFIL USER
function toggleProfileModal(show) {
  const modal = document.getElementById("profileModal");
  if (show) {
    const grid = document.getElementById("profileGrid");
    grid.innerHTML = videosData.map((v, i) => `
      <div onclick="playSelectedProfileVideo(${i})" class="relative aspect-[3/4] bg-zinc-800 overflow-hidden cursor-pointer border border-zinc-900">
        <video src="${v.videoUrl}" class="w-full h-full object-cover"></video>
        <div class="absolute bottom-1 left-1 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow">
          ▶ ${formatCount(v.likes)}
        </div>
      </div>
    `).join('');
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

function playSelectedProfileVideo(index) {
  toggleProfileModal(false);
  swiperInstance.slideTo(index);
}

// FITUR SEARCH / PENCARIAN
function toggleSearchModal(show) {
  const modal = document.getElementById("searchModal");
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

function handleSearch(query) {
  const resultsContainer = document.getElementById("searchResults");
  const q = query.toLowerCase().trim();

  if (!q) {
    resultsContainer.innerHTML = `<p class="text-center text-xs text-zinc-500 py-10">Ketik kata kunci untuk mencari video...</p>`;
    return;
  }

  const filtered = videosData.filter(v => 
    v.caption.toLowerCase().includes(q) || 
    v.username.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `<p class="text-center text-xs text-zinc-500 py-10">Tidak ada video yang cocok.</p>`;
    return;
  }

  resultsContainer.innerHTML = filtered.map(v => `
    <div onclick="selectSearchResult(${v.id})" class="flex gap-3 bg-zinc-900 p-2 rounded-lg items-center cursor-pointer border border-zinc-800">
      <div class="w-12 h-16 bg-black rounded overflow-hidden shrink-0">
        <video src="${v.videoUrl}" class="w-full h-full object-cover"></video>
      </div>
      <div class="flex-1 overflow-hidden">
        <h4 class="text-xs font-bold text-white">@${v.username}</h4>
        <p class="text-[11px] text-zinc-400 truncate mt-0.5">${v.caption}</p>
      </div>
    </div>
  `).join('');
}

function selectSearchResult(id) {
  const index = videosData.findIndex(v => v.id === id);
  toggleSearchModal(false);
  if (index !== -1 && swiperInstance) {
    swiperInstance.slideTo(index);
  }
}

// FITUR INBOX & TEMAN
function toggleInboxModal(show, title = 'Kotak Masuk') {
  const modal = document.getElementById("inboxModal");
  document.getElementById("inboxTitle").innerText = title;
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

function closeAllModals() {
  toggleComments(false);
  toggleUploadModal(false);
  toggleProfileModal(false);
  toggleSearchModal(false);
  toggleInboxModal(false);
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

document.addEventListener("DOMContentLoaded", () => {
  loadVideos();
});
