const FEED = document.getElementById('feed');
const STATUS = document.getElementById('status');
const USERNAME = 'stor4m';

// Nitter instance listesi (biri ölürse diğerini dener)
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org'
];

async function fetchViaNitter(){
  for(const inst of NITTER_INSTANCES){
    try{
      const rssUrl = `${inst}/${USERNAME}/rss`;
      // CORS proxy
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxy);
      if(!res.ok) continue;
      const data = await res.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, 'text/xml');
      const items = xml.querySelectorAll('item');
      if(items.length === 0) continue;

      const tweets = [];
      items.forEach(it=>{
        tweets.push({
          text: it.querySelector('title')?.textContent || '',
          date: it.querySelector('pubDate')?.textContent || '',
          html: it.querySelector('description')?.textContent || ''
        });
      });
      return tweets;
    }catch(e){ continue; }
  }
  throw new Error('Nitter unreachable');
}

async function fetchFallback(){
  const res = await fetch('tweets.json');
  return await res.json();
}

function extractMedia(html){
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

function render(tweets){
  FEED.innerHTML = '';
  if(!tweets.length){
    FEED.innerHTML = '<div class="error">// NO TRANSMISSION //</div>';
    return;
  }
  tweets.slice(0,20).forEach(t=>{
    const media = t.media || extractMedia(t.html || '');
    const date = t.date ? new Date(t.date).toLocaleDateString('en-US',{
      day:'2-digit',month:'short',year:'numeric'
    }).toUpperCase() : '';
    
    const card = document.createElement('div');
    card.className = 'tweet-card';
    card.innerHTML = `
      <div class="tweet-date">${date}</div>
      <div class="tweet-text">${t.text}</div>
      ${media ? `<img class="tweet-media" src="${media}" alt="">` : ''}
    `;
    card.onclick = ()=> window.open(`https://x.com/${USERNAME}`,'_blank');
    FEED.appendChild(card);
  });
}

async function init(){
  FEED.innerHTML = '<div class="loading">// FETCHING SIGNAL //</div>';
  try{
    const tweets = await fetchViaNitter();
    STATUS.textContent = 'LIVE';
    render(tweets);
  }catch(e){
    console.warn('Nitter failed, using fallback', e);
    try{
      const tweets = await fetchFallback();
      STATUS.textContent = 'ARCHIVE';
      render(tweets);
    }catch(err){
      STATUS.textContent = 'OFFLINE';
      FEED.innerHTML = '<div class="error">// SIGNAL LOST // CHECK tweets.json //</div>';
    }
  }
}

init();const FEED = document.getElementById('feed');
const STATUS = document.getElementById('status');
const USERNAME = 'stor4m';

// Nitter instance listesi (biri ölürse diğerini dener)
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org'
];

async function fetchViaNitter(){
  for(const inst of NITTER_INSTANCES){
    try{
      const rssUrl = `${inst}/${USERNAME}/rss`;
      // CORS proxy
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxy);
      if(!res.ok) continue;
      const data = await res.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, 'text/xml');
      const items = xml.querySelectorAll('item');
      if(items.length === 0) continue;

      const tweets = [];
      items.forEach(it=>{
        tweets.push({
          text: it.querySelector('title')?.textContent || '',
          date: it.querySelector('pubDate')?.textContent || '',
          html: it.querySelector('description')?.textContent || ''
        });
      });
      return tweets;
    }catch(e){ continue; }
  }
  throw new Error('Nitter unreachable');
}

async function fetchFallback(){
  const res = await fetch('tweets.json');
  return await res.json();
}

function extractMedia(html){
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

function render(tweets){
  FEED.innerHTML = '';
  if(!tweets.length){
    FEED.innerHTML = '<div class="error">// NO TRANSMISSION //</div>';
    return;
  }
  tweets.slice(0,20).forEach(t=>{
    const media = t.media || extractMedia(t.html || '');
    const date = t.date ? new Date(t.date).toLocaleDateString('en-US',{
      day:'2-digit',month:'short',year:'numeric'
    }).toUpperCase() : '';
    
    const card = document.createElement('div');
    card.className = 'tweet-card';
    card.innerHTML = `
      <div class="tweet-date">${date}</div>
      <div class="tweet-text">${t.text}</div>
      ${media ? `<img class="tweet-media" src="${media}" alt="">` : ''}
    `;
    card.onclick = ()=> window.open(`https://x.com/${USERNAME}`,'_blank');
    FEED.appendChild(card);
  });
}

async function init(){
  FEED.innerHTML = '<div class="loading">// FETCHING SIGNAL //</div>';
  try{
    const tweets = await fetchViaNitter();
    STATUS.textContent = 'LIVE';
    render(tweets);
  }catch(e){
    console.warn('Nitter failed, using fallback', e);
    try{
      const tweets = await fetchFallback();
      STATUS.textContent = 'ARCHIVE';
      render(tweets);
    }catch(err){
      STATUS.textContent = 'OFFLINE';
      FEED.innerHTML = '<div class="error">// SIGNAL LOST // CHECK tweets.json //</div>';
    }
  }
}

init();
