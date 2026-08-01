// Inisialisasi Supabase Client
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co'; // Ganti dengan URL Supabase kamu
const SUPABASE_KEY = 'sb_publishable_Zr5p4t-xVFRaxByASamy4A_u8w5aoe5';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const videoContainer = document.getElementById('videoContainer');

// Data Mockup / Fallback jika tabel Supabase kamu masih kosong
const defaultVideos = [
  {
    id: '1',
    username: 'creator_keren',
    caption: 'Tampilan feed mirip TikTok 95%! 🔥 #tikfeed #fyp #tech',
    sound_title: 'Suara Asli - Creator Keren',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes_count: 1250,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  },
  {
    id: '2',
    username: 'dev_life',
    caption: 'Integrasi Supabase + Vercel gacor parah 🚀 #coding #developer',
    sound_title: 'Suara Asli - Dev Life',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    likes_count: 890,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  }
];

// 1. Ambil Data Video dari Supabase
async function fetchVideos() {
  try {
    const { data, error } = await supabaseClient
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Gagal memuat dari Supabase atau tabel kosong. Menampilkan data sampel:', error);
      renderVideos(defaultVideos);
    } else {
      renderVideos(data);
    }
  } catch (err) {
    console.error('Error saat koneksi ke Supabase:', err);
    renderVideos(defaultVideos);
  }
}

// 2. Render List Video ke DOM
function renderVideos(videos) {
  videoContainer.innerHTML = '';

  videos.forEach((video) => {
    const videoCard = document.createElement('div');
    videoCard.className = 'relative w-full h-full snap-start flex-shrink-0 bg-black flex items-center justify-center overflow-hidden';
    
    videoCard.innerHTML = `
      <video 
        src="${video.video_url}" 
        class="w-full h-full object-cover cursor-pointer video-player" 
        loop 
        playsinline
      ></video>

      <div class="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-20 text-white">
        <div class="relative">
          <img src="${video.avatar_url || 'https://via.placeholder.com/150'}" class="w-11 h-11 rounded-full border border-white object-cover">
          <button class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pink-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">+</button>
        </div>

        <button class="like-btn flex flex-col items-center gap-1 active:scale-125 transition" data-id="${video.id}" data-likes="${video.likes_count || 0}">
          <div class="p-2.5 rounded-full bg-black/30 backdrop-blur-sm">
            <svg class="w-7 h-7 fill-current text-white heart-icon" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span class="text-xs font-semibold like-count">${video.likes_count || 0}</span>
        </button>

        <button class="flex flex-col items-center gap-1">
          <div class="p-2.5 rounded-full bg-black/30 backdrop-blur-sm">
            <svg class="w-7 h-7 fill-white" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span class="text-xs font-semibold">0</span>
        </button>
      </div>

      <div class="absolute bottom-16 left-3 right-16 z-20 text-white pointer-events-none drop-shadow">
        <h3 class="font-bold text-base">@${video.username || 'user'}</h3>
        <p class="text-xs mt-1 leading-snug line-clamp-2">${video.caption || ''}</p>
        <div class="flex items-center gap-2 mt-2 text-xs opacity-90">
          <span>🎵</span>
          <span class="truncate">${video.sound_title || 'Suara Asli'}</span>
        </div>
      </div>
    `;

    videoContainer.appendChild(videoCard);
  });

  initIntersectionObserver();
  initInteractions();
}

// 3. Autoplay / Pause Otomatis Menggunakan Intersection Observer
function initIntersectionObserver() {
  const options = {
    root: videoContainer,
    threshold: 0.75 // Video dianggap fokus jika 75% masuk area pandang
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target.querySelector('video');
      if (!video) return;

      if (entry.isIntersecting) {
        video.play().catch(() => {
          // Mencegah error jika autoplay diblokir browser tanpa gesture pengguna
        });
      } else {
        video.pause();
        video.currentTime = 0; // Reset video ke awal
      }
    });
  }, options);

  document.querySelectorAll('#videoContainer > div').forEach((card) => {
    observer.observe(card);
  });
}

// 4. Logika Interaksi (Click to Play/Pause & Like Toggle)
function initInteractions() {
  // Toggle Play/Pause saat video diklik
  document.querySelectorAll('.video-player').forEach((video) => {
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });

  // Toggle Like Button
  document.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const heartIcon = btn.querySelector('.heart-icon');
      const likeCountEl = btn.querySelector('.like-count');
      let currentLikes = parseInt(btn.getAttribute('data-likes')) || 0;
      const isLiked = btn.classList.contains('liked');

      if (!isLiked) {
        btn.classList.add('liked');
        heartIcon.classList.remove('text-white');
        heartIcon.classList.add('text-red-500');
        currentLikes += 1;
      } else {
        btn.classList.remove('liked');
        heartIcon.classList.remove('text-red-500');
        heartIcon.classList.add('text-white');
        currentLikes -= 1;
      }

      btn.setAttribute('data-likes', currentLikes);
      likeCountEl.textContent = currentLikes;

      // Update ke Supabase secara asynchronous
      const videoId = btn.getAttribute('data-id');
      await supabaseClient
        .from('videos')
        .update({ likes_count: currentLikes })
        .eq('id', videoId);
    });
  });
}

// Jalankan saat aplikasi dibuka
document.addEventListener('DOMContentLoaded', fetchVideos);
