(async function () {
  // ===== 요소 가져오기 =====
  const langToggle = document.getElementById("lang-toggle");
  const currentLangText = document.getElementById("current-lang-text");
  const langMenu = document.getElementById("lang-menu");

  // 언어 이름 매핑
  const langMap = {
    zh: "中文",
    en: "English",
    ko: "한국어",
  };

  // ===== 언어 감지 및 로드 =====
  const browserLang = navigator.language.slice(0, 2);
  const supported = ["zh", "en", "ko"];
  let currentLang =
    localStorage.getItem("site_lang") ||
    (supported.includes(browserLang) ? browserLang : "zh");

  // 언어 파일 로드 함수
  async function loadLang(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`언어 팩 lang/${lang}.json 로드 실패`, e);
      if (lang !== "zh") {
        return await loadLang("zh"); // 실패 시 중국어로 대체
      }
      return {};
    }
  }

  // 번역 적용 함수
  function applyTranslations(t) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        // 보안을 위해 innerHTML 대신 textContent를 기본으로 사용
        // HTML 태그가 필요한 경우에만 innerHTML 사용 (예: <br>)
        // 더 안전한 방법은 라이브러리를 사용하거나, 서버 사이드에서 렌더링하는 것
        if (t[key].includes("<") && t[key].includes(">")) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    document.documentElement.lang = currentLang;
    if (currentLangText) {
      currentLangText.textContent = langMap[currentLang] || "Language";
    }
  }

  // 언어 전환 메인 함수
  async function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("site_lang", lang);
    const t = await loadLang(lang);
    applyTranslations(t);
  }

  // ===== 이벤트 리스너 =====
  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("show");
    });
  }

  window.addEventListener("click", () => {
    if (langMenu && langMenu.classList.contains("show")) {
      langMenu.classList.remove("show");
    }
  });

  if (langMenu) {
    langMenu.addEventListener("click", (e) => {
      const target = e.target.closest(".dropdown-item");
      if (target) {
        const lang = target.getAttribute("data-lang");
        switchLang(lang);
      }
    });
  }

  // ===== 페이지 초기화 =====
  const initialTranslations = await loadLang(currentLang);
  applyTranslations(initialTranslations);
})();
