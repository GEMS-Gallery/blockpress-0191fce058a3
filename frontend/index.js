import { backend } from "declarations/backend";

document.addEventListener('DOMContentLoaded', async () => {
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

    newPostBtn.addEventListener('click', () => {
        postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
    });

    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitle').value;
        const author = document.getElementById('postAuthor').value;
        const category = postCategorySelect.value;
        const body = quill.root.innerHTML;

        try {
            await backend.createPost(title, body, author, category);
            createPostForm.reset();
            quill.setContents([]);
            postForm.style.display = 'none';
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    });

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
                categoryElement.addEventListener('click', () => selectCategory(category.name));
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
                    <p class="author">By ${post.author}</p>
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

    // Load categories and posts on page load
    await loadCategories();
    await loadPosts();
});
