let currentPage = 1;
let perPage = 10;
let sort = "-published_at";
let lastScrollTop = 0;

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function () {
  let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop) {
    navbar.classList.remove("header-visible");
    navbar.classList.add("header-hidden");
  } else {
    navbar.classList.remove("header-hidden");
    navbar.classList.add("header-visible");
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
});

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();

  document.getElementById("sort").addEventListener("change", (e) => {
    sort = e.target.value;
    loadPosts();
  });

  document.getElementById("perPage").addEventListener("change", (e) => {
    perPage = e.target.value;
    loadPosts();
  });

  document.getElementById("pagination").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      currentPage = parseInt(e.target.dataset.page);
      loadPosts();
    }
  });

  setActiveMenu();
});

async function loadPosts() {
  const apiUrl = "https://suitmedia-backend.suitdev.com/api/ideas";

  try {
    const response = await fetch(
      `${apiUrl}?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sort}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayPosts(data);
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

function displayPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const maxPagesToShow = 5;
  const halfPagesToShow = Math.floor(maxPagesToShow / 2);

  if (currentPage > 1) {
    pagination.innerHTML += `
      <button data-page="${currentPage - 1}" class="mx-1 px-4 py-2 border rounded bg-white">
        &laquo;
      </button>
    `;
  }

  let startPage = Math.max(1, currentPage - halfPagesToShow);
  let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

  if (endPage - startPage + 1 < maxPagesToShow) {
    if (startPage > 1) {
      endPage = Math.min(
        totalPages,
        endPage + (maxPagesToShow - (endPage - startPage + 1))
      );
    } else {
      startPage = Math.max(
        1,
        endPage - (maxPagesToShow - (endPage - startPage + 1))
      );
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pagination.innerHTML += `
      <button data-page="${i}" class="mx-1 px-4 py-2 border rounded ${
      i === currentPage ? "bg-orange-500 text-white" : "bg-white"
    }">
        ${i}
      </button>
    `;
  }

  if (currentPage < totalPages) {
    pagination.innerHTML += `
      <button data-page="${currentPage + 1}" class="mx-1 px-4 py-2 border rounded bg-white">
        &raquo;
      </button>
    `;
  }

  pagination.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      loadPosts();
    });
  });
}

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
} 

function displayPosts(data) {
  const postList = document.getElementById("postList");
  const showing = document.getElementById("showing");
  postList.innerHTML = "";
  showing.innerHTML = "";
  displayPagination(data.meta.last_page);

  data.data.forEach((post) => {
    const formattedDate = formatDate(post.published_at);
    postList.innerHTML += `
      <div class="border p-4 bg-white shadow rounded">
        <img src="${post.small_image[0]?.url || ''}" 
             class="w-full h-48 object-cover lazyload" 
             data-src="${post.small_image[0]?.url || ''}" 
             alt="${post.title}" />
        <p class="mt-2 font-bold text-gray-400">${formattedDate}</p>
        <h2 class="mt-2 text-lg font-bold card-title">${post.title}</h2>
      </div>
    `;
  });

  showing.innerHTML = `
    <p>Showing ${data.meta.from} - ${data.meta.to} of ${data.meta.total}</p>
  `;

  document.querySelectorAll(".lazyload").forEach((img) => {
    img.onload = () => img.classList.add("loaded");
    img.src = img.dataset.src;
  });
}

function setActiveMenu() {
  const currentPage = document.querySelector("h1").textContent.toLowerCase();

  document.querySelectorAll(".menu-link").forEach((link) => {
    if (link.getAttribute("data-page") === currentPage) {
      link.classList.add("border-white");
    }

    link.addEventListener("click", () => {
      document.querySelectorAll(".menu-link").forEach((l) => {
        l.classList.remove("border-white");
      });
      link.classList.add("border-white");
    });
  });
}
