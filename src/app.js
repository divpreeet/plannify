        // Project presets
        const projectPresets = {
            'web-app': ['Frontend Development', 'Backend Development', 'Database Design', 'UI/UX Design', 'Testing'],
            'mobile-app': ['UI Design', 'Frontend Development', 'Backend Integration', 'Native Features', 'App Store Submission'],
            'desktop-app': ['UI Design', 'Core Functionality', 'Installer Creation', 'Cross-platform Testing', 'Distribution']
        };

        // DOM Elements
        const header = document.getElementById('header');
        const projectForm = document.getElementById('project-form');
        const projectList = document.getElementById('project-list');
        const projectTypeSelect = document.getElementById('project-type');
        const tasksContainer = document.getElementById('tasks-container');
        const tasksList = document.getElementById('tasks-list');
        const addTaskBtn = document.getElementById('add-task-btn');

        // Event Listeners
        projectForm.addEventListener('submit', createProject);
        projectTypeSelect.addEventListener('change', initializeTasks);
        addTaskBtn.addEventListener('click', () => addTaskInput());

        // Header hide on scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop) {
                gsap.to(header, { y: -header.offsetHeight, duration: 0.3, ease: 'power2.inOut' });
            } else {
                gsap.to(header, { y: 0, duration: 0.3, ease: 'power2.inOut' });
            }
            lastScrollTop = scrollTop;
        });

        function initializeTasks() {
            const projectType = projectTypeSelect.value;
            tasksContainer.classList.remove('hidden');
            tasksList.innerHTML = '';
            if (projectPresets[projectType]) {
                projectPresets[projectType].forEach(task => addTaskInput(task));
            }
        }

        function addTaskInput(taskName = '', priority = 'medium', dueDate = '') {
            const taskContainer = document.createElement('div');
            taskContainer.className = 'flex items-center space-x-2 mb-3';

            const taskInput = document.createElement('input');
            taskInput.type = 'text';
            taskInput.value = taskName;
            taskInput.className = 'flex-grow rounded-md bg-custom-black border-custom-green text-custom-white px-3 py-2 focus:ring-2 focus:ring-custom-green focus:border-transparent';
            taskInput.placeholder = 'Enter task';

            const prioritySelect = document.createElement('select');
            prioritySelect.className = 'rounded-md bg-custom-black border-custom-green text-custom-white px-3 py-2 focus:ring-2 focus:ring-custom-green focus:border-transparent';
            prioritySelect.innerHTML = `
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="optional">Optional</option>
            `;
            prioritySelect.value = priority;

            const dueDateInput = document.createElement('input');
            dueDateInput.type = 'date';
            dueDateInput.value = dueDate;
            dueDateInput.className = 'rounded-md bg-custom-black border-custom-green text-custom-white px-3 py-2 focus:ring-2 focus:ring-custom-green focus:border-transparent';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'text-red-500 hover:text-red-400 font-bold text-xl';
            deleteBtn.addEventListener('click', () => taskContainer.remove());

            taskContainer.appendChild(taskInput);
            taskContainer.appendChild(prioritySelect);
            taskContainer.appendChild(dueDateInput);
            taskContainer.appendChild(deleteBtn);

            tasksList.appendChild(taskContainer);

            gsap.from(taskContainer, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.out"
            });
        }

        function createProject(e) {
            e.preventDefault();

            const projectName = document.getElementById('project-name').value;
            const projectType = document.getElementById('project-type').value;
            const projectDescription = document.getElementById('project-description').value;
            const projectDeadline = document.getElementById('project-deadline').value;

            const tasks = Array.from(tasksList.children).map(container => ({
                name: container.querySelector('input[type="text"]').value,
                priority: container.querySelector('select').value,
                dueDate: container.querySelector('input[type="date"]').value
            })).filter(task => task.name);

            const project = {
                name: projectName,
                type: projectType,
                description: projectDescription,
                deadline: projectDeadline,
                tasks: tasks
            };

            addProjectToList(project);
            updateDashboard();
            projectForm.reset();
            tasksList.innerHTML = '';
            initializeTasks();
            showNotification('Project created successfully!', 'success');
        }

        function addProjectToList(project) {
            const projectElement = document.createElement('div');
            projectElement.className = 'bg-custom-black p-6 rounded-xl mb-6 transform transition-all duration-300 hover:scale-102 hover:shadow-xl';
            projectElement.innerHTML = `
                <h3 class="text-2xl font-semibold mb-3">${project.name}</h3>
                <p class="text-custom-light mb-2">${project.type}</p>
                <p class="text-custom-light mb-2">${project.description}</p>
                <p class="text-custom-light mb-4">Deadline: ${project.deadline}</p>
                <div class="mb-4">
                    <label for="hours-worked-${project.name}" class="block text-sm font-medium mb-1">Hours Worked</label>
                    <input type="number" id="hours-worked-${project.name}" value="0" min="0" step="0.5" class="w-full rounded-md bg-custom-dark border-custom-green text-custom-white px-3 py-2 focus:ring-2 focus:ring-custom-green focus:border-transparent">
                </div>
                <h4 class="font-semibold mb-2">Tasks:</h4>
                <ul id="task-list-${project.name.replace(/\s+/g, '-').toLowerCase()}" class="space-y-3 mb-4 custom-scrollbar">
                    ${project.tasks.map(task => createTaskElement(task)).join('')}
                </ul>
                <div class="flex space-x-3">
                    <button class="add-task-btn bg-custom-green text-custom-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors duration-200">Add Task</button>
                    <button class="sort-tasks-btn bg-custom-light text-custom-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors duration-200">Sort Tasks</button>
                    <button class="delete-project-btn text-red-500 hover:text-red-400 transition-colors duration-200 px-4 py-2 rounded-md border border-red-500 hover:border-red-400">Delete Project</button>
                </div>
            `;

            projectList.appendChild(projectElement);

            // Add event listeners for complete and delete buttons
            projectElement.querySelectorAll('.complete-task-btn').forEach(btn => {
                btn.addEventListener('click', completeTask);
            });

            projectElement.querySelector('.delete-project-btn').addEventListener('click', () => deleteProject(projectElement));

            projectElement.querySelector('.add-task-btn').addEventListener('click', () => addTaskToProject(projectElement));

            // Add event listener for hours worked input
            projectElement.querySelector(`#hours-worked-${project.name}`).addEventListener('change', updateDashboard);

            // GSAP animation
            gsap.from(projectElement, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power2.out"
            });

            projectElement.querySelector('.sort-tasks-btn').addEventListener('click', () => {
                const taskList = projectElement.querySelector('ul');
                sortTasksByPriority(taskList);
            });

            updateProjectProgress(projectElement);
        }

        function createTaskElement(task) {
            return `
                <li class="task-item flex items-center justify-between bg-custom-dark p-3 rounded-md">
                    <span class="flex-grow mr-3">${task.name}</span>
                    <span class="text-sm px-3 py-1 rounded-full mr-3 ${getPriorityClass(task.priority)}">${task.priority}</span>
                    ${task.dueDate ? `<span class="text-sm mr-3">${task.dueDate}</span>` : ''}
                    <button class="complete-task-btn text-custom-green hover:text-custom-light transition-colors duration-200">Complete</button>
                </li>
            `;
        }

        function addTaskToProject(projectElement) {
            const taskList = projectElement.querySelector('ul');
            
            const newTaskContainer = document.createElement('li');
            newTaskContainer.className = 'task-item flex items-center justify-between bg-custom-dark p-3 rounded-md mb-3';
            newTaskContainer.innerHTML = `
                <input type="text" placeholder="Enter task" class="flex-grow bg-custom-black text-custom-white px-2 py-1 rounded mr-2">
                <select class="bg-custom-black text-custom-white px-2 py-1 rounded mr-2">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="optional">Optional</option>
                </select>
                <input type="date" class="bg-custom-black text-custom-white px-2 py-1 rounded mr-2">
                <button class="add-task-confirm bg-custom-green text-custom-black px-2 py-1 rounded mr-2">Add</button>
                <button class="cancel-task text-red-500 hover:text-red-400 px-2 py-1 rounded">Cancel</button>
            `;
            
            taskList.appendChild(newTaskContainer);

            const addBtn = newTaskContainer.querySelector('.add-task-confirm');
            addBtn.addEventListener('click', () => {
                const taskName = newTaskContainer.querySelector('input[type="text"]').value;
                const priority = newTaskContainer.querySelector('select').value;
                const dueDate = newTaskContainer.querySelector('input[type="date"]').value;
                
                if (taskName) {
                    const newTaskElement = document.createElement('li');
                    newTaskElement.className = 'task-item flex items-center justify-between bg-custom-dark p-3 rounded-md';
                    newTaskElement.innerHTML = createTaskElement({name: taskName, priority, dueDate});
                    taskList.insertBefore(newTaskElement, newTaskContainer);
                    newTaskElement.querySelector('.complete-task-btn').addEventListener('click', completeTask);
                    newTaskContainer.remove();
                    updateProjectProgress(projectElement);
                    updateDashboard();
                }
            });

            const cancelBtn = newTaskContainer.querySelector('.cancel-task');
            cancelBtn.addEventListener('click', () => {
                newTaskContainer.remove();
            });

            // GSAP animation for new task input
            gsap.from(newTaskContainer, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.out"
            });
        }

        function completeTask(e) {
            const taskItem = e.target.closest('li');
            const projectElement = taskItem.closest('.bg-custom-black');
            gsap.to(taskItem, {
                opacity: 0.5,
                duration: 0.3,
                ease: "power2.out"
            });
            e.target.disabled = true;
            e.target.textContent = 'Completed';
            updateProjectProgress(projectElement);
            updateDashboard();
            showNotification('Task completed!', 'success');
        }

        function deleteProject(projectElement) {
            if (confirm('Are you sure you want to delete this project?')) {
                gsap.to(projectElement, {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    ease: "power2.in",
                    onComplete: () => {
                        projectElement.remove();
                        updateDashboard();
                        showNotification('Project deleted successfully!', 'success');
                    }
                });
            }
        }

        function getPriorityClass(priority) {
            switch (priority) {
                case 'low':
                    return 'bg-blue-500 text-white';
                case 'medium':
                    return 'bg-yellow-500 text-black';
                case 'high':
                    return 'bg-red-500 text-white';
                case 'urgent':
                    return 'bg-purple-500 text-white';
                case 'optional':
                    return 'bg-gray-500 text-white';
                default:
                    return 'bg-gray-500 text-white';
            }
        }


        function sortTasksByPriority(taskList) {
            const priorityOrder = ['urgent', 'high', 'medium', 'low', 'optional'];
            const tasks = Array.from(taskList.children);
            tasks.sort((a, b) => {
                const priorityA = a.querySelector('span:nth-child(2)').textContent.toLowerCase();
                const priorityB = b.querySelector('span:nth-child(2)').textContent.toLowerCase();
                return priorityOrder.indexOf(priorityA) - priorityOrder.indexOf(priorityB);
            });
            tasks.forEach(task => taskList.appendChild(task));
        }

        function updateProjectProgress(projectElement) {
            const tasks = projectElement.querySelectorAll('li');
            const completedTasks = projectElement.querySelectorAll('.complete-task-btn:disabled').length;
            const progress = Math.round((completedTasks / tasks.length) * 100) || 0;

            let progressBar = projectElement.querySelector('.progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar w-full bg-custom-dark rounded-full h-3 mb-4 overflow-hidden';
                progressBar.innerHTML = '<div class="bg-custom-green h-3 rounded-full transition-all duration-500 ease-in-out" style="width: 0%"></div>';
                projectElement.insertBefore(progressBar, projectElement.querySelector('h4'));
            }

            progressBar.querySelector('div').style.width = `${progress}%`;
        }

        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `fixed bottom-4 right-4 p-4 rounded-md text-white ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`;
            notification.textContent = message;
            document.body.appendChild(notification);

            gsap.from(notification, {
                y: 50,
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            });

            setTimeout(() => {
                gsap.to(notification, {
                    y: 50,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.in",
                    onComplete: () => notification.remove()
                });
            }, 3000);
        }

        function updateDashboard() {
            updateTaskPriorityChart();
            updateHoursWorkedChart();
        }

        function updateTaskPriorityChart() {
            const tasks = Array.from(projectList.querySelectorAll('li')).map(taskElement => ({
                priority: taskElement.querySelector('span:nth-child(2)').textContent
            }));

            const priorityCounts = {
                low: tasks.filter(t => t.priority === 'low').length,
                medium: tasks.filter(t => t.priority === 'medium').length,
                high: tasks.filter(t => t.priority === 'high').length,
                urgent: tasks.filter(t => t.priority === 'urgent').length,
                optional: tasks.filter(t => t.priority === 'optional').length
            };

            const ctx = document.getElementById('task-priority-chart').getContext('2d');
            
            if (window.taskPriorityChart) {
                window.taskPriorityChart.destroy();
            }

            window.taskPriorityChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Low', 'Medium', 'High', 'Urgent', 'Optional'],
                    datasets: [{
                        data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high, priorityCounts.urgent, priorityCounts.optional],
                        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(156, 163, 175, 0.8)'],
                        borderColor: ['rgb(59, 130, 246)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(168, 85, 247)', 'rgb(156, 163, 175)'],
                        borderWidth: 1
                    }]
                }
            });
        }

        function updateHoursWorkedChart() {
            const projects = Array.from(projectList.children).map(projectElement => ({
                name: projectElement.querySelector('h3').textContent,
                hours: parseFloat(projectElement.querySelector('input[type="number"]').value) || 0
            }));

            const ctx = document.getElementById('hours-worked-chart').getContext('2d');
            
            if (window.hoursWorkedChart) {
                window.hoursWorkedChart.destroy();
            }

            window.hoursWorkedChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: projects.map(p => p.name),
                    datasets: [{
                        label: 'Hours Worked',
                        data: projects.map(p => p.hours),
                        backgroundColor: 'rgba(137, 152, 120, 0.8)',
                        borderColor: 'rgba(137, 152, 120, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Initial animations
        gsap.from('header', {
            opacity: 0,
            y: -50,
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        });

        gsap.from('#project-form-section, #projects-section', {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out"
        });

        // Initialize tasks and dashboard
        initializeTasks();
        updateDashboard();


        // Chart.js integration
        const ctxPriority = document.getElementById('task-priority-chart').getContext('2d');
        const ctxHours = document.getElementById('hours-worked-chart').getContext('2d');

        // Sample data (replace with actual data)
        const priorityData = {
            labels: ['Low', 'Medium', 'High', 'Urgent', 'Optional'],
            datasets: [{
                data: [12, 19, 3, 5, 2],
                backgroundColor: ['blue', 'yellow', 'red', 'purple', 'gray'],
            }]
        };

        const hoursData = {
            labels: ['Project 1', 'Project 2', 'Project 3'],
            datasets: [{
                data: [8, 15, 10],
                backgroundColor: ['blue', 'yellow', 'red'],
            }]
        };

        new Chart(ctxPriority, {
            type: 'doughnut',
            data: priorityData,
        });

        new Chart(ctxHours, {
            type: 'bar',
            data: hoursData,
        });