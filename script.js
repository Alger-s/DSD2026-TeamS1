const navButtons = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.page');
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');
const profileCards = document.querySelectorAll('.profile-trigger');

// --- 1. Members Profile Logic ---
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

profileCards.forEach((card) => {
  card.addEventListener('click', () => {
    updateProfile(card.dataset.member);
    document.getElementById('memberProfilePanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

const editableIds = ['profileAvatar', 'profileName', 'profileRole', 'profileSkills', 'profileTitle', 'profileDescription'];
editableIds.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', (e) => {
    if (!currentMemberKey) return;
    const keyMap = {
      profileAvatar: 'avatar', profileName: 'name', profileRole: 'role', 
      profileSkills: 'skills', profileTitle: 'title', profileDescription: 'description'
    };
    profileData[currentMemberKey][keyMap[id]] = e.target.textContent;

    if (['profileName', 'profileRole', 'profileAvatar'].includes(id)) {
      const card = document.querySelector(`.profile-trigger[data-member="${currentMemberKey}"]`);
      if (id === 'profileName') card.querySelector('h3').textContent = e.target.textContent;
      if (id === 'profileRole') card.querySelector('.member-role-text').textContent = e.target.textContent;
      if (id === 'profileAvatar') card.querySelector('.avatar').textContent = e.target.textContent;
    }
  });
});

// --- 2. News Logic ---
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

  if (!title) return alert('Please enter a news title!');

  const article = document.createElement('article');
  article.className = 'card news-card expandable open';
  article.innerHTML = `
    <button class="news-toggle">
      <div><span class="news-date">${dateStr}</span><h3>${title}</h3></div>
      <span class="toggle-icon">−</span>
    </button>
    <div class="news-body"><p>${content}</p></div>
  `;

  document.getElementById('newsList').prepend(article);
  attachNewsToggleEvent(article);
  
  document.getElementById('newNewsTitle').value = '';
  document.getElementById('newNewsContent').value = '';
});


// --- 3. Gantt Chart Dynamic Logic (Editable & Auto-Height) ---
const TIMELINE_START = new Date('2026-03-25T00:00:00');
const TIMELINE_END = new Date('2026-04-09T00:00:00');
const TOTAL_DAYS = (TIMELINE_END - TIMELINE_START) / (1000 * 60 * 60 * 24); 

let phaseCount = 2; 
let currentEditTask = null; // 追踪当前正在编辑的任务

function calculatePercentage(dateString) {
  const targetDate = new Date(dateString + 'T00:00:00');
  let diffDays = (targetDate - TIMELINE_START) / (1000 * 60 * 60 * 24);
  diffDays = Math.max(0, Math.min(diffDays, TOTAL_DAYS));
  return (diffDays / TOTAL_DAYS) * 100;
}

function calculateWidthPercentage(days) {
  return (days / TOTAL_DAYS) * 100;
}

function updateTodayLine() {
  const todayLine = document.getElementById('todayLine');
  if (!todayLine) return;
  const now = new Date();
  let dateToUse = now.toISOString().split('T')[0];
  if (now < TIMELINE_START || now > TIMELINE_END) dateToUse = '2026-03-31';
  todayLine.style.left = `${calculatePercentage(dateToUse)}%`;
}

// 核心：动态计算高度并重排任务，解决重叠问题
function recalculateAreaHeights() {
  const areas = document.querySelectorAll('.chart-area');
  areas.forEach(area => {
    const tasks = area.querySelectorAll('.task-bar');
    tasks.forEach((task, index) => {
      // 保证每个任务独立占一行，纵向错开 40px
      task.style.top = `${8 + (index * 40)}px`;
    });
    // 根据任务数量撑大背景高度
    const requiredHeight = 16 + (tasks.length * 40);
    area.style.minHeight = `${Math.max(80, requiredHeight)}px`;
  });
}

