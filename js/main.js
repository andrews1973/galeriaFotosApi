const consultarApi = async (url) => {
  try {
    // 1. Comillas agregadas en 'GET' y en el valor de 'Authorization'
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Client-ID mn0ZeYNymUf55hXfBfPBIaTYcK8G34hvT8r3gnzYa-k'
      }
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.log('Ha ocurrido un error:', error);
    return null;
  }
};

// 2. Función asíncrona para esperar los datos
const mostrarColecciones = async () => {
 
  
  // Usamos await para esperar a que la API responda
  const datosRecibidos = await consultarApi('https://api.unsplash.com/collections?page=8');

  // Validamos que haya datos antes de intentar dibujarlos
  if (!datosRecibidos) {
    gridFotosCategoria.innerHTML = '<p>No se pudieron cargar las colecciones.</p>';
    return;
  }

  // 3. Transformamos cada objeto del arreglo en una tarjeta HTML
   const gridFotosCategoria = document.querySelector('#gridFotosCategoria');
  const htmlColecciones = datosRecibidos.map((coleccion) => {
    const imagenUrl = coleccion.cover_photo?.urls?.small || '';
    const titulo = coleccion.title;

    return `
      <div class="tarjeta-categoria">
        <img src="${imagenUrl}" alt="${titulo}">
        <h3>${titulo}</h3>
      </div>
    `;
  }).join(''); // .join('') une todo el arreglo en un solo texto HTML sin comas

  gridFotosCategoria.innerHTML = htmlColecciones;
};

// Ejecutamos la función
mostrarColecciones();




