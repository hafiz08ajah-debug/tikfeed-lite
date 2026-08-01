// Mock Data Video untuk Tikfeed Lite
const mockVideos = [
  {
    id: 1,
    username: "user_kreatif",
    caption: "Ujicoba Tikfeed Lite versi 4 file gratisan! 🔥 Bikin via HP tanpa modal! #tikfeed #fyp",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-1230-large.mp4",
    likes: 1240,
    isLiked: false,
    commentsCount: 45,
    commentsList: [
      { user: "rudi_tekno", text: "Mantap bang, aplikasinya ringan banget!" },
      { user: "sari_design", text: "Visualnya keren pol! 🔥" }
    ],
    music: "Suara Asli - @user_kreatif"
  },
  {
    id: 2,
    username: "cinematic_vibes",
    caption: "Visual malam hari di kota. Suka gaya cinematic estetik gini? 🌃 #cinematic #night",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-neon-lit-city-street-41563-large.mp4",
    likes: 890,
    isLiked: false,
    commentsCount: 12,
    commentsList: [
      { user: "andri_vlog", text: "Pake filter apa ini bro?" }
    ],
    music: "Lofi Beats - Night Walk"
  },
  {
    id: 3,
    username: "dark_aesthetic",
    caption: "Street style aesthetic test video! 🎬 #streetwear #aesthetic #fashion",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-green-screen-41544-large.mp4",
    likes: 3410,
    isLiked: false,
    commentsCount: 128,
    commentsList: [
      { user: "gading_style", text: "Outfitnya dapet dari mana bang?" },
      { user: "reza_gaming", text: "Spill lagunya dong!" }
    ],
    music: "Dark Synth - Audio Trend"
  }
];

let activeVideoIndex = 0;

// Render daftar video ke dalam Swiper Slider
function renderVideos() {
  const container = document.getElementById("videoContainer");
  
  container.innerHTML = mockVideos.map((video, index) => `
    <div class="swiper-slide">
      <video loop playsinline preload="metadata" class="feed-video" src="${video.videoUrl}"></video>
      
      <!-- Gradient Shadow Background -->
      <div class="absolute inset-0 gradient-overlay pointer-events-none"></div>

      <!-- User Info & Caption Overlay -->
      <div class="absolute bottom-16 left-4 z-10 max-w-[72%] text-left">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 p-0.5">
            <div class="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-xs uppercase">
              ${video.username.charAt(0)}
            </div>
          </div>
          <h3 class="font-bold text-sm hover:underline cursor-pointer">@${video.username}</h3>
          <button class="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Ikuti</button>
        </div>

        <p class="text-xs text-gray-100 line-clamp-2 leading-relaxed">${video.caption}</p>
        
        <div class="flex items-center gap-2 mt-2 text-[11px] text-gray-300">
          <span>🎵</span>
          <p class="truncate w-44 font-medium">${video.music}</p>
        </div>
      </div>

      <!-- Right Action Bar -->
      <div class="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4">
        <!-- Tombol Like -->
        <button onclick="toggleLike(${index})" class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full glass-btn flex items-center justify-center text-xl transition-all duration-200 active:scale-125 ${video.isLiked ? 'text-red-500 bg-red-500/20' : 'text-white'}">
            ${video.isLiked ? '❤️' : '🤍'}
          </div>
          <span class="text-[11px] mt-1 font-semibold">${formatNumber(video.likes)}</span>
        </button>

        <!-- Tombol Komentar -->
        <button onclick="openComments(${index})" class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full glass-btn flex items-center justify-center text-xl text-white">
            💬
          </div>
          <span class="text-[11px] mt-1 font-semibold">${formatNumber(video.commentsCount)}</span>
        </button>

        <!-- Tombol Share -->
        <button onclick="shareVideo('${video.caption}')" class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full glass-btn flex items-center justify-center text-xl text-white">
            🔗
          </div>
          <span class="text-[11px] mt-1 font-semibold">Bagikan</span>
        </button>

        <!-- Audio Vinyl Disc Animation -->
        <div class="w-9 h-9 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center animate-spin-slow mt-1 overflow-hidden shadow-lg">
          <div class="w-3 h-3 rounded-full bg-pink-500"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// Inisialisasi App
document.addEventListener("DOMContentLoaded", () => {
  renderVideos();

  // Inisialisasi Swiper Vertical
  const swiper = new Swiper('.mySwiper', {
    direction: 'vertical',
    mousewheel: true,
    keyboard: true,
    on: {
      init: function () {
        playCurrentVideo(this);
      },
      slideChange: function () {
        activeVideoIndex = this.activeIndex;
        playCurrentVideo(this);
      }
    }
  });

  // Tap layar untuk Play / Pause video
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'VIDEO') {
      if (e.target.paused) {
        e.target.play();
      } else {
        e.target.pause();
      }
    }
  });
});

// Play Video yang sedang aktif, Pause video lain
function playCurrentVideo(swiperInstance) {
  const allVideos = document.querySelectorAll('.feed-video');
  allVideos.forEach(v => v.pause());

  const currentSlide = swiperInstance.slides[swiperInstance.activeIndex];
  if (currentSlide) {
    const activeVideo = currentSlide.querySelector('.feed-video');
    if (activeVideo) {
      activeVideo.play().catch(err => console.log("Autoplay blocked:", err));
    }
  }
}

// Helper Format Angka (Contoh: 1200 -> 1.2k)
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
}

// Handler Like Button
function toggleLike(index) {
  mockVideos[index].isLiked = !mockVideos[index].isLiked;
  mockVideos[index].likes += mockVideos[index].isLiked ? 1 : -1;
  renderVideos();
}

// Modal Komentar
function openComments(index) {
  activeVideoIndex = index;
  const modal = document.getElementById("commentModal");
  const commentList = document.getElementById("commentList");
  const countHeader = document.getElementById("commentCountHeader");

  const video = mockVideos[index];
  countHeader.innerText = `${video.commentsCount} Komentar`;

  commentList.innerHTML = video.commentsList.map(c => `
    <div class="flex gap-3 items-start text-xs">
      <div class="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white shrink-0">
        ${c.user.charAt(0).toUpperCase()}
      </div>
      <div>
        <span class="font-bold text-gray-300">@${c.user}</span>
        <p class="text-gray-100 mt-0.5">${c.text}</p>
      </div>
    </div>
  `).join('');

  modal.classList.remove("hidden");
}

function toggleComments(show) {
  const modal = document.getElementById("commentModal");
  if (show) {
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

function addComment(event) {
  event.preventDefault();
  const input = document.getElementById("commentInput");
  if (!input.value.trim()) return;

  mockVideos[activeVideoIndex].commentsList.push({
    user: "kamu",
    text: input.value.trim()
  });
  mockVideos[activeVideoIndex].commentsCount += 1;
  
  input.value = "";
  openComments(activeVideoIndex);
  renderVideos();
}

// Share Handler
function shareVideo(caption) {
  if (navigator.share) {
    navigator.share({
      title: 'Tikfeed Lite',
      text: caption,
      url: window.location.href,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Link video berhasil disalin!");
  }
}
