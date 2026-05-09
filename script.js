$(document).ready(function() {
  let allProjects = [];
  let allSkills = [];

  const $skillsList = $('#skillsList');
  const $projectsGrid = $('#projectsGrid');
  const $positionFilter = $('#positionFilter');
  const $skillFilter = $('#skillFilter');

  function init(data) {
    allProjects = data.projects;
    allSkills = Array.from(new Set(data.skills));

    renderSkills();
    populateSkillFilter();
    renderProjects(allProjects);

    $positionFilter.on('change', filterProjects);
    $skillFilter.on('change', filterProjects);
  }

  function renderSkills() {
    $skillsList.empty();
    allSkills.forEach(skill => {
      $skillsList.append(`<li>${skill}</li>`);
    });
  }

  function populateSkillFilter() {
    const skillSet = new Set(allProjects.flatMap(project => project.skills));
    Array.from(skillSet)
      .sort()
      .forEach(skill => {
        $skillFilter.append(`<option value="${skill}">${skill}</option>`);
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

      const demoLink = project.demo
        ? `<a href="${project.demo}" target="_blank">View Demo</a>`
        : '';

      $projectsGrid.append(`
        <div class="project-card" data-position="${project.position}">
          <div class="project-card-header">
            <h3>${project.title}</h3>
            <span class="position-badge">${project.position}</span>
          </div>
          <p>${project.description}</p>
          <div class="project-skills">${skillBadges}</div>
          <div class="project-links">
            <a href="${project.github}" target="_blank">View on GitHub</a>
            ${demoLink}
          </div>
        </div>
      `);
    });
  }

  function filterProjects() {
    const selectedPosition = $positionFilter.val();
    const selectedSkill = $skillFilter.val();

    const filtered = allProjects.filter(project => {
      const positionMatch = !selectedPosition || project.position === selectedPosition;
      const skillMatch = !selectedSkill || project.skills.includes(selectedSkill);
      return positionMatch && skillMatch;
    });

    renderProjects(filtered);
  }

  $.getJSON('projects.json')
    .done(init)
    .fail(function() {
      $projectsGrid.html('<p class="no-results">Unable to load project data.</p>');
    });
});
