const { DOMParser } = require('xmldom');

const feeds = {
  CNN: "http://rss.cnn.com/rss/edition.rss",
  BBC: "http://feeds.bbci.co.uk/news/rss.xml"
};

function compressText(text, maxLength = 150) {
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
}

async function fetchFeed(name, url) {
  const res = await fetch(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const items = doc.getElementsByTagName('item');

  console.log(`\n📰 ${name} News:`);
  for (let i = 0; i < Math.min(5, items.length); i++) {
    const item = items[i];
    const title = item.getElementsByTagName('title')[0].textContent;
    const link = item.getElementsByTagName('link')[0].textContent;
    const rawDesc = item.getElementsByTagName('description')[0]?.textContent || '';
    const desc = compressText(rawDesc.replace(/<[^>]*>/g, '')); // strip HTML tags

    console.log(`* ${title}`);
    console.log(`  🔗 ${link}`);
    console.log(`  📝 ${desc}`);
  }
}

for (const [name, url] of Object.entries(feeds)) {
  fetchFeed(name, url);
}
