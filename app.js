const Parser = require('rss-parser');

const links = {
  CNN: "http://rss.cnn.com/rss/edition.rss",
  BBC: "http://feeds.bbci.co.uk/news/rss.xml"
};

let BBCNews = [];

(async (URL) => {
  const parser = new Parser();
  const feed = await parser.parseURL(URL);
  
  BBCNews = feed.items.map(item => 
({title: item.title, content: item.content, link: item.guid}));

  // to check bbcarray
  console.log(BBCNews);
  
  process.exit(0);
})(links.BBC);


// title, content, link