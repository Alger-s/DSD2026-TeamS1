const navButtons = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.page');
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');
const profileCards = document.querySelectorAll('.profile-trigger');

// 初始状态：空数据
const createEmptyMember = (num) => ({
  avatar: '👤',
  name: `Member ${num}`,
  role: 'Role Unassigned',
  skills: 'Skills: Click to add',
  title: `Member ${num} Profile`,
  description: 'Add description here...'
});

const profileData = {
  member1: createEmptyMember(1),
  member2: createEmptyMember(2),
  member3: createEmptyMember(3),
  member4: createEmptyMember(4),
  member5: createEmptyMember(5)
};

let currentMemberKey = null;

// --- 导航逻辑 ---
function activatePage(target) {
  pages.forEach((page) => page.classList.toggle('active-page', page.id === target));
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === target);
  });
  navLinks.classList.remove('open');
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target) activatePage(target);
  });
});

menuButton?.addEventListener('click', () => navLinks.classList.toggle('open'));


// --- Members 动态编辑逻辑 ---
function updateProfile(memberKey) {
  currentMemberKey = memberKey;
  const member = profileData[memberKey];
  if (!member) return;

  document.getElementById('profileAvatar').textContent = member.avatar;
  document.getElementById('profileName').textContent = member.name;
  document.getElementById('profileRole').textContent = member.role;
  document.getElementById('profileSkills').textContent = member.skills;
  document.getElementById('profileTitle').textContent = member.title;
  document.getElementById('profileDescription').textContent = member.description;

  profileCards.forEach((card) => {
    card.classList.toggle('accent-card', card.dataset.member === memberKey);
  });
}

