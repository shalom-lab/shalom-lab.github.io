// 渲染项目卡片
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';

    projects.forEach(project => {
        // 将关键词字符串转换为数组
        const keywords = project.keywords.split(',').map(k => k.trim());
        
        // 创建关键词HTML
        const keywordsHtml = keywords.map(keyword => 
            `<span class="keyword">${keyword}</span>`
        ).join('');

        // 创建星级评分HTML
        const starsHtml = Array(5).fill(0).map((_, i) => 
            i < project.stars 
                ? '<i class="fas fa-star"></i>' 
                : '<i class="far fa-star"></i>'
        ).join('');

        // 创建项目卡片
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.category = project.category;
        
        card.innerHTML = `
            <img src="${project.image || 'https://picsum.photos/300/200'}" alt="${project.title}" class="project-image">
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-keywords">${keywordsHtml}</div>
                <div class="project-meta">
                    <span class="project-category"></span>
                    <span class="project-stars">${starsHtml}</span>
                </div>
                <a href="${project.link}" target="_blank" class="project-link">查看项目</a>
            </div>
        `;
        
        projectsGrid.appendChild(card);
    });
}

// 获取所有唯一的项目类别
function getCategories(projects) {
    const categories = new Set();
    projects.forEach(project => categories.add(project.category));
    return Array.from(categories);
}

// 渲染过滤按钮
function renderFilterButtons(categories) {
    const filterContainer = document.querySelector('.filter-container');
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = category;
        btn.dataset.category = category;
        
        btn.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // 添加当前按钮的活动状态
            this.classList.add('active');
            
            // 过滤项目
            filterProjects(category);
        });
        
        filterContainer.appendChild(btn);
    });
}

// 根据类别过滤项目
function filterProjects(category) {
    const projects = document.querySelectorAll('.project-card');
    
    projects.forEach(project => {
        if (category === 'all' || project.dataset.category === category) {
            project.classList.remove('hidden');
        } else {
            project.classList.add('hidden');
        }
    });
}

// 从JSON文件加载项目数据
async function loadProjectData() {
    try {
        // 显示加载中状态
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = '<div class="loader"></div>';
        
        const response = await fetch('./data-raw/projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        
        // 按星级和时间戳排序（先按星级降序，然后按时间戳降序）
        projects.sort((a, b) => {
            if (b.stars !== a.stars) {
                return b.stars - a.stars;
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // 渲染项目卡片
        renderProjects(projects);
        
        // 获取并渲染过滤按钮
        const categories = getCategories(projects);
        renderFilterButtons(categories);
        
        // 添加全部按钮的点击事件
        document.querySelector('.filter-btn[data-category="all"]').addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProjects('all');
        });
    } catch (error) {
        console.error('Error loading project data:', error);
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>加载项目数据时出错。请稍后再试。</p>
                <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', loadProjectData); 