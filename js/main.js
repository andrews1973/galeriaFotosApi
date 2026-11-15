// URL base de la API
const baseUrl = "https://api.unsplash.com/";

//const orientacion = "landscape"; // orientation=landscape, portrait, squarish
//const query = ""; // Search term
//const page = 1; // Page number to retrieve. (Optional; default: 1)
//const per_page = 10; //  	Number of items per page. (Optional; default: 10)

// Naturaleza
// pintarImagenes('nature', 1, 1);
// https://api.unsplash.com/search/photos?query=nature&per_page=1
// Tecnología
// https://api.unsplash.com/search/photos?query=technology&per_page=1
// pintarImagenes('technology', 1, 1);
// Personas
// https://api.unsplash.com/search/photos?query=people&per_page=1
// pintarImagenes('people', 1, 1);

// querySelector
const select = document.querySelector("#orientacionFoto");
const img1 = document.querySelector("#categoria #img1");
const img2 = document.querySelector("#categoria #img2");
const img3 = document.querySelector("#categoria #img3");
const gridFotosCategoria = document.querySelector("#gridFotosCategoria");
const formulario = document.querySelector("#busqueda");
const inputBuscar = document.querySelector("#buscar");
//console.log(select);
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

const pintarImagenes = async (
    query = "nature",
    page = 1,
    per_page = 16,
    orientacion = "landscape",
    zona = gridFotosCategoria,
) => {
    try {
        // Comprobamos que existe el contenedor
        if (!zona) {
            throw new Error("No se encontró el contenedor de fotografías.");
        }

        // Esperamos a recibir los datos de la API
        const datosRecibidos = await consultarApi(
            `${baseUrl}search/photos?query=${query}&page=${page}&per_page=${per_page}&orientation=${orientacion}`,
        );

        // Comprobamos que hemos recibido datos
        if (!datosRecibidos) {
            throw new Error("No se pudieron cargar las fotografías.");
        }

        // Obtenemos el array de fotografías
        const fotos = datosRecibidos.results;

        // Comprobamos que existen fotografías
        if (fotos.length === 0) {
            zona.innerHTML = "<p>No se encontraron fotografías.</p>";
            return;
        }

        // Limpiamos las fotografías anteriores
        zona.innerHTML = "";

        // Creamos un fragmento para almacenar los elementos
        const fragment = document.createDocumentFragment();

        // Recorremos el array de fotografías
        fotos.forEach((imagenObj) => {
            const contenedor = crearImagen(imagenObj);
            fragment.append(contenedor);
        });

        // Añadimos todos los elementos al DOM
        zona.append(fragment);
    } catch (error) {
        console.error("Error al pintar las imágenes:", error);

        if (zona) {
            zona.innerHTML =
                "<p>Ha ocurrido un error al cargar las fotografías.</p>";
        }
    }
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

// 4. Ejecutamos la función 3 veces una por cada imagen
pintarImagenes("nature", 1, 1, "landscape", img1);
pintarImagenes("tecnology", 1, 1, "landscape", img2);
pintarImagenes("people", 1, 1, "landscape", img3);

//busqueda

formulario.addEventListener("submit", (event) => {
    // Evitamos que el formulario recargue la página
    event.preventDefault();

    // Obtenemos el valor del input
    const textoBuscar = inputBuscar.value.trim();

    // Comprobamos que no esté vacío
    if (textoBuscar !== "") {
        pintarImagenes(textoBuscar);
    }
});

document.addEventListener("click", (ev) => {
    const categoriaDiv = ev.target.closest("#categoria > div");
    //Busca hacia arriba desde la imagen hasta encontrar el primer elemento que coincida con #categoria > div

    if (categoriaDiv) {
        const query = categoriaDiv.dataset.query;
        pintarImagenes(query);
    }
});
