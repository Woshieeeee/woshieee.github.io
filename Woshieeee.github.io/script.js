const apiKey = 'ZuXOuXpdudIIavcsIt-LibzN2UuHFdOR'; // Get from https://www.themoviedb.org
const imgBase = 'https://image.tmdb.org/t/p/w500';
const resultsEl = document.getElementById('results');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) searchMovie(query);
});

async function searchMovie(query) {
  resultsEl.innerHTML = '<p>Loading…</p>';
  try {
    // 1. Search by title
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );
    const { results } = await searchRes.json();
    if (!results.length) {
      resultsEl.innerHTML = '<p>No movie found.</p>';
      return;
    }

    // 2. Get first result's details & credits
    const movieId = results[0].id;
    const detailRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`
    );
    const movie = await detailRes.json();

    // 3. Load local cinemas data
    const cinemasData = await fetch('cinemas.json').then(r => r.json());
    const showtimes = cinemasData[movie.title] || [];

    // 4. Render card
    resultsEl.innerHTML = buildMovieCard(movie, showtimes);

  } catch (err) {
    resultsEl.innerHTML = '<p>Error fetching data.</p>';
    console.error(err);
  }
}

function buildMovieCard(movie, showtimes) {
  const cast = movie.credits.cast.slice(0, 5).map(c => c.name).join(', ');
  const cinemaHTML = showtimes.length
    ? `<ul class="cinema-list">
        ${showtimes.map(c =>
          `<li>
             <strong>${c.cinema}</strong>: ${c.showtimes.join(', ')}
           </li>`).join('')}
       </ul>`
    : '<p>No showtimes available in SM Cinemas.</p>';

  return `
  <div class="movie-card">
    <img src="${movie.poster_path ? imgBase + movie.poster_path : 'placeholder.jpg'}" alt="${movie.title}" />
    <div class="movie-details">
      <h2>${movie.title} (${new Date(movie.release_date).getFullYear()})</h2>
      <p>${movie.overview}</p>
      <p><strong>Main Cast:</strong> ${cast}</p>
      <h3>SM Cinemas Showtimes</h3>
      ${cinemaHTML}
    </div>
  </div>`;
}
