/* 自定义脚本：页脚「点击开启星辰之旅」随机跳转一篇文章 */
(function () {
  'use strict';

  var LIST_URL = '/js/post-list.js';
  var loading = false;

  function toast(text) {
    if (window.btf && typeof window.btf.snackbarShow === 'function') {
      window.btf.snackbarShow(text);
    } else {
      console.warn('[toRandomPost] ' + text);
    }
  }

  // 统一成 "posts/xxxx/" 形式，便于和 location.pathname 比较
  function normalize(p) {
    return decodeURI(String(p || ''))
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+/, '')
      .replace(/index\.html$/i, '');
  }

  function jump(list) {
    if (!list || !list.length) {
      toast('还没有文章可以随机哦~');
      return;
    }

    var current = normalize(window.location.pathname);
    var pool = list.filter(function (p) {
      return normalize(p) !== current;
    });
    if (!pool.length) pool = list; // 只有一篇文章时退回原列表

    var target = pool[Math.floor(Math.random() * pool.length)];
    window.location.href = '/' + normalize(target);
  }

  function loadList(callback) {
    if (loading) return;
    loading = true;

    var script = document.createElement('script');
    script.src = LIST_URL + '?t=' + Date.now();
    script.onload = function () {
      loading = false;
      callback(window.POST_LIST);
    };
    script.onerror = function () {
      loading = false;
      toast('文章清单加载失败，请刷新重试');
    };
    document.body.appendChild(script);
  }

  window.toRandomPost = function () {
    if (window.POST_LIST && window.POST_LIST.length) {
      jump(window.POST_LIST);
    } else {
      loadList(jump); // 兜底：清单脚本未加载时动态补上
    }
  };

  // 事件委托：即便 href 被改成别的写法（或存在旧缓存页面）也能触发
  function onClick(e) {
    var el = e.target;
    while (el && el !== document.body) {
      if (el.classList && el.classList.contains('btn-xz')) {
        e.preventDefault();
        window.toRandomPost();
        return;
      }
      el = el.parentNode;
    }
  }

  document.addEventListener('click', onClick);
  document.addEventListener('auxclick', function (e) {
    if (e.button === 1) onClick(e); // 中键点击不打开空白报错页
  });
})();
