import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { backend } from "declarations/backend";

let authClient;
let actor;

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const newPostBtn = document.getElementById('newPostBtn');
const postForm = document.getElementById('postForm');
const createPostForm = document.getElementById('createPostForm');
const postsSection = document.getElementById('posts');
const categoriesSection = document.getElementById('categories');
const postCategorySelect = document.getElementById('postCategory');

let selectedCategory = null;

// Initialize Quill
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean']
        ]
    }
});

async function initAuth() {
    authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    updateUI(isAuthenticated);
}

async function login() {
    authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: async () => {
            actor = await Actor.createActor(backend, {
                agent: new HttpAgent({
                    identity: authClient.getIdentity()
                })
            });
            updateUI(true);
            loadPosts();
        }
    });
}

async function logout() {
    await authClient.logout();
    actor = null;
    updateUI(false);
    loadPosts();
}

function updateUI(isAuthenticated) {
    loginBtn.style.display = isAuthenticated ? 'none' : 'inline-block';
    logoutBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
    newPostBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
}

loginBtn.onclick = login;
logoutBtn.onclick = logout;

newPostBtn.onclick = () => {
    postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
};

createPostForm.onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const category = postCategorySelect.value;
    const body = quill.root.innerHTML;

    try {
        await actor.createPost(title, body, category);
        createPostForm.reset();
        quill.setContents([]);
        postForm.style.display = 'none';
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
    }
};

async function loadCategories() {
    try {
        const categories = await backend.getCategories();
        categoriesSection.innerHTML = '';
        postCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            categoryElement.innerHTML = `
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            `;
            categoryElement.onclick = () => selectCategory(category.name);
            categoriesSection.appendChild(categoryElement);

            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            postCategorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function selectCategory(category) {
    selectedCategory = category;
    document.querySelectorAll('.category').forEach(el => {
        el.classList.remove('selected');
        if (el.querySelector('h3').textContent === category) {
            el.classList.add('selected');
        }
    });
    loadPosts();
}

async function loadPosts() {
    try {
        const posts = selectedCategory 
            ? await backend.getPostsByCategory(selectedCategory)
            : await backend.getPosts();
        postsSection.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p class="author">By ${post.author.toText()}</p>
                <p class="category">${post.category}</p>
                <div class="content">${post.body}</div>
                <p class="timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</p>
            `;
            postsSection.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    await loadCategories();
    await loadPosts();
});
