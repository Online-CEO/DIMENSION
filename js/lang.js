(async function () {
  // ===== 元素获取 =====
  const langToggle = document.getElementById("lang-toggle"); // 语言切换按钮
  const currentLangText = document.getElementById("current-lang-text"); // 显示当前语言文本的元素
  const langMenu = document.getElementById("lang-menu"); // 语言下拉菜单

  // 语言代码到显示名称的映射
  const langMap = {
    zh: "中文",
    en: "English",
    ko: "한국어",
  };

  // ===== 语言检测与加载 =====
  const browserLang = navigator.language.slice(0, 2); // 获取浏览器语言 (如 'zh', 'en')
  const supported = ["zh", "en", "ko"]; // 网站支持的语言列表
  // 优先从本地存储获取，其次用浏览器语言，默认为中文
  let currentLang =
    localStorage.getItem("site_lang") ||
    (supported.includes(browserLang) ? browserLang : "zh");

  /**
   * 功能：根据语言代码加载对应的JSON语言包
   * @param {string} lang - 语言代码 (e.g., 'zh', 'en')
   * @returns {Promise<object>} - 包含翻译文本的对象
   */
  async function loadLang(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP 错误! 状态: ${res.status}`);
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

  /**
   * 功能：将翻译应用到页面上所有带 data-i18n 属性的元素
   * @param {object} t - 包含翻译文本的对象
   */
  function applyTranslations(t) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        // 为了安全，默认使用 textContent。如果翻译内容确实需要HTML标签，可以特殊处理。
        // 例如，如果key包含'html'字样，则使用innerHTML。
        if (t[key].includes("<") && t[key].includes(">")) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    // 更新<html>标签的lang属性，对SEO和可访问性有益
    document.documentElement.lang = currentLang;
    // 更新下拉框中显示的当前语言名称
    if (currentLangText) {
      currentLangText.textContent = langMap[currentLang] || "Language";
    }
  }

  /**
   * 功能：切换语言的主函数
   * @param {string} lang - 要切换到的目标语言代码
   */
  async function switchLang(lang) {
    if (lang === currentLang) return; // 如果已经是当前语言，则不执行任何操作
    currentLang = lang;
    localStorage.setItem("site_lang", lang); // 将用户的选择保存到本地存储
    const t = await loadLang(lang);
    applyTranslations(t);
  }

  // ===== 事件监听 =====
  // 1. 监听下拉框按钮点击，用于显示/隐藏菜单
  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // 防止事件冒泡到window，导致菜单立即关闭
      langMenu.classList.toggle("show");
    });
  }

  // 2. 监听整个文档的点击，用于在点击外部时关闭菜单
  window.addEventListener("click", () => {
    if (langMenu && langMenu.classList.contains("show")) {
      langMenu.classList.remove("show");
    }
  });

  // 3. 监听下拉菜单项的点击，用于切换语言 (事件委托)
  if (langMenu) {
    langMenu.addEventListener("click", (e) => {
      const target = e.target.closest(".dropdown-item");
      if (target) {
        const lang = target.getAttribute("data-lang");
        switchLang(lang);
      }
    });
  }

  // ===== 页面初始化 =====
  // 页面加载时，立即加载并应用当前语言
  const initialTranslations = await loadLang(currentLang);
  applyTranslations(initialTranslations);
})();
