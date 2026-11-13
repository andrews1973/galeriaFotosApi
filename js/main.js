// URL base de la API
const baseUrl = "https://api.unsplash.com/";

// 1. Función para consultar la API
const consultarApi = async (url) => {
    try {
        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                Authorization:
                    "Client-ID mn0ZeYNymUf55hXfBfPBIaTYcK8G34hvT8r3gnzYa-k",
            },
        });
        // Comprobamos si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        // Convertimos la respuesta a JSON
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.log("Ha ocurrido un error:", error);
        return null;
    }
};

// 2. Función para pintar las imágenes
const pintarImagenes = async () => {
    // Seleccionamos el contenedor del HTML
    const gridFotosCategoria = document.querySelector("#gridFotosCategoria");

    // Esperamos a recibir los datos de la API
    const datosRecibidos = await consultarApi(`${baseUrl}collections?page=8`);

    // Comprobamos que hemos recibido datos
    if (!datosRecibidos) {
        gridFotosCategoria.innerHTML =
            "<p>No se pudieron cargar las colecciones.</p>";
        return;
    }
    // Creamos un fragmento para almacenar los elementos
    const fragment = document.createDocumentFragment();

    // Recorremos el array recibido de la API
    datosRecibidos.forEach((imagenObj) => {
        // Creamos una tarjeta y recogemos el elemento devuelto
        const contenedor = crearImagen(imagenObj);
        // Añadimos la tarjeta al fragmento
        fragment.append(contenedor);
    });
    // Añadimos todos los elementos al DOM
    gridFotosCategoria.append(fragment);
};

// 3. Función para crear cada tarjeta de imagen
const crearImagen = (imagen) => {
    // Creamos el article
    const contenedor = document.createElement("article");
    // Creamos el título
    const titulo = document.createElement("h4");
    titulo.textContent = imagen.title;
    // Creamos la imagen
    const img = document.createElement("img");
    img.src = imagen.cover_photo?.urls?.small || "";
    img.alt = imagen.cover_photo?.alt_description || imagen.title;
    img.title = imagen.title;

    // Añadimos el título y la imagen al article
    contenedor.append(titulo, img);

    // Devolvemos el article completo
    return contenedor;
};

// 4. Ejecutamos la función
pintarImagenes();

/////////////////////////////
// Buscador imagenes
/////////////////////////////

// Eventos
// Bussqueda de imagenes por input
const input = document.querySelector("#palabraClave");
const formulario = document.querySelector("#busqueda");
formulario.addEventListener("submit", (ev) => {
    ev.preventDefault(); // Evita que la página se recargue y corte el fetch
    pintarImagCategoria(); // funcion pintar 3 imagenes
});

// Pintar de imagenes por palabra en input
const pintarImagCategoria = async () => {
    const inputBusqueda = input.value.trim();
    if (inputBusqueda === "") return;
    const buscarDatos = await consultarApi(
        `${baseUrl}search/collections?page=1&query=${inputBusqueda}&per_page=3`,
    ); //llamo la llamas la API con valor del input y pido 3 imágenes
    const categoria = document.querySelector("#categoria");
    categoria.innerHTML = "";
    if (!buscarDatos || buscarDatos.results.length === 0) {
        categoria.innerHTML = "<p>No hay resultados para esa categoría.</p>";
        return;
    }
    // 3. recorrer array results y pintas cada imagen
    const fragment = document.createDocumentFragment();
    buscarDatos.results.forEach((imagen) => {
        const tarjeta = crearImagen(imagen);
        fragment.append(tarjeta);
    });

    categoria.append(fragment);
};
