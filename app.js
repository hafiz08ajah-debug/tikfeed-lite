// 1. Inisialisasi Supabase Client
const SUPABASE_URL = 'https://vchoytldpoavasrs.supabase.co'; // Sesuaikan jika ada perbedaan suffix URL
const SUPABASE_KEY = 'sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let mockVideos = [];
let activeVideoIndex = 0;

// 2. Ambil Data Video dari Supabase Database
async function fetchVideosFromSupabase() {
  const { data, error } = await supabaseClient
    .from('videos')
    .select('*, comments(*)');

  if (error) {
    console.error('Gagal mengambil data dari Supabase:', error);
    return;
  }

  // Format data Supabase ke struktur Tikfeed
  mockVideos = data.map(v => ({
    id: v.id,
    username: v.username,
    caption: v.caption,
    videoUrl: v.video_url,
    likes: v.likes || 0,
    isLiked: false,
    commentsCount: v.comments ? v.comments.length : 0,
    commentsList: v.comments ? v.comments.map(c => ({ user: c.username, text: c.comment_text })) : [],
    music: v.music || "Suara Asli"
  }));

  renderVideos();
}

// 3. Render daftar video ke HTML
function renderVideos() {
  const container = document.getElementById("videoContainer");
  if (!container) return;
  
  container.innerHTML = mockVideos.map((video, index) => `
    <div class="swiper-slide">
      <video loop playsinline preload="metadata" class="feed-video" src="${video.videoUrl}"></video>
      
      <div class="absolute inset-0 gradient-overlay pointer-events-none"></div>

      <!-- User Info & Caption -->
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

      <!-- Action Buttons -->
      <div class="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4">
        <button onclick="toggleLike(${index})" class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full glass-btn flex items-center justify-center text-xl transition-all duration-200 active:scale-125 ${video.isLiked ? 'text-red-500 bg-red-500/20' : 'text-white'}">
            ${video.isLiked ? '❤️' : '🤍'}
          </div>
          <span class="text-[11px] mt-1 font-semibold">${formatNumber(video.likes)}</span>
        </button>

        <button onclick="openComments(${index})" class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full glass-btn flex items-center justify-center text-xl text-white">
            💬
          </div>
          <span class="text-[11px] mt-1 font-semibold">${formatNumber(video.commentsCount)}</span>
        </button>

        <button onclick="shareVideo('${video.caption}')" class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full glass-btn flex items-center justify-center text-xl text-white">
            🔗
          </div>
          <span class="text-[11px] mt-1 font-semibold">Bagikan</span>
        </button>

        <div class="w-9 h-9 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center animate-spin-slow mt-1 overflow-hidden shadow-lg">
          <div class="w-3 h-3 rounded-full bg-pink-500"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// 4. Init App
document.addEventListener("DOMContentLoaded", () => {
  fetchVideosFromSupabase();

  const swiper = new Swiper('.mySwiper', {
    direction: 'vertical',
    mousewheel: true,
    keyboard: true,
    on: {
      init: function () { playCurrentVideo(this); },
      slideChange: function () {
        activeVideoIndex = this.activeIndex;
        playCurrentVideo(this);
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'VIDEO') {
      e.target.paused ? e.target.play() : e.target.pause();
    }
  });
});

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

function formatNumber(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
}

// 5. Update Like ke Database Supabase
async function toggleLike(index) {
  const video = mockVideos[index];
  video.isLiked = !video.isLiked;
  video.likes += video.isLiked ? 1 : -1;
  
  renderVideos();

  await supabaseClient
    .from('videos')
    .update({ likes: video.likes })
    .eq('id', video.id);
}

// 6. Modal & Tambah Komentar ke Database Supabase
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
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

async function addComment(event) {
  event.preventDefault();
  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) return;

  const currentVideo = mockVideos[activeVideoIndex];

  const { error } = await supabaseClient
    .from('comments')
    .insert([{ video_id: currentVideo.id, username: 'user_kamu', comment_text: text }]);

  if (!error) {
    currentVideo.commentsList.push({ user: 'user_kamu', text: text });
    currentVideo.commentsCount += 1;
    input.value = "";
    openComments(activeVideoIndex);
    renderVideos();
  }
}

function shareVideo(caption) {
  if (navigator.share) {
    navigator.share({ title: 'Tikfeed Lite', text: caption, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Link disalin!");
  }
}