document.getElementById('addPhaseBtn')?.addEventListener('click', () => {
  const phaseName = document.getElementById('newPhaseName').value.trim();
  if (!phaseName) return alert('Please enter a phase name!');

  phaseCount++;
  const areaId = `phase${phaseCount}Area`;
  const scheduleGrid = document.getElementById('scheduleGrid');

  const phaseDiv = document.createElement('div');
  phaseDiv.className = `phase phase-bg-${(phaseCount % 2 === 0) ? '2' : '1'} editable-field`;
  phaseDiv.contentEditable = "true";
  phaseDiv.textContent = phaseName;

  const chartAreaDiv = document.createElement('div');
  chartAreaDiv.className = 'chart-area';
  chartAreaDiv.id = areaId;

  scheduleGrid.appendChild(phaseDiv);
  scheduleGrid.appendChild(chartAreaDiv);

  const selectMenu = document.getElementById('newTaskPhase');
  const newOption = document.createElement('option');
  newOption.value = areaId;
  newOption.textContent = phaseName;
  selectMenu.appendChild(newOption);

  document.getElementById('newPhaseName').value = '';
});

// 生成/添加任务
function createTask(name, phaseId, startDateStr, durationDays, isActive = false) {
  const targetArea = document.getElementById(phaseId);
  if (!targetArea) return;

  const taskBar = document.createElement('div');
  taskBar.className = `task-bar ${isActive ? 'active-task' : ''}`;
  
  // 绑定数据用于后续编辑
  taskBar.dataset.name = name;
  taskBar.dataset.start = startDateStr;
  taskBar.dataset.days = durationDays;
  taskBar.title = `Click to edit: ${name}`;

  taskBar.style.left = `${calculatePercentage(startDateStr)}%`;
  taskBar.style.width = `${calculateWidthPercentage(durationDays)}%`;
  taskBar.innerHTML = `<span>${name}</span>`;

  // 点击事件：呼出编辑弹窗
  taskBar.addEventListener('click', () => {
    currentEditTask = taskBar;
    document.getElementById('editTaskName').value = taskBar.dataset.name;
    document.getElementById('editTaskStart').value = taskBar.dataset.start;
    document.getElementById('editTaskDays').value = taskBar.dataset.days;
    document.getElementById('editTaskModal').classList.remove('hidden');
  });

  targetArea.appendChild(taskBar);
  recalculateAreaHeights(); // 重排布局，防止重叠
}

document.getElementById('addTaskBtn')?.addEventListener('click', () => {
  const name = document.getElementById('newTaskName').value.trim();
  const phaseId = document.getElementById('newTaskPhase').value;
  const start = document.getElementById('newTaskStart').value;
  const days = parseInt(document.getElementById('newTaskDays').value);

  if (!name || !start || isNaN(days) || days <= 0) return alert('Please fill in all task fields correctly!');

  createTask(name, phaseId, start, days, true);

  document.getElementById('newTaskName').value = '';
  document.getElementById('newTaskDays').value = '';
});

// --- Modal Action Logic ---
document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
  document.getElementById('editTaskModal').classList.add('hidden');
  currentEditTask = null;
});

document.getElementById('deleteTaskBtn')?.addEventListener('click', () => {
  if (!currentEditTask) return;
  currentEditTask.remove(); // 移除 DOM
  document.getElementById('editTaskModal').classList.add('hidden');
  currentEditTask = null;
  recalculateAreaHeights(); // 缩窄背景高度
});

document.getElementById('saveTaskBtn')?.addEventListener('click', () => {
  if (!currentEditTask) return;
  const newName = document.getElementById('editTaskName').value.trim();
  const newStart = document.getElementById('editTaskStart').value;
  const newDays = parseInt(document.getElementById('editTaskDays').value);

  if (!newName || !newStart || isNaN(newDays) || newDays <= 0) {
    return alert('Please fill all fields correctly!');
  }

  // 更新底层数据
  currentEditTask.dataset.name = newName;
  currentEditTask.dataset.start = newStart;
  currentEditTask.dataset.days = newDays;

  // 更新视觉呈现
  currentEditTask.querySelector('span').textContent = newName;
  currentEditTask.style.left = `${calculatePercentage(newStart)}%`;
  currentEditTask.style.width = `${calculateWidthPercentage(newDays)}%`;
  currentEditTask.title = `Click to edit: ${newName}`;

  document.getElementById('editTaskModal').classList.add('hidden');
  currentEditTask = null;
});

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  updateTodayLine();
  createTask('Tech Stack Planning', 'phase1Area', '2026-03-25', 2);
  createTask('Static Server & Routing', 'phase1Area', '2026-03-27', 3);
  createTask('Markdown Parsing Engine', 'phase1Area', '2026-03-29', 3, true);
  createTask('CI/CD Pipeline', 'phase2Area', '2026-03-25', 4);
  createTask('Testing & Integration', 'phase2Area', '2026-04-01', 5);
});
