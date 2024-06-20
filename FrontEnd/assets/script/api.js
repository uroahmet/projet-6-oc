// api.js

export async function getProjects() {
    return await fetch("http://localhost:5678/api/works").then(res => res.json());
}

export async function getCategories() {
    return await fetch("http://localhost:5678/api/categories").then(res => res.json());
}

export async function removeProject(projectId, token) {
    return await fetch(`http://localhost:5678/api/works/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });
}

export async function postRequest(formData, token) {
    return await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });
}
