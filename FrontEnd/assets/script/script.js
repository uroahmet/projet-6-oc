import { getProjects, getCategories, removeProject, postRequest } from './api.js';

const gallery = document.querySelector(".gallery");
const galleryModal = document.querySelector(".grid");
const filters = document.querySelector(".filters");
const localStorage = window.localStorage;
const token = localStorage.getItem("token");
const elementsEdit = document.querySelectorAll("body .id_edit");
const modal = document.querySelector(".background");
const modalModule = document.querySelector(".edition_gallery");
const modalContent = document.querySelector(".content_gallery");
const btnEdition = document.querySelector(".modify");
const markEdition = document.querySelector(".fa-xmark");
const logInOut = document.getElementById("logInOut");
const header = document.querySelector("header");
const buttonAddPhoto = document.getElementById("add_photo");
const content_addWork = document.querySelector(".content_addWork");
const returnModalGallery = document.querySelector(".fa-arrow-left");
const selectCategories = document.getElementById("selectCategory");
const imgTitle = document.getElementById("imgtitle");
const imgCategory = document.getElementById("selectCategory");
const imgFile = document.getElementById("imgfile");
const btnValid = document.getElementById("send_request");
const spanTitle = document.querySelector(".inputTitle");

function cleansPortfolio(isEdit = false) {
    (isEdit ? galleryModal : gallery).innerHTML = "";
}

function insertHTML(element, html) {
    element.insertAdjacentHTML("beforeend", html);
}

function displayFilters(categories) {
    categories.forEach(category => {
        insertHTML(filters, `
            <div class="filters_btn">
                <input type="radio" name="filter" data-category="${category.id}" id="${category.name}">
                <label for="${category.name}">${category.name}</label>
            </div>`);
    });
}

function displayPortfolio(works, isEdit = false) {
    works.forEach(work => {
        const html = isEdit
            ? `<figure data-id="${work.id}">
                <i class="fa-solid fa-trash-can fa-xs removedProject"></i>
                <img src="${work.imageUrl}" alt="${work.title}">
            </figure>`
            : `<figure>
                <img src="${work.imageUrl}" alt="${work.title}">
                <figcaption>${work.title}</figcaption>
            </figure>`;
        insertHTML(isEdit ? galleryModal : gallery, html);
    });
    if (isEdit) removedProject();
}

function toggleElements(elements, className, add = true) {
    elements.forEach(element => {
        element.classList[add ? 'add' : 'remove'](className);
    });
}

function handleLoginState() {
    if (!token) {
        console.error("Login failed");
        toggleElements(elementsEdit, 'hidden');
        modal.classList.add("hidden");
    } else {
        console.log("Login success");
        toggleElements(elementsEdit, 'hidden', false);
        modal.classList.add("hidden");
        header.classList.add("headerEdition");
        logInOut.innerHTML = `<li id="logInOut"><a href="./login.html">logout</a></li>`;
        filters.style.display = "none";
    }
}

function closeModal() {
    modalModule.classList.add("modalSlideOff");
    modal.classList.add("modalDisappear");
    cleansFormPost();
    setTimeout(() => {
        modal.classList.add("hidden");
        modalContent.classList.remove("hidden");
        content_addWork.classList.add("hidden");
        returnModalGallery.classList.add("masked");
    }, 300);
}

function cleansFormPost() {
    document.getElementById("previewImg").src = "";
    imgFile.value = "";
    imgTitle.value = "";
    imgFile.style.zIndex = "0";
}

btnEdition.addEventListener("click", () => {
    modal.classList.remove("hidden", "modalDisappear");
    modalModule.classList.remove("modalSlideOff");
    getProjects().then(works => {
        cleansPortfolio(true);
        displayPortfolio(works, true);
    });
});

markEdition.addEventListener("click", closeModal);

document.addEventListener("click", event => {
    if (event.target === modal) closeModal();
});

function removedProject() {
    document.querySelectorAll(".removedProject").forEach(button => {
        button.addEventListener("click", () => {
            const selectProjectId = button.parentElement.dataset.id;
            removeProject(selectProjectId, token).then(() => {
                button.parentElement.remove();
                getProjects().then(works => {
                    cleansPortfolio();
                    displayPortfolio(works);
                    filterDynamique(works);
                });
            });
        });
    });
}

function addProject(categories) {
    buttonAddPhoto.addEventListener("click", () => {
        modalContent.classList.add("hidden");
        content_addWork.classList.remove("hidden");
        returnModalGallery.classList.remove("masked");
    });

    returnModalGallery.addEventListener("click", () => {
        modalContent.classList.remove("hidden");
        content_addWork.classList.add("hidden");
        returnModalGallery.classList.add("masked");
        cleansFormPost();
    });

    categories.forEach(category => {
        insertHTML(selectCategories, `<option value="${category.id}">${category.name}</option>`);
    });

    imgFile.addEventListener("change", previewFile);

    btnValid.addEventListener("click", () => {
        const file = imgFile.files[0];
        if (!file || file.size >= 4000000) {
            imgFile.classList.add("errorImg");
        } else {
            imgFile.classList.remove("errorImg");
        }
        if (!imgTitle.value) {
            imgTitle.classList.add("errorTitle");
            spanTitle.classList.add("errorTitleDiv");
        } else {
            imgTitle.classList.remove("errorTitle");
            spanTitle.classList.remove("errorTitleDiv");
        }
        if (file && imgTitle.value) {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", imgTitle.value);
            formData.append("category", parseInt(imgCategory.value));
            postRequest(formData, token).then(response => {
                if (response.ok) {
                    modalContent.classList.remove("hidden");
                    content_addWork.classList.add("hidden");
                    returnModalGallery.classList.add("masked");
                    cleansFormPost();
                    getProjects().then(works => {
                        cleansPortfolio();
                        displayPortfolio(works);
                        cleansPortfolio(true);
                        displayPortfolio(works, true);
                        filterDynamique(works);
                    });
                    alert("Post réussi !");
                } else {
                    alert("Echec du Post");
                }
            });
        }
    });
}

function previewFile() {
    const file = imgFile.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = event => {
            document.getElementById("previewImg").src = reader.result;
            imgFile.style.zIndex = "3";
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById("previewImg").src = "";
        imgFile.style.zIndex = "0";
    }
}

function filterDynamique(works) {
    document.querySelectorAll(".filters input").forEach(button => {
        button.addEventListener("click", event => {
            const currentFilter = event.currentTarget.dataset.category;
            const filterWorks = currentFilter === "null" ? works : works.filter(work => work.category.id === parseInt(currentFilter));
            cleansPortfolio();
            displayPortfolio(filterWorks);
        });
    });
}

function main() {
    cleansPortfolio();
    getProjects().then(works => {
        displayPortfolio(works);
        getCategories().then(categories => {
            displayFilters(categories);
            addProject(categories);
            filterDynamique(works);
        });
    });
}

handleLoginState();
main();