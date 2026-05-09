$(document).ready(function () {
  let allProjects = [];
  let allSkillsFlat = [];
  let currentImageIndex = 0;
  let currentProjectImages = [];

  const $skillsContainer = $('#skillsContainer');
  const $projectsGrid = $('#projectsGrid');
  const $positionFilter = $('#positionFilter');
  const $skillFilter = $('#skillFilter');
  const $modal = $('#projectModal');
  const $modalOverlay = $('.modal-overlay');
  const $modalClose = $('.modal-close');
  const $prevBtn = $('#prevBtn');
  const $nextBtn = $('#nextBtn');
  const $modalImage = $('#modalImage');
  const $currentImage = $('#currentImage');
  const $totalImages = $('#totalImages');
  const $modalTitle = $('#modalTitle');
  const $modalPosition = $('#modalPosition');
  const $modalSkills = $('#modalSkills');
  const $modalDescription = $('#modalDescription');
  const $modalGithubLink = $('#modalGithubLink');

  function init(data) {
    allProjects = data.projects;

    // Flatten skills for filter
    flattenSkills(data.skills);

    renderSkillsSection(data.skills);
    populateSkillFilter(data.skills);
    renderProjects(allProjects);

    setupEventListeners();
  }

  function flattenSkills(skillsObj) {
    allSkillsFlat = [];
    for (const category in skillsObj) {
      const items = skillsObj[category];
      if (Array.isArray(items)) {
        allSkillsFlat.push(...items);
      } else {
        for (const level in items) {
          allSkillsFlat.push(...items[level]);
        }
      }
    }
    allSkillsFlat = [...new Set(allSkillsFlat)];
  }

  function renderSkillsSection(skillsObj) {
    $skillsContainer.empty();

    for (const category in skillsObj) {
      const categoryObj = skillsObj[category];
      const $categoryDiv = $(`<div class="skill-category"></div>`);
      const $categoryTitle = $(`<h3 class="skill-category-title">${category}</h3>`);
      $categoryDiv.append($categoryTitle);

      if (Array.isArray(categoryObj)) {
        // Direct array of skills
        const $skillsList = $(`<ul class="skill-items"></ul>`);
        categoryObj.forEach(skill => {
          $skillsList.append(`<li>${skill}</li>`);
        });
        $categoryDiv.append($skillsList);
      } else {
        // Object with proficiency levels
        for (const level in categoryObj) {
          const $levelDiv = $(`<div class="skill-level"></div>`);
          const $levelLabel = $(`<span class="skill-level-label">${level}:</span>`);
          const $skillsList = $(`<ul class="skill-items"></ul>`);

          categoryObj[level].forEach(skill => {
            $skillsList.append(`<li>${skill}</li>`);
          });

          $levelDiv.append($levelLabel);
          $levelDiv.append($skillsList);
          $categoryDiv.append($levelDiv);
        }
      }
      $skillsContainer.append($categoryDiv);
    }
  }

  function populateSkillFilter(skillsObj) {
    $skillFilter.find('optgroup').remove();

    for (const category in skillsObj) {
      const categoryObj = skillsObj[category];
      const $optgroup = $(`<optgroup label="${category}"></optgroup>`);

      for (const subcategory in categoryObj) {
        const items = categoryObj[subcategory];
        let skills = [];

        if (Array.isArray(items)) {
          skills = items;
        } else {
          for (const level in items) {
            skills.push(...items[level]);
          }
        }

        skills.forEach(skill => {
          $optgroup.append(`<option value="${skill}">${skill}</option>`);
        });
      }

      $skillFilter.append($optgroup);
    }

    $skillFilter.select2({
      placeholder: 'Select skills',
      width: '250px',
      allowClear: true
    });
  }

  function renderProjects(projects) {
    $projectsGrid.empty();

    if (projects.length === 0) {
      $projectsGrid.html('<p class="no-results">No projects found for the selected filters.</p>');
      return;
    }

    projects.forEach(project => {
      const skillBadges = project.skills
        .map(skill => `<span class="skill-badge">${skill}</span>`)
        .join(' ');

      $projectsGrid.append(`
        <div class="project-card" data-position="${project.position}" data-id="${project.id}">
          <div class="project-card-header">
            <h3>${project.title}</h3>
            <span class="position-badge">${project.position}</span>
          </div>
          <p>${project.description}</p>
          <div class="project-skills">${skillBadges}</div>
          <div class="project-links">
            <button class="btn btn-details" data-project-id="${project.id}">View Details</button>
          </div>
        </div>
      `);
    });

    // Attach click handlers to detail buttons
    $('.btn-details').on('click', function () {
      const projectId = $(this).data('project-id');
      const project = allProjects.find(p => p.id == projectId);
      if (project) {
        openProjectModal(project);
      }
    });
  }

  function openProjectModal(project) {
    currentProjectImages = project.images || [];
    currentImageIndex = 0;

    $modalTitle.text(project.title);
    $modalPosition.text(project.position).removeClass('fullstack frontend backend').addClass(project.position);
    $modalDescription.text(project.longDescription || project.description);
    $modalGithubLink.attr('href', project.github);

    const skillBadges = project.skills
      .map(skill => `<span class="skill-badge">${skill}</span>`)
      .join(' ');
    $modalSkills.html(skillBadges);

    if (currentProjectImages.length > 0) {
      updateModalImage();
      $totalImages.text(currentProjectImages.length);
    }

    $modal.addClass('active');
  }

  function updateModalImage() {
    if (currentProjectImages.length === 0) return;
    $modalImage.attr('src', currentProjectImages[currentImageIndex]);
    $currentImage.text(currentImageIndex + 1);
  }

  function closeProjectModal() {
    $modal.removeClass('active');
  }

  function setupEventListeners() {
    $positionFilter.on('change', filterProjects);
    $skillFilter.on('change', filterProjects);

    $modalClose.on('click', closeProjectModal);
    $modalOverlay.on('click', closeProjectModal);

    $prevBtn.on('click', function () {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateModalImage();
      }
    });

    $nextBtn.on('click', function () {
      if (currentImageIndex < currentProjectImages.length - 1) {
        currentImageIndex++;
        updateModalImage();
      }
    });

    // Keyboard navigation
    $(document).on('keydown', function (e) {
      if (!$modal.hasClass('active')) return;
      if (e.key === 'ArrowLeft') $prevBtn.click();
      if (e.key === 'ArrowRight') $nextBtn.click();
      if (e.key === 'Escape') closeProjectModal();
    });
  }

  function filterProjects() {
    const selectedPosition = $positionFilter.val();
    const selectedSkills = $skillFilter.val() || [];

    const filtered = allProjects.filter(project => {
      const positionMatch = !selectedPosition || project.position === selectedPosition;

      let skillMatch = true;
      if (selectedSkills.length > 0) {
        skillMatch = selectedSkills.some(skill => project.skills.includes(skill));
      }

      return positionMatch && skillMatch;
    });

    renderProjects(filtered);
  }

  $.getJSON('projects.json')
    .done(init)
    .fail(function () {
      $projectsGrid.html('<p class="no-results">Unable to load project data.</p>');
    });
});

