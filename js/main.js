// ===== DOM元素缓存 =====
const mobileToggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelector(".nav-links");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const filterBtns = document.querySelectorAll(".filter-btn");
const contactForm = document.getElementById("contactForm");
const roiForm = document.getElementById("roiForm");
const calculateBtn = document.getElementById("calculate-btn");
const arViewBtn = document.getElementById("ar-view");
const navbar = document.querySelector(".navbar");

// ===== 移动端导航切换 =====
function initMobileMenu() {
  mobileToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    mobileToggle.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });
}

// ===== 平滑滚动 =====
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth",
      });

      // 移动端点击后关闭菜单
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  });
}

// ===== 解决方案选项卡 =====
function initSolutionTabs() {
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");

      // 更新按钮状态
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 更新内容显示
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === tabId) {
          content.classList.add("active");
        }
      });
    });
  });
}

// ===== 项目筛选功能 =====
function initProjectFilter() {
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 更新按钮状态
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 实现筛选功能
      const category = btn.textContent.trim();

      projectCards.forEach((card) => {
        const cardCategory = card
          .querySelector(".project-category")
          .textContent.trim();
        const show = category === "全部" || cardCategory === category;
        card.style.display = show ? "block" : "none";
      });
    });
  });
}

// ===== ROI计算器 =====
class ROIcalculator {
  constructor() {
    this.form = document.getElementById("roiForm");
    this.results = {
      laborSaving: document.getElementById("labor-saving"),
      outputGain: document.getElementById("output-gain"),
      roiResult: document.getElementById("roi-result"),
    };
    this.initEvents();
  }

  initEvents() {
    calculateBtn.addEventListener("click", () => this.calculate());
  }

  calculate() {
    const data = {
      laborCost: parseFloat(document.getElementById("labor-cost").value) || 0,
      currentOutput:
        parseFloat(document.getElementById("current-output").value) || 0,
      targetOutput:
        parseFloat(document.getElementById("target-output").value) || 0,
    };

    // 核心计算逻辑（示例算法，需根据实际业务调整）
    const laborSaving = data.laborCost * 0.65; // 根据行业经验值估算
    const outputIncrease = (data.targetOutput - data.currentOutput) * 12000; // 假设单位产品利润
    const annualBenefit = laborSaving + outputIncrease;
    const roiMonths = ((1000000 / annualBenefit) * 12).toFixed(1); // 假设设备投资100万

    // 更新显示
    this.results.laborSaving.textContent = laborSaving.toLocaleString();
    this.results.outputGain.textContent = outputIncrease.toLocaleString();
    this.results.roiResult.textContent = roiMonths;
  }
}

// ===== 表单提交处理 =====
function initForms() {
  // 联系表单
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // 这里添加表单验证逻辑
      const formData = new FormData(this);

      // 模拟提交成功
      alert("您的需求已提交，我们将尽快与您联系！");
      this.reset();

      // 实际项目中这里应该是AJAX提交
      // fetch('/api/contact', { method: 'POST', body: formData })
      //   .then(response => response.json())
      //   .then(data => { ... });
    });
  }
}

// ===== AR查看功能 =====
function initARViewer() {
  if (arViewBtn) {
    arViewBtn.addEventListener("click", () => {
      // 这里应该激活model-viewer的AR模式
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer && modelViewer.activateAR) {
        modelViewer.activateAR();
      } else {
        alert("请在移动设备上使用AR功能");
      }
    });
  }
}

// ===== 导航滚动效果 =====
function initNavbarScroll() {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
    } else {
      navbar.style.boxShadow = "none";
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    }
  });
}

// ===== 模态框详情页功能 =====
// main.js

