// =================================================================
//                      主程序入口
// =================================================================
document.addEventListener("DOMContentLoaded", function () {
  // 基础交互模块初始化
  initMobileMenu();
  initSmoothScrolling();
  initNavbarScroll();

  // 页面内容模块初始化
  initSolutionTabs();
  initProjectFilter();
  initEquipmentCarousel();
  initTimelineAnimation();

  // 弹窗与交互模块初始化
  initDetailModal();
  initVideoModal();
  initContactForm();

  // 其他功能模块初始化
  if (document.getElementById("roiForm")) {
    new ROIcalculator();
  }

  // 懒加载模块初始化
  lazyLoadModelViewers();
  initLazyLoadMap();
});

// =================================================================
//                      功能函数定义
// =================================================================

/**
 * 功能：初始化移动端导航菜单的展开/收起功能
 */
function initMobileMenu() {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!mobileToggle || !navLinks) return;

  mobileToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    mobileToggle.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>' // 展开时显示关闭图标
      : '<i class="fas fa-bars"></i>'; // 收起时显示菜单图标
  });
}

/**
 * 功能：初始化“核心设备展示”区域的轮播图
 */
function initEquipmentCarousel() {
  const carousel = document.querySelector(".equipment-carousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const prevBtn = carousel.querySelector(".carousel-button.prev");
  const nextBtn = carousel.querySelector(".carousel-button.next");
  const indicators = carousel.querySelectorAll(".indicator");
  const techDesc = document.querySelector(".tech-desc");
  const appDesc = document.querySelector(".application-desc");

  // 如果只有一个或没有幻灯片，则禁用轮播功能
  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (indicators.length > 0)
      indicators[0].parentElement.style.display = "none";

    const firstSlide = slides[0];
    if (firstSlide) {
      if (techDesc) techDesc.textContent = firstSlide.dataset.techDesc || "";
      if (appDesc) appDesc.textContent = firstSlide.dataset.appDesc || "";
    }
    return;
  }

  let currentIndex = 0;
  const totalSlides = slides.length;

  /**
   * 更新轮播图的显示状态和内容
   */
  function updateCarousel() {
    // 更新所有幻灯片的 active 状态
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === currentIndex);
    });

    const activeSlide = slides[currentIndex];
    if (activeSlide) {
      // 更新上方的描述文本
      if (techDesc) techDesc.textContent = activeSlide.dataset.techDesc || "";
      if (appDesc) appDesc.textContent = activeSlide.dataset.appDesc || "";

      // 懒加载当前显示的3D模型
      const modelViewer = activeSlide.querySelector("model-viewer");
      if (
        modelViewer &&
        !modelViewer.hasAttribute("src") &&
        modelViewer.dataset.src
      ) {
        modelViewer.src = modelViewer.dataset.src;
      }
    }

    // 更新下方指示器的 active 状态
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });
  }

  // 绑定事件监听
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  updateCarousel(); // 初始化轮播图状态
}

/**
 * 功能：初始化页面内锚点链接的平滑滚动效果
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") {
        e.preventDefault();
        return;
      }

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 80, // 80是导航栏的高度，防止遮挡
          behavior: "smooth",
        });

        // 如果在移动端，点击后自动收起菜单
        const navLinks = document.querySelector(".nav-links");
        if (navLinks && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          document.querySelector(".mobile-toggle").innerHTML =
            '<i class="fas fa-bars"></i>';
        }
      }
    });
  });
}

/**
 * 功能：初始化“行业解决方案”区域的选项卡(Tab)切换功能
 */
function initSolutionTabs() {
  const tabContainer = document.querySelector(".solution-tabs");
  if (!tabContainer) return;

  const tabBtns = tabContainer.querySelectorAll(".tab-btn");
  const tabContents = tabContainer.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tabContents.forEach((content) => {
        // 使用 display 属性来控制显示和隐藏
        content.style.display = content.id === tabId ? "flex" : "none";
      });
    });
  });

  // 初始化时，确保只有标记为 active 的选项卡内容显示
  const activeTabId =
    tabContainer.querySelector(".tab-btn.active")?.dataset.tab;
  if (activeTabId) {
    tabContents.forEach((content) => {
      content.style.display = content.id === activeTabId ? "flex" : "none";
    });
  }
}

/**
 * 功能：初始化“成功案例”区域的按类别筛选功能
 */
