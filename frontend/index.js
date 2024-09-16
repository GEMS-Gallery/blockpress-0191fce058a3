import { backend } from "declarations/backend";

document.addEventListener('DOMContentLoaded', async () => {
    const newPostBtn = document.getElementById('newPostBtn');
    const postForm = document.getElementById('postForm');
    const createPostForm = document.getElementById('createPostForm');
    const postsSection = document.getElementById('posts');

    // Initialize TinyMCE
    tinymce.init({
        selector: '#postBody',
        height: 300,
        menubar: false,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
    });

    newPostBtn.addEventListener('click', () => {
        postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
    });

    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitle').value;
        const author = document.getElementById('postAuthor').value;
        const body = tinymce.get('postBody').getContent();

        try {
            await backend.createPost(title, body, author);
            createPostForm.reset();
            tinymce.get('postBody').setContent('');
            postForm.style.display = 'none';
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    });

    async function loadPosts() {
        try {
            const posts = await backend.getPosts();
            postsSection.innerHTML = '';
            posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p class="author">By ${post.author}</p>
                    <div class="content">${post.body}</div>
                    <p class="timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</p>
                `;
                postsSection.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    // Load posts on page load
    await loadPosts();
});
