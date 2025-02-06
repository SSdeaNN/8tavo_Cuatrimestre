const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const resultsDiv = document.getElementById('results');
const paginationDiv = document.querySelector('.pagination');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modal-details');

const booksPerPage = 10;
let currentPage = 1;
let books = [];

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentPage = 1;

  const query = searchInput.value.trim();
  const type = searchType.value;

  if (!query) {
    resultsDiv.innerHTML = '<p>Por favor, ingresa un término de búsqueda.</p>';
    return;
  }

  let url;
  switch (type) {
    case 'title':
      url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`;
      break;
    case 'author':
      url = `https://openlibrary.org/search.json?author=${encodeURIComponent(query)}`;
      break;
    case 'isbn':
      url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(query)}`;
      break;
    default:
      url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
      break;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo obtener la respuesta de la API');
    }
    const data = await response.json();
    if (!data.docs) {
      throw new Error('No se encontraron libros con ese término');
    }
    books = data.docs;
    displayResults();
    displayPagination();
  } catch (error) {
    resultsDiv.innerHTML = `<p>${error.message}. Por favor, intenta de nuevo.</p>`;
    console.error(error);
  }
});

function displayResults() {
  resultsDiv.innerHTML = '';
  
  if (books.length === 0) {
    resultsDiv.innerHTML = '<p>No se encontraron libros.</p>';
    return;
  }
  
  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const paginatedBooks = books.slice(start, end);

  paginatedBooks.forEach((book) => {
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    const coverId = book.cover_i || '';
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : 'https://via.placeholder.com/150?text=No+Cover';

    bookElement.innerHTML = `
      <img src="${coverUrl}" alt="${book.title}">
      <h3>${book.title}</h3>
    `;

    bookElement.addEventListener('click', () => showDetails(book));

    resultsDiv.appendChild(bookElement);
  });
}

function displayPagination() {
  paginationDiv.innerHTML = '';
  const totalPages = Math.ceil(books.length / booksPerPage);
  
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item');
    if (i === currentPage) pageItem.classList.add('active');

    const pageLink = document.createElement('a');
    pageLink.classList.add('page-link');
    pageLink.href = '#';
    pageLink.textContent = i;
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      displayResults();
      displayPagination();
    });

    pageItem.appendChild(pageLink);
    paginationDiv.appendChild(pageItem);
  }
}

function showDetails(book) {
  const coverId = book.cover_i || '';
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : 'https://via.placeholder.com/150?text=No+Cover';

  modalDetails.innerHTML = `
    <img src="${coverUrl}" alt="${book.title}" style="width: 100%; margin-bottom: 20px;">
    <h3>${book.title}</h3>
    <p><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
    <p><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
    <p><strong>ISBN:</strong> ${book.isbn ? book.isbn.join(', ') : 'No disponible'}</p>
  `;

  modal.style.display = 'flex'; 
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
