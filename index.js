const API_KEY = 'AIzaSyDw8hKf8Iie3DPDRGMuD47acrnybeaiuOk';

let nextPageToken = '';
let currentQuery = '';
let currentChannelId = '';
let currentMode = 'search';
let currentPlaylistId = '';
let loading = false;

function startSearch() {
  resetState();
  currentQuery = document.getElementById('searchInput').value;
  currentMode = 'search';
  loadVideos();
}

function resetState() {
  document.getElementById('results').innerHTML = '';
  document.getElementById('loadMore').style.display = 'none';
  document.getElementById('playerContainer').style.display = 'none';
  nextPageToken = '';
  currentPlaylistId = '';
  currentChannelId = '';
}

function loadVideos() {
  if (loading) return;
  loading = true;

  let url = '';
  if (currentMode === 'search') {
    url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(currentQuery)}&key=${API_KEY}&maxResults=12`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;
  } else if (currentMode === 'channelVideos') {
    url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${currentChannelId}&key=${API_KEY}&maxResults=12`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;
  } else if (currentMode === 'channelPlaylists') {
    url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${currentChannelId}&key=${API_KEY}&maxResults=12`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;
  } else if (currentMode === 'playlistVideos') {
    url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${currentPlaylistId}&key=${API_KEY}&maxResults=12`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      nextPageToken = data.nextPageToken || '';
      const results = document.getElementById('results');

      (data.items || []).forEach(item => {
        if (currentMode === 'channelPlaylists') {
          const playlist = item;
          const title = playlist.snippet.title;
          const thumbnail = playlist.snippet.thumbnails.medium.url;
          const id = playlist.id;

          const div = document.createElement('div');
          div.className = 'playlist';
          div.innerHTML = `
            <img src="${thumbnail}" alt="${title}" />
            <div class="title">${title}</div>
          `;
          div.onclick = () => {
            resetState();
            currentMode = 'playlistVideos';
            currentPlaylistId = id;
            loadVideos();
          };
          results.appendChild(div);
        } else {
          const snippet = item.snippet;
          const videoId = item.contentDetails?.videoId || item.id.videoId || snippet.resourceId?.videoId;
          const title = snippet.title;
          const channel = snippet.channelTitle;
          const channelId = snippet.channelId;
          const thumbnail = snippet.thumbnails.medium.url;

          const div = document.createElement('div');
          div.className = 'video';
          div.innerHTML = `
            <img src="${thumbnail}" alt="${title}" />
            <div class="title">${title}</div>
            <div class="channel" onclick="event.stopPropagation(); loadChannel('${channelId}')">by ${channel}</div>
          `;
          div.onclick = () => {
            showPlayer(videoId);
          };
          results.appendChild(div);
        }
      });

      document.getElementById('loadMore').style.display = nextPageToken ? 'inline-block' : 'none';
      loading = false;
    })
    .catch(err => {
      console.error(err);
      loading = false;
    });
}

function showPlayer(videoId) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  const playerContainer = document.getElementById('playerContainer');
  const videoPlayer = document.getElementById('videoPlayer');

  videoPlayer.innerHTML = `
    <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `;
  playerContainer.style.display = 'block';
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function closePlayer() {
  document.getElementById('playerContainer').style.display = 'none';
  document.getElementById('videoPlayer').innerHTML = '';
}

function loadChannel(channelId) {
  resetState();
  currentChannelId = channelId;
  currentMode = 'channelVideos';
  loadVideos();
}

function showChannelVideos() {
  if (!currentChannelId) return alert('Click a channel name first.');
  resetState();
  currentMode = 'channelVideos';
  loadVideos();
}

function showChannelPlaylists() {
  if (!currentChannelId) return alert('Click a channel name first.');
  resetState();
  currentMode = 'channelPlaylists';
  loadVideos();
}