function initProjectFilter() {
  const filterContainer = document.querySelector(".projects-filter");
  if (!filterContainer) return;

  const filterBtns = filterContainer.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(
    ".projects-grid .project-card"
  );

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 获取按钮上的类别信息（从data-i18n属性解析）
      const categoryToFilter = btn.dataset.i18n.replace("cases_filter_", "");

      projectCards.forEach((card) => {
        // 注意：这里的筛选逻辑依赖于HTML中写死的中文类别名称，如果多语言切换后文本会变，
        // 最好给卡片也加上 data-category="auto" 这样的属性来筛选。
        const cardCategoryText = card
          .querySelector(".project-category")
          .textContent.trim();

        // 简单的中文到英文键名的映射，用于匹配
        let cardCategoryKey;
        switch (cardCategoryText) {
          case "通用设备":
            cardCategoryKey = "general";
            break;
          case "汽车制造":
            cardCategoryKey = "auto";
            break;
          case "动力电池":
            cardCategoryKey = "battery";
            break;
          case "智能物流":
            cardCategoryKey = "logistics";
            break;
          case "软件开发":
            cardCategoryKey = "software";
            break;
          default:
            cardCategoryKey = "unknown";
        }

        const show =
          categoryToFilter === "all" || cardCategoryKey === categoryToFilter;
        card.style.display = show ? "block" : "none";
      });
    });
  });
}

/**
 * 功能：ROI投资回报计算器
 */
class ROIcalculator {
  constructor() {
    this.form = document.getElementById("roiForm");
    if (!this.form) return;

    this.calculateBtn = document.getElementById("calculate-btn");
    this.results = {
      laborSaving: document.getElementById("labor-saving"),
      outputGain: document.getElementById("output-gain"),
      roiResult: document.getElementById("roi-result"),
    };
    this.initEvents();
  }
  initEvents() {
    this.calculateBtn.addEventListener("click", () => this.calculate());
  }
  calculate() {
    const data = {
      laborCost: parseFloat(document.getElementById("labor-cost").value) || 0,
      currentOutput:
        parseFloat(document.getElementById("current-output").value) || 0,
      targetOutput:
        parseFloat(document.getElementById("target-output").value) || 0,
    };
    // 示例计算逻辑，需要根据实际业务调整
    const laborSaving = data.laborCost * 0.65;
    const outputIncrease =
      ((data.targetOutput - data.currentOutput) / 10000) * 12000; // 假设产品单价带来的收益
    const annualBenefit = laborSaving + outputIncrease;
    const roiMonths =
      annualBenefit > 0 ? ((100 / annualBenefit) * 12).toFixed(1) : 0; // 假设设备投资100万
    this.results.laborSaving.textContent = laborSaving.toLocaleString();
    this.results.outputGain.textContent = outputIncrease.toLocaleString();
    this.results.roiResult.textContent = roiMonths;
  }
}

/**
 * 功能：初始化联系表单的提交功能 (使用Formspree服务)
 */
function initContactForm() {
  const form = document.querySelector(".contact-form form");
  if (!form) return;

  async function handleSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");
    const data = new FormData(event.target);

    // 提交期间禁用按钮并显示提示信息
    submitBtn.disabled = true;
    submitBtn.textContent = "正在提交...";
    status.textContent = "";
    status.style.color = "inherit";

    try {
      const response = await fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        status.textContent = "提交成功！感谢您的垂询，我们将尽快与您联系。";
        status.style.color = "green";
        form.reset();
      } else {
        const responseData = await response.json();
        if (Object.hasOwn(responseData, "errors")) {
          status.textContent = responseData["errors"]
            .map((error) => error["message"])
            .join(", ");
        } else {
          status.textContent = "提交失败，请稍后重试或直接致电我们。";
        }
        status.style.color = "red";
      }
    } catch (error) {
      status.textContent = "网络错误，请检查您的连接后重试。";
      status.style.color = "red";
    } finally {
      // 无论成功或失败，都恢复按钮状态
      submitBtn.disabled = false;
      submitBtn.textContent = "提交需求";
    }
  }
  form.addEventListener("submit", handleSubmit);
}

/**
 * 功能：初始化导航栏的滚动悬浮效果
 */
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

/**
 * 功能：初始化点击“查看详情”后弹出的模态框
 */
