import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// *Referencias a los elementos del DOM
const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

// * Ocultar boton load
refs.btnLoadMore.style.display = 'none';

// *Mi API de Pixabay
const API_KEY = '38875510-9dc96174f5eca5b10cef5bab1';
let page = 1;
const perPage = 40;

// *Función para obtener datos de la API
async function fetchData(query, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure('Error fetching data');
  }
}

// *Crear el marcado HTML de las imágenes
function createMarkup(arr) {
  // console.log('Received array:', arr);
  const markup = arr
    .map(
      image => `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes:</b> ${image.likes}
        </p>
        <p class="info-item">
          <b>Views:</b> ${image.views}
        </p>
        <p class="info-item">
          <b>Comments:</b> ${image.comments}
        </p>
        <p class="info-item">
          <b>Downloads:</b> ${image.downloads}
        </p>
      </div>
    </div>
  `
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh(); // ?Actualizar la galería de lightbox
}

// *Configurar la galería de lightbox
const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});

//  *Cargar imágenes desde la API
const loadImages = async query => {
  const data = await fetchData(query);
  //   console.log(data);

  if (data && data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    refs.btnLoadMore.style.display = 'none';
  } else {
    createMarkup(data.hits);
    refs.btnLoadMore.style.display = 'block';
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} imagesLoaded`);
  }
};

// *Manejar el evento de envío del formulario de búsqueda
refs.form.addEventListener('submit', async e => {
  e.preventDefault();
  refs.btnLoadMore.style.display = 'none';
  const valueForm = e.target.searchQuery.value.trim(); //?Elimina espacios
  if (valueForm !== '') {
    refs.gallery.innerHTML = ''; // ?Limpiar la galería existente
    page = 1; // ?Reiniciar la página a 1
    loadImages(valueForm); // ?Cargar las imágenes
  } else {
    Notiflix.Notify.warning('Please enter a search term before submitting.');
  }
});

// *Manejar el evento de clic en el botón
refs.btnLoadMore.addEventListener('click', async () => {
  page++; // ?Incrementar el número de página
  const valueInput = refs.input.value.trim(); //?Elimina espacios

  const data = await fetchData(valueInput, page);

  if (data && data.hits.length < perPage) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    refs.btnLoadMore.style.display = 'none';
  } else {
    createMarkup(data.hits);
    refs.btnLoadMore.style.display = 'block';
    // ?Realizar un desplazamiento suave hacia abajo después de cargar más imágenes
    scrollToBottomOfGallery();
  }
});

//* Al dejar Input Vacio
refs.input.addEventListener('blur', () => {
  const valueInput = refs.input.value.trim(); // Obtener el valor del campo de entrada

  if (valueInput === '') {
    // Mostrar una alerta si el campo está vacío
    Notiflix.Notify.warning('Please enter a search term.');
  }
});

// *Scroll
function scrollToBottomOfGallery() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
