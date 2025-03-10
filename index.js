var cheerio = require('cheerio');
var slug = require('github-slugid');

/**
 * 处理toc相关，同时处理标题和id
 * @param $
 * @param page
 * @returns {Array} 返回处理好的tocs合集
 */
function handlerTocs($, page) {
  var tocs = [];

  var titleCountMap = {}; // 用来记录标题出现的次数
  $(':header').each(function (i, elem) {
    var header = $(elem);
    var id = addId(header, titleCountMap);

    if (id) {
      titleAddAnchor(header, id);
    }
  });
  // 不然标题重写就没有效果，如果在外面不调用这句话的话
  page.content = $.html();
  return tocs;
}

/**
 * 处理锚点
 * @param header
 * @param titleCountMap 用来记录标题出现的次数
 * @returns {string}
 */
function addId(header, titleCountMap) {
  var id = header.attr('id') || slug(header.text());
  var titleCount = titleCountMap[id] || 0;
  titleCountMap[id] = titleCount + 1;
  // console.log('id:', id, 'n:', titleCount, 'hashmap:', titleCountMap)
  if (titleCount) {//此标题已经存在  null/undefined/0/NaN/ 表达式时，统统被解释为false
    id = id + '_' + titleCount;
  }
  header.attr("id", id);
  return id;
}

/**
 * 标题增加锚点效果
 * @param header
 * @param id
 */
function titleAddAnchor(header, id) {
  header.prepend('<a name="' + id + '" class="honkit-plugin-anchor-link--link" '
    + 'href="#' + id + '">'
    + '<i class="fa fa-link" aria-hidden="true"></i>'
    + '</a>');
}

function start(page) {
  var $ = cheerio.load(page.content);
  // 处理toc相关，同时处理标题和id
  handlerTocs($, page);

  page.content = $.html();
  return page;
}

module.exports = {
  book: {
    assets: "./assets",
    css: ["style/plugin.css"]
  },
  hooks: {
    "page": start
  }
};
