// URL base de la API
const baseUrl = "https://api.unsplash.com/";

const orientacion = "landscape"; // orientation=landscape, portrait, squarish
const query = ""; // Search term
const page = 1; // Page number to retrieve. (Optional; default: 1)
const per_page = 10; //  	Number of items per page. (Optional; default: 10)

// querySelector
const select = document.querySelector("orientacionFoto");

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

const pintarImagenes = async (query = "nature") => {
    // Seleccionamos el contenedor del HTML
    const gridFotosCategoria = document.querySelector("#gridFotosCategoria");

    // Esperamos a recibir los datos de la API
    const datosRecibidos = await consultarApi(
        `${baseUrl}search/photos?query=${query}&page=${page}&per_page=${per_page}&orientation=${orientacion}`,
    );

    // Comprobamos que hemos recibido datos
    if (!datosRecibidos) {
        gridFotosCategoria.innerHTML =
            "<p>No se pudieron cargar las fotografías.</p>";
        return;
    }

    // Obtenemos el array de fotografías
    const fotos = datosRecibidos.results;

    // Creamos un fragmento para almacenar los elementos
    const fragment = document.createDocumentFragment();

    // Recorremos el array de fotografías
    fotos.forEach((imagenObj) => {
        // Creamos una tarjeta
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
    titulo.textContent =
        imagen.description || imagen.alt_description || "Sin título";

    // Creamos la imagen
    const img = document.createElement("img");
    img.src = imagen.urls.small;
    img.alt = imagen.alt_description || "Fotografía de Unsplash";
    img.title = imagen.description || imagen.alt_description || "Sin título";

    // Añadimos el título y la imagen al article
    contenedor.append(titulo, img);

    // Devolvemos el article completo
    return contenedor;
};

// 4. Ejecutamos la función
pintarImagenes();