function initDetailModal() {
  const modal = document.getElementById("detail-modal");
  if (!modal) return;
  const modalBody = modal.querySelector(".modal-body");
  const closeBtn = modal.querySelector(".modal-close-btn");

  /**
   * 打开模态框并填充内容
   * @param {object} data - 从卡片的 data-* 属性获取的数据集
   */
  const openModal = (data) => {
    // 1. 解析图片数据
    const imageUrls = data.image ? data.image.split(",") : [];
    let mainImageHtml = "",
      thumbsHtml = "";
    const galleryId = `gallery-${Date.now()}`; // 为每个画廊生成唯一的ID，防止冲突

    if (imageUrls.length > 0) {
      // 主图HTML：包裹在a标签里，用于触发Fancybox
      mainImageHtml = `<a href="${imageUrls[0]}" data-fancybox="${galleryId}" data-caption="${data.title}"><img src="${imageUrls[0]}" alt="${data.title}" class="modal-main-image"></a>`;
      // 缩略图HTML
      if (imageUrls.length > 1) {
        thumbsHtml = '<div class="modal-thumb-images">';
        imageUrls.forEach((url, index) => {
          thumbsHtml += `<a href="${url}" data-fancybox="${galleryId}" data-caption="${
            data.title
          } - 图 ${index + 1}"><img src="${url}" alt="缩略图 ${
            index + 1
          }" class="${index === 0 ? "active" : ""}"></a>`;
        });
        thumbsHtml += "</div>";
      }
    }

    // 2. 解析规格数据
    const specs = JSON.parse(data.specs || "{}");
    let specsHtml = "<table>";
    for (const key in specs) {
      specsHtml += `<tr><td>${key}</td><td>${specs[key]}</td></tr>`;
    }
    specsHtml += "</table>";

    // 3. 组合最终的HTML内容
    modalBody.innerHTML = `
            <div class="modal-detail-layout">
                <div class="modal-image-gallery">${mainImageHtml}${thumbsHtml}</div>
                <div class="modal-text-content">
                    <span class="category">${data.category}</span>
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                    <div class="modal-tech-specs"><h4>技术规格</h4>${specsHtml}</div>
                    <a href="#contact" class="modal-cta-btn">咨询此方案</a>
                </div>
            </div>`;

    // 4. 显示模态框并初始化Fancybox
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // 禁止背景滚动

    // 初始化当前模态框内的Fancybox实例
    Fancybox.bind(`[data-fancybox="${galleryId}"]`, {
      // 在这里可以添加自定义配置
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: [],
          right: ["slideshow", "thumbs", "close"],
        },
      },
    });

    // 5. 为缩略图添加点击更新主图的逻辑
    const galleryContainer = modalBody.querySelector(".modal-image-gallery");
    if (galleryContainer) {
      galleryContainer.addEventListener("click", (e) => {
        const thumbLink = e.target.closest("a[data-fancybox]");
        // 确保点击的是缩略图的图片，而不是主图
        if (
          thumbLink &&
          e.target.tagName === "IMG" &&
          e.target.parentElement.parentElement.matches(".modal-thumb-images")
        ) {
          e.preventDefault(); // 阻止Fancybox立即打开，只更新主图

          const mainImage = galleryContainer.querySelector(".modal-main-image");
          mainImage.src = thumbLink.href; // 更新主图的src
          galleryContainer.querySelector("a[data-fancybox]").href =
            thumbLink.href; // 更新主图链接的href

          // 更新缩略图的选中状态
          galleryContainer
            .querySelectorAll(".modal-thumb-images img")
            .forEach((img) => img.classList.remove("active"));
          thumbLink.querySelector("img").classList.add("active");
        }
      });
    }
  };

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    if (modal.style.display === "block") {
      modal.style.display = "none";
      modalBody.innerHTML = ""; // 清空内容
      document.body.style.overflow = "auto"; // 恢复背景滚动
      if (typeof Fancybox !== "undefined") {
        Fancybox.close(); // 关闭可能打开的Fancybox实例
      }
    }
  };

  // 使用事件委托，监听所有详情触发器的点击
  document.body.addEventListener("click", (e) => {
    const trigger = e.target.closest(".view-detail-trigger");
    if (trigger) {
      const card = trigger.closest(".project-card, .equipment-card");
      if (card) {
        openModal(card.dataset);
      }
    }
  });

  // 绑定各种关闭事件
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => e.target === modal && closeModal()); // 点击遮罩层关闭
  window.addEventListener("keydown", (e) => e.key === "Escape" && closeModal()); // 按ESC键关闭
  modalBody.addEventListener(
    "click",
    (e) =>
      e.target.matches(".modal-cta-btn") &&
      e.target.getAttribute("href").startsWith("#") &&
      closeModal()
  ); // 点击模态框内的锚点链接时关闭
}

