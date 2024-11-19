document.addEventListener("DOMContentLoaded", function () {
  const postForm = document.getElementById("postForm");
  const postsContainer = document.getElementById("postsContainer");
  const createPostBtn = document.getElementById("createPostBtn");
  const postFormContainer = document.getElementById("postFormContainer");
  const closeFormBtn = document.getElementById("closeFormBtn");
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  let currentEditIndex = null;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("service-worker.js")
        .then(function (registration) {
          console.log("Service Worker registrado con éxito:", registration);
        })
        .catch(function (error) {
          console.log("Error al registrar el Service Worker:", error);
        });
    });
  }

  const renderPosts = () => {
    postsContainer.innerHTML = "";
    posts.forEach((post, index) => {
      const currentDate = new Date(post.date).toLocaleString();
      const postElement = `
                <div class="card mb-3">
                ${
                  post.image
                    ? `
                    <img 
                        src="${post.image}" 
                        class="card-img-top img-fluid" 
                        alt="Post image" 
                        style="width: 100%; height: 200px; object-fit: contain; background-color: #f8f9fa; border-radius: 10px; padding: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"
                    >
                `
                    : ""
                }
                                    <div class="card-body">
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.content}</p>
                        <div><p>${currentDate}</p></div>
                        <button class="btn btn-warning" onclick="editPost(${index})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="deletePost(${index})">Eliminar</button>
                    </div>
                </div>
            `;
      postsContainer.innerHTML += postElement;
    });
  };

  const savePosts = () => {
    localStorage.setItem("posts", JSON.stringify(posts));
  };

  postForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const imageInput = document.getElementById("image");
    const image = imageInput.files[0];
    let imageUrl = "";

    if (!title || !content) {
      alert("Por favor, ingrese un título y contenido.");
      return;
    }

    if (image) {
      const reader = new FileReader();
      reader.onloadend = function () {
        imageUrl = reader.result;
        const post = { title, content, image: imageUrl, date: Date.now() };
        posts.push(post);
        savePosts();
        renderPosts();
      };
      reader.readAsDataURL(image);
    } else {
      const post = { title, content, image: "", date: Date.now() };
      posts.push(post);
      savePosts();
      renderPosts();
    }

    postForm.reset();
    postFormContainer.style.display = "none";
    createPostBtn.style.display = "block";
  });

  window.deletePost = function (index) {
    if (confirm("¿Está seguro de que desea eliminar esta publicación?")) {
      posts.splice(index, 1);
      savePosts();
      renderPosts();
    }
  };

  window.editPost = function (index) {
    const post = posts[index];
    currentEditIndex = index;

    document.getElementById("editTitle").value = post.title;
    document.getElementById("editContent").value = post.content;

    // Mostrar vista previa de la imagen actual
    const previewImage = document.getElementById("previewEditImage");
    if (post.image) {
      previewImage.src = post.image;
      previewImage.style.display = "block";
    } else {
      previewImage.style.display = "none";
    }

    const editModal = new bootstrap.Modal(
      document.getElementById("editPostModal")
    );
    editModal.show();
  };

  // Al guardar los cambios
  document.getElementById("saveEditBtn").addEventListener("click", function () {
    const updatedTitle = document.getElementById("editTitle").value.trim();
    const updatedContent = document.getElementById("editContent").value.trim();
    const updatedImageInput = document.getElementById("editImage");
    const updatedImage = updatedImageInput.files[0];

    if (!updatedTitle || !updatedContent) {
      alert("Por favor, ingrese un título y contenido.");
      return;
    }

    if (updatedImage) {
      const reader = new FileReader();
      reader.onloadend = function () {
        posts[currentEditIndex].image = reader.result;
        posts[currentEditIndex].title = updatedTitle;
        posts[currentEditIndex].content = updatedContent;
        savePosts();
        renderPosts();
      };
      reader.readAsDataURL(updatedImage);
    } else {
      posts[currentEditIndex].title = updatedTitle;
      posts[currentEditIndex].content = updatedContent;
      savePosts();
      renderPosts();
    }

    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editPostModal")
    );
    editModal.hide();
  });

  createPostBtn.addEventListener("click", function () {
    console.log("Botón Crear Publicación clickeado");
    postFormContainer.style.display = "block";
    createPostBtn.style.display = "none";
  });

  closeFormBtn.addEventListener("click", function () {
    postFormContainer.style.display = "none";
    createPostBtn.style.display = "block";
  });

  renderPosts();
});