// 绑定卡片点击
profileCards.forEach((card) => {
  card.addEventListener('click', () => {
    updateProfile(card.dataset.member);
    document.getElementById('memberProfilePanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

// 监听文字编辑并实时保存到字典 + 缩略卡片
const editableIds = ['profileAvatar', 'profileName', 'profileRole', 'profileSkills', 'profileTitle', 'profileDescription'];
editableIds.forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', (e) => {
    if (!currentMemberKey) return;
    
    // 更新底层数据
    const keyMap = {
      profileAvatar: 'avatar', profileName: 'name', profileRole: 'role', 
      profileSkills: 'skills', profileTitle: 'title', profileDescription: 'description'
    };
    profileData[currentMemberKey][keyMap[id]] = e.target.textContent;

    // 如果修改了名称、头像或角色，实时反馈到上方网格的小卡片
    if (['profileName', 'profileRole', 'profileAvatar'].includes(id)) {
      const card = document.querySelector(`.profile-trigger[data-member="${currentMemberKey}"]`);
      if (id === 'profileName') card.querySelector('h3').textContent = e.target.textContent;
      if (id === 'profileRole') card.querySelector('.member-role-text').textContent = e.target.textContent;
      if (id === 'profileAvatar') card.querySelector('.avatar').textContent = e.target.textContent;
    }
  });
});


// --- News 动态添加逻辑 ---
function attachNewsToggleEvent(article) {
  article.querySelector('.news-toggle')?.addEventListener('click', () => {
    const icon = article.querySelector('.toggle-icon');
    article.classList.toggle('open');
    icon.textContent = article.classList.contains('open') ? '−' : '+';
  });
}

document.getElementById('addNewsBtn')?.addEventListener('click', () => {
  const dateStr = document.getElementById('newNewsDate').value || new Date().toISOString().split('T')[0];
  const title = document.getElementById('newNewsTitle').value.trim();
  const content = document.getElementById('newNewsContent').value.trim();

  if (!title) {
    alert('Please enter a news title!');
    return;
  }

  const article = document.createElement('article');
  article.className = 'card news-card expandable open'; // 默认展开
  article.innerHTML = `
    <button class="news-toggle">
      <div>
        <span class="news-date">${dateStr}</span>
        <h3>${title}</h3>
      </div>
      <span class="toggle-icon">−</span>
    </button>
    <div class="news-body">
      <p>${content}</p>
    </div>
  `;

  document.getElementById('newsList').prepend(article);
  attachNewsToggleEvent(article);
  
  // 清空表单
  document.getElementById('newNewsTitle').value = '';
  document.getElementById('newNewsContent').value = '';
});


// --- Progress 动态添加 Gantt 任务逻辑 ---
document.getElementById('addTaskBtn')?.addEventListener('click', () => {
  const name = document.getElementById('newTaskName').value.trim();
  const phase = document.getElementById('newTaskPhase').value;
  const start = parseInt(document.getElementById('newTaskStart').value) || 0;
  const width = parseInt(document.getElementById('newTaskWidth').value) || 15;

  if (!name) {
    alert('Please enter a task name!');
    return;
  }

  const targetArea = phase === '1' ? document.getElementById('phase1Area') : document.getElementById('phase2Area');
  
  // 计算 top 偏移量，基础 4px，每个已有任务增加 36px
  const existingTasks = targetArea.querySelectorAll('.task-bar').length;
  const topPos = 4 + (existingTasks * 36);

  const taskBar = document.createElement('div');
  taskBar.className = 'task-bar active-task';
  taskBar.title = name;
  taskBar.style.left = `${start}%`;
  taskBar.style.width = `${width}%`;
  taskBar.style.top = `${topPos}px`;
  taskBar.innerHTML = `<span>${name}</span>`;

  targetArea.appendChild(taskBar);

  // 清空表单
  document.getElementById('newTaskName').value = '';
});

// --- Gantt Chart Dynamic Logic ---

// 项目时间基准设置 (2026-03-25 到 2026-04-09)
const TIMELINE_START = new Date('2026-03-25T00:00:00');
const TIMELINE_END = new Date('2026-04-09T00:00:00');
const TOTAL_DAYS = (TIMELINE_END - TIMELINE_START) / (1000 * 60 * 60 * 24); // 15 days

let phaseCount = 2; // 已有2个阶段

// 辅助函数：计算日期在时间轴上的百分比位置
function calculatePercentage(dateString) {
  const targetDate = new Date(dateString + 'T00:00:00');
  let diffDays = (targetDate - TIMELINE_START) / (1000 * 60 * 60 * 24);
  
  // 限制在图表范围内 [0, 15]
  diffDays = Math.max(0, Math.min(diffDays, TOTAL_DAYS));
  return (diffDays / TOTAL_DAYS) * 100;
}

// 辅助函数：计算天数对应的百分比宽度
function calculateWidthPercentage(days) {
  return (days / TOTAL_DAYS) * 100;
}

// 初始化 Today Line
function updateTodayLine() {
  const todayLine = document.getElementById('todayLine');
  if (!todayLine) return;
  
  // 获取当前实际日期
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // 如果当前时间不在项目周期内，为了演示效果，可以将其锁定在 03-31
  let dateToUse = todayStr;
  if (now < TIMELINE_START || now > TIMELINE_END) {
    dateToUse = '2026-03-31'; // Demo 默认位置
  }

  const leftPercent = calculatePercentage(dateToUse);
  todayLine.style.left = `${leftPercent}%`;
}

// 动态添加 Phase
document.getElementById('addPhaseBtn')?.addEventListener('click', () => {
  const phaseName = document.getElementById('newPhaseName').value.trim();
  if (!phaseName) return alert('Please enter a phase name!');

  phaseCount++;
  const areaId = `phase${phaseCount}Area`;
  const scheduleGrid = document.getElementById('scheduleGrid');

  // 创建 Phase 标题块
  const phaseDiv = document.createElement('div');
  phaseDiv.className = `phase phase-bg-${(phaseCount % 2 === 0) ? '2' : '1'} editable-field`;
  phaseDiv.contentEditable = "true";
  phaseDiv.textContent = phaseName;

  // 创建 对应的 Chart Area
  const chartAreaDiv = document.createElement('div');
  chartAreaDiv.className = 'chart-area';
  chartAreaDiv.id = areaId;

  scheduleGrid.appendChild(phaseDiv);
  scheduleGrid.appendChild(chartAreaDiv);

  // 同步到 Task 表单的下拉菜单
  const selectMenu = document.getElementById('newTaskPhase');
  const newOption = document.createElement('option');
  newOption.value = areaId;
  newOption.textContent = phaseName;
  selectMenu.appendChild(newOption);

  document.getElementById('newPhaseName').value = '';
});

// 动态添加 Task
function createTask(name, phaseId, startDateStr, durationDays, isActive = false) {
  const targetArea = document.getElementById(phaseId);
  if (!targetArea) return;

  const leftPercent = calculatePercentage(startDateStr);
  const widthPercent = calculateWidthPercentage(durationDays);
  
  // 计算纵向位置：每个已有任务往下偏移 40px
  const existingTasks = targetArea.querySelectorAll('.task-bar').length;
  const topPos = 8 + (existingTasks * 40); 

  const taskBar = document.createElement('div');
  taskBar.className = `task-bar ${isActive ? 'active-task' : ''}`;
  taskBar.title = `${name} (${startDateStr}, ${durationDays} days)`;
  taskBar.style.left = `${leftPercent}%`;
  taskBar.style.width = `${widthPercent}%`;
  taskBar.style.top = `${topPos}px`;
  taskBar.innerHTML = `<span>${name}</span>`;

  targetArea.appendChild(taskBar);
}

document.getElementById('addTaskBtn')?.addEventListener('click', () => {
  const name = document.getElementById('newTaskName').value.trim();
  const phaseId = document.getElementById('newTaskPhase').value;
  const start = document.getElementById('newTaskStart').value;
  const days = parseInt(document.getElementById('newTaskDays').value);

  if (!name || !start || isNaN(days) || days <= 0) {
    return alert('Please fill in all task fields correctly!');
  }

  createTask(name, phaseId, start, days, true);

  // 清空部分输入
  document.getElementById('newTaskName').value = '';
  document.getElementById('newTaskDays').value = '';
});

// 初始化静态展示任务
window.addEventListener('DOMContentLoaded', () => {
  updateTodayLine();
  // 渲染初始任务
  createTask('Tech Stack Planning', 'phase1Area', '2026-03-25', 2);
  createTask('Static Server & Routing', 'phase1Area', '2026-03-27', 3);
  createTask('Markdown Parsing Engine', 'phase1Area', '2026-03-29', 3, true);
  createTask('CI/CD Pipeline', 'phase2Area', '2026-03-25', 4);
  createTask('Testing & Integration', 'phase2Area', '2026-04-01', 5);
});