/**
 * 功能：初始化点击“查看项目视频”后弹出的视频播放模态框
 */
function initVideoModal() {
  const videoModal = document.getElementById("video-modal");
  if (!videoModal) return;
  const videoContainer = videoModal.querySelector(".video-container");
  const closeBtn = videoModal.querySelector(".modal-close-btn");

  const openModal = (videoSrc) => {
    // Bilibili视频链接需要添加 autoplay=1 参数
    if (videoSrc.includes("bilibili.com")) {
      videoSrc += "&autoplay=1";
    }
    if (videoSrc.includes("http") || videoSrc.includes("//")) {
      videoContainer.innerHTML = `<iframe src="${videoSrc}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    } else {
      videoContainer.innerHTML = `<video src="${videoSrc}" controls autoplay playsinline></video>`;
    }
    videoModal.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (videoModal.style.display === "block") {
      videoModal.style.display = "none";
      videoContainer.innerHTML = ""; // 清空iframe以停止视频播放
      document.body.style.overflow = "auto";
    }
  };

  // 使用事件委托监听所有视频链接的点击
  document.body.addEventListener("click", (e) => {
    const videoLink = e.target.closest(".case-link-video");
    if (videoLink) {
      e.preventDefault();
      const videoSrc = videoLink.dataset.videoSrc;
      if (videoSrc) openModal(videoSrc);
    }
  });

  // 绑定各种关闭事件
  closeBtn.addEventListener("click", closeModal);
  videoModal.addEventListener(
    "click",
    (e) => e.target === videoModal && closeModal()
  );
  window.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());
}

/**
 * 功能：为“发展历程”部分添加滚动进入动画
 */
function initTimelineAnimation() {
  const timelineItems = document.querySelectorAll(".timeline-item");
  if (timelineItems.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.1 }
  ); // 元素可见10%时触发

  timelineItems.forEach((item) => {
    observer.observe(item);
  });
}

/**
 * 功能：懒加载所有的 <model-viewer> 3D模型
 */
function lazyLoadModelViewers() {
  const modelViewers = document.querySelectorAll("model-viewer");
  if (modelViewers.length === 0) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const model = entry.target;
          // 确保模型有data-src属性且尚未加载
          if (model.dataset.src && !model.hasAttribute("src")) {
            model.src = model.dataset.src;
          }
          // 加载后即可停止观察
          obs.unobserve(model);
        }
      });
    },
    { rootMargin: "200px" } // 提前200px开始加载
  );

  modelViewers.forEach((viewer) => {
    // 如果模型在轮播的第一个活动幻灯片中，则立即加载，否则进行懒加载观察
    if (viewer.closest(".carousel-slide.active")) {
      if (viewer.dataset.src) viewer.src = viewer.dataset.src;
    } else {
      observer.observe(viewer);
    }
  });
}

/**
 * 功能：懒加载百度地图
 */
function initLazyLoadMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const baiduMapAK = "jjtkm0ChMcmzTPuHYhuFGCosVID54ixl"; // 你的百度地图AK

  function initializeMap() {
    if (typeof BMap !== "undefined") {
      const map = new BMap.Map("map");
      const point = new BMap.Point(119.462976, 35.37343);
      map.centerAndZoom(point, 15);
      map.enableScrollWheelZoom();
      const marker = new BMap.Marker(point);
      map.addOverlay(marker);
      const opts = { width: 200, height: 100, title: "维度智能" };
      const infoWindow = new BMap.InfoWindow(
        "地址：山东省日照市奎山街道现代路西徐州路中段",
        opts
      );
      marker.addEventListener("click", () =>
        map.openInfoWindow(infoWindow, point)
      );
    } else {
      console.error("百度地图API未能成功加载。");
    }
  }

  function loadBaiduMapScript() {
    // 定义一个全局回调函数，API加载后会调用它
    window.onBaiduMapApiLoad = initializeMap;
    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${baiduMapAK}&callback=onBaiduMapApiLoad`;
    document.body.appendChild(script);
  }

  // 使用IntersectionObserver来监听地图容器是否进入视口
  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (entries[0].isIntersecting) {
        loadBaiduMapScript();
        obs.unobserve(mapContainer); // 加载后停止观察
      }
    },
    { rootMargin: "100px 0px" }
  ); // 距离视口100px时提前加载

  observer.observe(mapContainer);
}
