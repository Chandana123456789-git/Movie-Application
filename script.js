const apiKey = "d14f643f";
let currentPage = 1;
let currentQuery = "";

function startSpeech() {
  const mic = document.getElementById("micButton");
  mic.classList.add("listening");

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("searchInput").value = transcript;
    searchMovies(1);
  };

  recognition.onend = function () {
    mic.classList.remove("listening");
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    mic.classList.remove("listening");
  };
}

async function searchMovies(page) {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    document.getElementById("moviesContainer").innerHTML = "";
    document.getElementById("pageNumber").innerText = "";
    document.getElementById("prevBtn").disabled = true;
    document.getElementById("nextBtn").disabled = true;
    return;
  }

  currentQuery = query;
  currentPage = page;

  document.getElementById("loading").style.display = "block";
  document.getElementById("moviesContainer").innerHTML = "";

  const url = `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("loading").style.display = "none";

  const container = document.getElementById("moviesContainer");

  if (data.Response === "True") {
    const movies = data.Search.slice(0, 4);

    for (let movie of movies) {
      const detailRes = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`);
      const detail = await detailRes.json();

      container.innerHTML += `
        <div class="movie-card">
          <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300'}" />
          <h3>${movie.Title}</h3>
          <p><strong>${movie.Year}</strong></p>
          <p>${detail.Plot !== "N/A" ? detail.Plot : "No description available."}</p>
        </div>
      `;
    }

    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage >= Math.ceil(data.totalResults / 10);
    document.getElementById("pageNumber").innerText = `Page ${currentPage}`;
  } else {
    container.innerHTML = "<p>No movies found.</p>";
    document.getElementById("prevBtn").disabled = true;
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("pageNumber").innerText = "";
  }
}

function changePage(direction) {
  searchMovies(currentPage + direction);
}

let typingTimer;
const debounceDelay = 500;

document.getElementById("searchInput").addEventListener("input", function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    searchMovies(1);
  }, debounceDelay);
});
