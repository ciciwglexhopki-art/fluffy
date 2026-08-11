const FEED = document.getElementById('feed');
const STATUS = document.getElementById('status');
const USERNAME = 'stor4m';

const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org'
];

/* ============ TEXT SCRAMBLE ============ */
class TextScramble {
  constructor(el){
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________ABCDEF0123456789';
    this.update = this.update.bind(this);
  }
  setText(newText){
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    for(let i=0; i<length; i++){
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random()*40);
      const end = start + Math.floor(Math.random()*40);
      this.queue.push({from,to,start,end});
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update(){
    let output = '';
    let complete = 0;
    for(let i=0, n=this.queue.length; i<n; i++){
      let {from,to,start,end,char} = this.queue[i];
      if(this.frame >= end){ complete++; output += to; }
      else if(this.frame >= start){
        if(!char || Math.random()<0.28){
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else { output += from; }
    }
    this.el.innerHTML = output;
    if(complete === this.queue.length){ this.resolve(); }
    else{
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar(){ return this.chars[Math.floor(Math.random()*this.chars.length)]; }
}

// Sayfa açılınca tüm .scramble elementlerine uygula
function initScramble(){
  document.querySelectorAll('.scramble').forEach((el, i)=>{
    const text = el.innerText;
    const fx = new TextScramble(el);
    setTimeout(()=> fx.setText(text), i*100);
  });
}

// Scroll'la görünen elementlere tekrar scramble
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting && !entry.target.dataset.scrambled){
      entry.target.dataset.scrambled = 'true';
      const text = entry.target.innerText;
      const fx = new TextScramble(entry.target);
      fx.setText(text);
    }
  });
},{ threshold:0.5 });

/* ============ FEED FETCH ============ */
async function fetchViaNitter(){
  for(const inst of NITTER_INSTANCES){
    try{
      const rssUrl = `${inst}/${USERNAME}/rss`;
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
        const html = it.querySelector('description')?.textContent || '';
        const imgMatch = html.match(/<img[^>]+src="([^"]+)"/);
        if(imgMatch) tweets.push({ media: imgMatch[1] });
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

function render(tweets){
  FEED.innerHTML = '';
  const withMedia = tweets.filter(t => t.media);
  if(!withMedia.length){
    FEED.innerHTML = '<div class="error">// NO VISUALS //</div>';
    return;
  }
  withMedia.slice(0,30).forEach(t=>{
    const card = document.createElement('div');
    card.className = 'tweet-card';
    card.innerHTML = `<img src="${t.media}" alt="" loading="lazy">`;
    card.onclick = ()=> window.open(`https://x.com/${USERNAME}`,'_blank');
    FEED.appendChild(card);
  });
}

async function init(){
  initScramble();
  FEED.innerHTML = '<div class="loading">// FETCHING SIGNAL //</div>';
  try{
    const tweets = await fetchViaNitter();
    STATUS.textContent = 'LIVE';
    render(tweets);
  }catch(e){
    try{
      const tweets = await fetchFallback();
      STATUS.textContent = 'ARCHIVE';
      render(tweets);
    }catch(err){
      STATUS.textContent = 'OFFLINE';
      FEED.innerHTML = '<div class="error">// SIGNAL LOST //</div>';
    }
  }
}

init();
