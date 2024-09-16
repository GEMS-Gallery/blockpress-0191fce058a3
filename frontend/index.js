import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/backend/backend.did.js";
import { canisterId } from "declarations/backend/index.js";

let authClient;
let actor;

let loginBtn;
let logoutBtn;
let newPostBtn;
let postForm;
let createPostForm;
let postsSection;
let categoriesSection;
let postCategorySelect;
let usernameForm;
let createUsernameForm;

let selectedCategory = null;
let quill;

const II_URL = process.env.DFX_NETWORK === 'ic' 
    ? 'https://identity.ic0.app/#authorize' 
    : `http://localhost:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}#authorize`;

async function initAuth() {
    try {
        authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        updateUI(isAuthenticated);
        if (isAuthenticated) {
            await initActor();
            await checkUsername();
        }
    } catch (error) {
        console.error('Error initializing AuthClient:', error);
    }
}

async function initActor() {
    const identity = await authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    
    if (process.env.DFX_NETWORK !== 'ic') {
        agent.fetchRootKey();
    }

    actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: canisterId,
    });
}

async function checkUsername() {
    const username = await actor.getUsername();
    if (username[0] === null) {
        usernameForm.style.display = 'block';
    } else {
        usernameForm.style.display = 'none';
        newPostBtn.style.display = 'inline-block';
    }
}

async function login() {
    if (!authClient) {
        console.error('AuthClient not initialized');
        return;
    }
    try {
        await authClient.login({
            identityProvider: II_URL,
            onSuccess: async () => {
                await initActor();
                updateUI(true);
                await checkUsername();
                loadPosts();
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function logout() {
    if (!authClient) {
        console.error('AuthClient not initialized');
        return;
    }
    try {
        await authClient.logout();
        actor = null;
        updateUI(false);
        loadPosts();
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

function updateUI(isAuthenticated) {
    if (loginBtn) loginBtn.style.display = isAuthenticated ? 'none' : 'inline-block';
    if (logoutBtn) logoutBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
    if (newPostBtn) newPostBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
}

async function loadCategories() {
    try {
        const categories = await actor.getCategories();
        if (categoriesSection) categoriesSection.innerHTML = '';
        if (postCategorySelect) postCategorySelect.innerHTML = '';
        categories.forEach(category => {
            if (categoriesSection) {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                categoryElement.innerHTML = `
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                `;
                categoryElement.onclick = () => selectCategory(category.name);
                categoriesSection.appendChild(categoryElement);
            }

            if (postCategorySelect) {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                postCategorySelect.appendChild(option);
            }
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
            ? await actor.getPostsByCategory(selectedCategory)
            : await actor.getPosts();
        if (postsSection) {
            postsSection.innerHTML = '';
            posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p class="author">By ${post.author}</p>
                    <p class="category">${post.category}</p>
                    <div class="content">${post.body}</div>
                    <p class="timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</p>
                `;
                postsSection.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function initQuill() {
    const editorElement = document.getElementById('editor');
    if (editorElement) {
        quill = new Quill('#editor', {
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
    }
}

function initEventListeners() {
    if (loginBtn) loginBtn.onclick = login;
    if (logoutBtn) logoutBtn.onclick = logout;
    if (newPostBtn) newPostBtn.onclick = () => {
        if (postForm) postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
    };
    if (createPostForm) {
        createPostForm.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('postTitle')?.value;
            const category = postCategorySelect?.value;
            const body = quill?.root.innerHTML;

            if (title && category && body && actor) {
                try {
                    await actor.createPost(title, body, category);
                    createPostForm.reset();
                    if (quill) quill.setContents([]);
                    if (postForm) postForm.style.display = 'none';
                    await loadPosts();
                } catch (error) {
                    console.error('Error creating post:', error);
                }
            }
        };
    }
    if (createUsernameForm) {
        createUsernameForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('usernameInput')?.value;
            if (username && actor) {
                try {
                    const result = await actor.createUser(username);
                    if (result) {
                        usernameForm.style.display = 'none';
                        newPostBtn.style.display = 'inline-block';
                    } else {
                        alert('Username creation failed. Please try again.');
                    }
                } catch (error) {
                    console.error('Error creating username:', error);
                }
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    newPostBtn = document.getElementById('newPostBtn');
    postForm = document.getElementById('postForm');
    createPostForm = document.getElementById('createPostForm');
    postsSection = document.getElementById('posts');
    categoriesSection = document.getElementById('categories');
    postCategorySelect = document.getElementById('postCategory');
    usernameForm = document.getElementById('usernameForm');
    createUsernameForm = document.getElementById('createUsernameForm');

    initQuill();
    initEventListeners();
    await initAuth();
    await loadCategories();
    await loadPosts();
});
