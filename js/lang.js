(async function () {
  // ===== 元素获取 =====
  const langToggle = document.getElementById("lang-toggle");
  const currentLangText = document.getElementById("current-lang-text");
  const langMenu = document.getElementById("lang-menu");

  // 语言名称映射
  const langMap = {
    zh: "中文",
    en: "English",
    ko: "한국어",
  };

  // ===== 语言检测与加载 =====
  const browserLang = navigator.language.slice(0, 2);
  const supported = ["zh", "en", "ko"];
  const storedLang = localStorage.getItem("site_lang");
  let currentLang =
    storedLang || (supported.includes(browserLang) ? browserLang : "zh");

  // 加载语言文件函数
  async function loadLang(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`语言包 lang/${lang}.json 加载失败`, e);
      // 如果目标语言加载失败，回退到中文
      if (lang !== "zh") {
        return await loadLang("zh");
      }
      return {};
    }
  }

  // 应用翻译函数
  function applyTranslations(t) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        // 处理带HTML标签的翻译
        if (key.includes("Title") || key.includes("Subtitle")) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    document.documentElement.lang = currentLang;
    // 更新下拉框显示的当前语言
    if (currentLangText) {
      currentLangText.textContent = langMap[currentLang];
    }
  }

  // 切换语言的主函数
  async function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("site_lang", lang);
    const t = await loadLang(lang);
    applyTranslations(t);
  }

  // ===== 事件监听 =====

  // 1. 监听下拉框按钮点击，用于显示/隐藏菜单
  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // 防止事件冒泡到window
      langMenu.classList.toggle("show");
    });
  }

  // 2. 监听整个文档的点击，用于在点击外部时关闭菜单
  window.addEventListener("click", () => {
    if (langMenu && langMenu.classList.contains("show")) {
      langMenu.classList.remove("show");
    }
  });

  // 3. 监听下拉菜单项的点击，用于切换语言
  if (langMenu) {
    langMenu.addEventListener("click", (e) => {
      const target = e.target.closest(".dropdown-item");
      if (target) {
        const lang = target.getAttribute("data-lang");
        switchLang(lang);
      }
    });
  }

  // ===== 初始化页面 =====
  const initialTranslations = await loadLang(currentLang);
  applyTranslations(initialTranslations);
})();