// ===== 模态框详情页功能 (更新版) =====
function initDetailModal() {
  const modal = document.getElementById("detail-modal");
  if (!modal) return;

  const modalBody = modal.querySelector(".modal-body");
  const closeBtn = modal.querySelector(".modal-close-btn");

  document.body.addEventListener("click", (e) => {
    // 1. 找到被点击的触发器
    const trigger = e.target.closest(".view-detail-trigger");

    if (trigger) {
      // 2. 从触发器向上找到最近的卡片容器
      const card = trigger.closest(".project-card, .equipment-card");

      // 3. 如果找到了卡片容器，就从它身上获取数据
      if (card) {
        openModal(card.dataset);
      }
    }
  });

  // 打开模态框函数 (这个函数保持不变)
  // main.js -> initDetailModal() 函数内

  // 打开模态框函数 (重构版，集成Fancybox)
  const openModal = (data) => {
    // 1. 解析图片数据
    const imageUrls = data.image ? data.image.split(",") : [];
    let mainImageHtml = "";
    let thumbsHtml = "";
    const galleryId = `gallery-${Date.now()}`; // 为每个画廊生成一个唯一的ID

    if (imageUrls.length > 0) {
      // 主图区域：显示第一张图，并让它可以被Fancybox触发
      mainImageHtml = `
            <a href="${imageUrls[0]}" data-fancybox="${galleryId}" data-caption="${data.title}">
                <img src="${imageUrls[0]}" alt="${data.title}" class="modal-main-image">
            </a>
        `;

      // 缩略图区域
      if (imageUrls.length > 1) {
        thumbsHtml = '<div class="modal-thumb-images">';
        imageUrls.forEach((url, index) => {
          // 每个缩略图都是一个指向大图的链接，并属于同一个画廊
          thumbsHtml += `
                    <a href="${url}" data-fancybox="${galleryId}" data-caption="${
            data.title
          } - 图 ${index + 1}">
                        <img src="${url}" alt="缩略图 ${index + 1}" class="${
            index === 0 ? "active" : ""
          }">
                    </a>
                `;
        });
        thumbsHtml += "</div>";
      }
    }

    // 2. 解析规格数据 (这部分不变)
    const specs = JSON.parse(data.specs || "{}");
    let specsHtml = "<table>";
    for (const key in specs) {
      specsHtml += `<tr><td>${key}</td><td>${specs[key]}</td></tr>`;
    }
    specsHtml += "</table>";

    // 3. 生成完整的模态框内容HTML
    modalBody.innerHTML = `
        <div class="modal-detail-layout">
            <div class="modal-image-gallery">
                ${mainImageHtml}
                ${thumbsHtml}
            </div>
            <div class="modal-text-content">
                <span class="category">${data.category}</span>
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                <div class="modal-tech-specs">
                    <h4>技术规格</h4>
                    ${specsHtml}
                </div>
                <a href="#contact" class="modal-cta-btn">咨询此方案</a>
            </div>
        </div>
    `;

    // 4. 显示模态框并初始化Fancybox
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

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

    // 更新缩略图的active状态
    const galleryContainer = modalBody.querySelector(".modal-image-gallery");
    galleryContainer.addEventListener("click", (e) => {
      const thumbLink = e.target.closest("a[data-fancybox]");
      if (thumbLink) {
        // 阻止默认的fancybox打开行为，因为我们只想更新主图
        // e.preventDefault();

        const mainImage = galleryContainer.querySelector(".modal-main-image");
        mainImage.src = thumbLink.href; // 更新主图src

        // 更新主图外层a标签的href，以便点击主图能打开正确的图片
        const mainImageLink =
          galleryContainer.querySelector("a[data-fancybox]");
        mainImageLink.href = thumbLink.href;

        // 更新缩略图的 active 状态
        galleryContainer
          .querySelectorAll(".modal-thumb-images img")
          .forEach((img) => img.classList.remove("active"));
        thumbLink.querySelector("img").classList.add("active");
      }
    });
  };

  // 关闭模态框函数 (这个函数保持不变)
  const closeModal = () => {
    modal.style.display = "none";
    modalBody.innerHTML = "";
    document.body.style.overflow = "auto";
  };

  // 绑定关闭事件 (这些保持不变)
  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });

  modalBody.addEventListener("click", (e) => {
    if (
      e.target.matches(".modal-cta-btn") &&
      e.target.getAttribute("href").startsWith("#")
    ) {
      closeModal();
    }
  });
}

// ===== 视频播放模态框功能 =====
function initVideoModal() {
  const videoModal = document.getElementById("video-modal");
  if (!videoModal) return;

  const videoContainer = videoModal.querySelector(".video-container");
  const closeBtn = videoModal.querySelector(".modal-close-btn");

  document.body.addEventListener("click", (e) => {
    const videoLink = e.target.closest(".case-link-video");
    if (videoLink) {
      e.preventDefault(); // 阻止 a 标签的默认跳转行为
      const videoSrc = videoLink.dataset.videoSrc;

      if (videoSrc) {
        // 判断是第三方平台链接还是本地视频
        if (videoSrc.includes("http") || videoSrc.includes("//")) {
          // 方案二：嵌入iframe
          videoContainer.innerHTML = `<iframe src="${videoSrc}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        } else {
          // 方案一：播放本地视频
          videoContainer.innerHTML = `<video src="${videoSrc}" controls autoplay playsinline></video>`;
        }
        videoModal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    }
  });

  // 关闭函数
  const closeModal = () => {
    videoModal.style.display = "none";
    videoContainer.innerHTML = ""; // 停止播放并清空内容，非常重要！
    document.body.style.overflow = "auto";
  };

  closeBtn.addEventListener("click", closeModal);
  videoModal.addEventListener("click", (e) => {
    if (e.target === videoModal) {
      closeModal();
    }
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModal.style.display === "block") {
      closeModal();
    }
  });
}

// ===== 页面加载初始化 =====
document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initSmoothScrolling();
  initSolutionTabs();
  initProjectFilter();
  new ROIcalculator();
  initForms();
  initARViewer();
  initNavbarScroll();
  lazyLoadModelViewer();
  initDetailModal(); // 初始化模态框功能
  initVideoModal(); // 添初始化视频模态框功能
  // 可以在这里添加其他初始化函数
});

// ===== 视差效果（可选） =====
function initParallax() {
  const hero = document.querySelector(".hero");
  if (hero) {
    window.addEventListener("scroll", function () {
      const scrollPosition = window.pageYOffset;
      hero.style.backgroundPositionY = scrollPosition * 0.5 + "px";
    });
  }
}

// 如果需要视差效果，取消下面的注释
// initParallax();

// 懒加载 (Lazy Loading)
function lazyLoadModelViewer() {
  const modelViewer = document.querySelector("model-viewer");
  if (!modelViewer) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const model = entry.target;
          model.src = model.dataset.src;
          obs.unobserve(model); // 加载后停止观察
        }
      });
    },
    { rootMargin: "200px" }
  ); // 提前200px开始加载

  observer.observe(modelViewer);
}

// Formspree.io 发送邮件服务

var form = document.getElementById("my-form");

async function handleSubmit(event) {
  event.preventDefault();
  var status = document.getElementById("my-form-status");
  var data = new FormData(event.target);
  fetch(event.target.action, {
    method: form.method,
    body: data,
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        status.innerHTML = "Thanks for your submission!";
        form.reset();
      } else {
        response.json().then((data) => {
          if (Object.hasOwn(data, "errors")) {
            status.innerHTML = data["errors"]
              .map((error) => error["message"])
              .join(", ");
          } else {
            status.innerHTML = "Oops! There was a problem submitting your form";
          }
        });
      }
    })
    .catch((error) => {
      status.innerHTML = "Oops! There was a problem submitting your form";
    });
}
form.addEventListener("submit", handleSubmit);
