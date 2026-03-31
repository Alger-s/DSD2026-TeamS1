const navButtons = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.page');
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');
const profileCards = document.querySelectorAll('.profile-trigger');
const expandableCards = document.querySelectorAll('.expandable');

// --- 1. Members Profile Logic ---
const profileData = {
  derui: {
    avatar: '🧑‍💻',
    name: 'Derui Tang',
    role: 'Role: Home Page Developer / Admin',
    skills: 'Skills: GitHub Actions, Vibe Coding',
    title: 'Derui Tang Profile',
    description: 'My name is Derui Tang. I am currently an undergraduate student at Jilin University. I am interested in vibe coding and algorithms. Besides study, football is my favourite. I used to play for my middle school as a center back. I am also a fan of Tottenham Hotspur. Cristiano Ronaldo is the GOAT in my option.'
  },
  yuxuan: {
    avatar: '👨‍🔧',
    name: 'Yuxuan Li',
    role: 'Role: Firmware Programmer',
    skills: 'Skills: Embedded C, Sensor Calibration, Debugging',
    title: 'Yuxuan Li Profile',
    description: 'My name is Yuxuan Li. I am responsible for firmware implementation and joint angle calibration. I enjoy embedded systems and hardware debugging. In this project, I focus on reliable sampling, signal processing, and testing the sensor side workflow.'
  },
  wenhao: {
    avatar: '👨‍💻',
    name: 'Wenhao Zhang',
    role: 'Role: Hardware Programmer',
    skills: 'Skills: MCU Integration, Hardware Drivers, Serial Communication',
    title: 'Wenhao Zhang Profile',
    description: 'My name is Wenhao Zhang. I work on hardware drivers and microcontroller integration. I like working with low-level systems and solving interface problems between hardware and software. In Team S1, I mainly support board bring-up and communication testing.'
  },
  lin: {
    avatar: '👩‍📊',
    name: 'Lin Chen',
    role: 'Role: Project Manager',
    skills: 'Skills: Sprint Planning, Coordination, Documentation',
    title: 'Lin Chen Profile',
    description: 'My name is Lin Chen. I serve as the project manager of Team S1. My main work is to coordinate tasks, track milestones, and communicate with instructors. I care about team rhythm, clear documentation, and keeping everyone aligned during Sprint 1.'
  },
  miguel: {
    avatar: '🌍',
    name: 'Miguel Silva',
    role: 'Role: Shadow PM / System Architect',
    skills: 'Skills: Protocol Design, Cross-time-zone Collaboration, Interface Definition',
    title: 'Miguel Silva Profile',
    description: 'My name is Miguel Silva. I am from Portugal and I support the team as shadow PM and system architect. I focus on protocol structure, interface definition, and coordination across time zones. I enjoy collaborative software development and clean system design.'
  }
};

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

// --- 2. News Logic (Expand/Collapse) ---
expandableCards.forEach((card) => {
  card.querySelector('.news-toggle')?.addEventListener('click', () => {
    const icon = card.querySelector('.toggle-icon');
    card.classList.toggle('open');
    icon.textContent = card.classList.contains('open') ? '−' : '+';
  });
});

// --- 3. Gantt Chart Logic (Static Render & Auto-Height) ---
const TIMELINE_START = new Date('2026-03-25T00:00:00');
const TIMELINE_END = new Date('2026-04-09T00:00:00');
const TOTAL_DAYS = (TIMELINE_END - TIMELINE_START) / (1000 * 60 * 60 * 24); 

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

function recalculateAreaHeights() {
  const areas = document.querySelectorAll('.chart-area');
  areas.forEach(area => {
    const tasks = area.querySelectorAll('.task-bar');
    tasks.forEach((task, index) => {
      task.style.top = `${8 + (index * 40)}px`;
    });
    const requiredHeight = 16 + (tasks.length * 40);
    area.style.minHeight = `${Math.max(80, requiredHeight)}px`;
  });
}

// 静态渲染任务函数
function createTask(name, phaseId, startDateStr, durationDays, isActive = false) {
  const targetArea = document.getElementById(phaseId);
  if (!targetArea) return;

  const taskBar = document.createElement('div');
  taskBar.className = `task-bar ${isActive ? 'active-task' : ''}`;
  taskBar.title = `${name} (${startDateStr}, ${durationDays} days)`;
  
  taskBar.style.left = `${calculatePercentage(startDateStr)}%`;
  taskBar.style.width = `${calculateWidthPercentage(durationDays)}%`;
  taskBar.innerHTML = `<span>${name}</span>`;

  targetArea.appendChild(taskBar);
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  updateTodayLine();
  
  // ==========================================
  // 在这里静态配置所有的 Gantt 任务：
  // 参数：(任务名称, 所属Phase区域ID, 开始日期, 持续天数, 是否高亮)
  // ==========================================
  createTask('Tech Stack Planning', 'phase1Area', '2026-03-25', 2);
  createTask('Static Server & Routing', 'phase1Area', '2026-03-27', 3);
  createTask('Markdown Parsing Engine', 'phase1Area', '2026-03-29', 3, true);
  
  createTask('CI/CD Pipeline', 'phase2Area', '2026-03-25', 4);
  createTask('Testing & Integration', 'phase2Area', '2026-04-01', 5);

  // 最后计算高度以防止重叠
  recalculateAreaHeights();
});
