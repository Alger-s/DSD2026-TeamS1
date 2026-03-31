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
