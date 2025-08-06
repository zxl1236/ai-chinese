/**
 * 学习中心页面组件
 * 包含基础能力训练、阅读理解训练、写作表达训练等模块
 */
class StudyPage {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('study-section');
    this.onCourseSelect = options.onCourseSelect || null;
  }

  render() {
    const studyHTML = `
      <!-- 基础能力训练 -->
      <div class="section-title">基础能力训练</div>
      <div class="card-grid">
        <div class="card clickable" data-course="vocabulary">
          <div class="card-icon">🔤</div>
          <div class="card-text">字词基础</div>
        </div>
        <div class="card clickable" data-course="grammar">
          <div class="card-icon">🗣️</div>
          <div class="card-text">语言规范</div>
        </div>
        <div class="card clickable" data-course="rhetoric">
          <div class="card-icon">🎭</div>
          <div class="card-text">修辞基础</div>
        </div>
        <div class="card clickable" data-course="classical">
          <div class="card-icon">🏛️</div>
          <div class="card-text">古文基础</div>
        </div>
      </div>

      <!-- 阅读理解训练 -->
      <div class="section-title">阅读理解训练</div>
      <div class="reading-grid">
        <div class="reading-card clickable" data-course="modern-reading">
          <div class="card-icon">📰</div>
          <div class="card-text">现代文</div>
        </div>
        <div class="reading-card clickable" data-course="narrative">
          <div class="card-icon">📖</div>
          <div class="card-text">记叙文</div>
        </div>
        <div class="reading-card clickable" data-course="expository">
          <div class="card-icon">📊</div>
          <div class="card-text">说明文</div>
        </div>
        <div class="reading-card clickable" data-course="novel">
          <div class="card-icon">📚</div>
          <div class="card-text">小说</div>
        </div>
        <div class="reading-card clickable" data-course="argumentative">
          <div class="card-icon">💬</div>
          <div class="card-text">议论文</div>
        </div>
        <div class="reading-card clickable" data-course="poetry">
          <div class="card-icon">✒️</div>
          <div class="card-text">诗</div>
        </div>
        <div class="reading-card clickable" data-course="ci">
          <div class="card-icon">🖋️</div>
          <div class="card-text">词</div>
        </div>
        <div class="reading-card clickable" data-course="classical-chinese">
          <div class="card-icon">📜</div>
          <div class="card-text">文言文</div>
        </div>
        <div class="reading-card clickable" data-course="discontinuous">
          <div class="card-icon">📑</div>
          <div class="card-text">非连续性文体阅读</div>
        </div>
      </div>

      <!-- 写作表达训练 -->
      <div class="section-title">写作表达训练</div>
      <div class="writing-grid">
        <div class="writing-card clickable" data-course="full-title-writing">
          <div class="card-icon">📋</div>
          <div class="card-text">全命题作文</div>
        </div>
        <div class="writing-card clickable" data-course="semi-title-writing">
          <div class="card-icon">📝</div>
          <div class="card-text">半命题作文</div>
        </div>
        <div class="writing-card clickable" data-course="topic-writing">
          <div class="card-icon">💭</div>
          <div class="card-text">话题作文</div>
        </div>
        <div class="writing-card clickable" data-course="material-writing">
          <div class="card-icon">📄</div>
          <div class="card-text">材料作文</div>
        </div>
        <div class="writing-card clickable" data-course="practical-writing">
          <div class="card-icon">📧</div>
          <div class="card-text">应用文写作</div>
        </div>
        <div class="writing-card clickable" data-course="writing-skills">
          <div class="card-icon">💡</div>
          <div class="card-text">写作技巧</div>
        </div>
      </div>
    `;

    if (this.container) {
      this.container.innerHTML = studyHTML;
      this.bindEvents();
      this.initAnimations();
    }

    return this.container;
  }

  bindEvents() {
    // 绑定所有可点击卡片的事件
    const clickableCards = this.container.querySelectorAll('.clickable');
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const course = card.getAttribute('data-course');
        this.handleCourseSelect(course, card);
      });
    });
  }

  handleCourseSelect(course, card) {
    // 添加点击动效
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);

    console.log('选择课程:', course);

    // 如果是写作题材，跳转到写作模块
    if (course.includes('-writing') || course.includes('title-writing') || course.includes('topic-writing') || course.includes('material-writing') || course.includes('practical-writing') || course.includes('writing-skills')) {
      // 根据课程类型设置对应的分类
      let category = '全命题作文';
      if (course.includes('full-title')) category = '全命题作文';
      else if (course.includes('semi-title')) category = '半命题作文';
      else if (course.includes('topic')) category = '话题作文';
      else if (course.includes('material')) category = '材料作文';
      else if (course.includes('practical')) category = '应用文';
      
      window.location.href = `src/writing-module/writing.html?category=${encodeURIComponent(category)}`;
      return;
    }

    if (this.onCourseSelect) {
      this.onCourseSelect(course);
    }
  }

  initAnimations() {
    // 页面加载动画
    const sections = this.container.querySelectorAll('.card-grid, .reading-grid, .writing-grid');
    sections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        section.style.transition = 'all 0.5s ease';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudyPage;
} else {
  window.StudyPage = StudyPage;
}