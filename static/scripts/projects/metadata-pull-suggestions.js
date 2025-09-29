console.log("DEBUG relatedProjects array:", relatedProjects);
const currentCategory = document.getElementById("relatedProjects").dataset.category;

const relatedProjects = [
    {% for p in related_projects %}
    {
        title: "{{ p.title|escapejs }}",
        image: "{{ p.image_main.url }}",
        url: "{% url 'project_detail' slug=p.slug %}",
        category: "{{ p.category|lower }}"
    }{% if not forloop.last %},{% endif %}
    {% endfor %}
];

const relatedTitle = document.getElementById("relatedCategory");
relatedTitle.textContent = currentCategory;

const relatedContainer = document.querySelector(".related-projects-container");
relatedProjects.forEach(project => {
    const div = document.createElement("div");
    div.className = "related-project";
    div.innerHTML = `
        <a href="${project.url}">
            <img src="${project.image}" alt="${project.title}">
            <p>${project.title}</p>
        </a>
    `;
    relatedContainer.appendChild(div);
});