// querySelector
const select = document.querySelector("#orientacionFoto");
const categoria = document.querySelector("#categoria");
const gridFotosCategoria = document.querySelector("#gridFotosCategoria");
const formulario = document.querySelector("#busqueda");
const inputBuscar = document.querySelector("#buscar");
const modalFavoritos = document.querySelector("#modalFavoritos");
const listaFavoritos = document.querySelector("#listaFavoritos");

const fragment = document.createDocumentFragment();

// URL base de la API
const baseUrl = "https://api.unsplash.com/";

let queryActual = "nature"; // Search term, para guardar la busqueda

const categorias = ["nature", "technology", "people"];

// Recuperamos los favoritos guardados en LocalStorage
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// EVENTOS

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const textoBuscar = inputBuscar.value.trim();

    if (textoBuscar !== "") {
        queryActual = textoBuscar;
        await pintarImagenes(textoBuscar);
        bajarAGaleria();
        // bajamos a las imagenes
    }
});

select.addEventListener("change", async () => {
    const orientacion = select.value;

    // resteamos las clases
    gridFotosCategoria.classList.remove(
        "orientacion-horizontal",
        "orientacion-vertical",
        "orientacion-cuadrada",
    );

    if (orientacion === "landscape") {
        gridFotosCategoria.classList.add("orientacion-horizontal");
    } else if (orientacion === "portrait") {
        gridFotosCategoria.classList.add("orientacion-vertical");
    } else if (orientacion === "squarish") {
        gridFotosCategoria.classList.add("orientacion-cuadrada");
    }

    // Esperamos a que se pinten
    await pintarImagenes(queryActual, 1, 16, orientacion);
    bajarAGaleria();
});

document.addEventListener("click", async (ev) => {
    // Seleccionar una categoría
    const categoriaDiv = ev.target.closest("#categoria > div");

    if (categoriaDiv) {
        const query = categoriaDiv.dataset.query;
        queryActual = query;

        await pintarImagenes(query);
        bajarAGaleria();
    }

    // Mostrar favoritos
    const botonMostrarFavoritos = ev.target.closest("#mostrarFavoritos");

    if (botonMostrarFavoritos) {
        pintarFavoritos();
        modalFavoritos.classList.remove("ocultar");
    }

    // Cerrar favoritos
    const cerrarFavoritos = ev.target.closest("#cerrarFavoritos");

    if (cerrarFavoritos) {
        modalFavoritos.classList.add("ocultar");
    }

    // Añadir o eliminar un favorito,
    // estamos buscando el botón de favoritos desde el elemento donde se ha producido el clic
    const botonFavorito = ev.target.closest(".botonFavorito");

    if (botonFavorito) {
        // Busca hacia arriba en el HTML
        // Buscamos el article que tenga ese botón
        const tarjeta = botonFavorito.closest("article");

        // Recuperamos la imagen que contiene el article
        const img = tarjeta.querySelector("img");

        // Recuperamos los datos de la imagen desde el propio img
        const imagen = {
            id: img.dataset.id,
            urls: {
                small: img.src,
            },
            alt_description: img.alt,
        };

        // Añadimos o eliminamos el favorito
        alternarFavorito(imagen);

        // Comprobamos si ahora es favorita
        const esFavorita = buscarEnFavoritos(imagen);

        // Actualizamos los corazones de todas las tarjetas que contengan esa imagen,
        // en lugar de volver a pintar toda la galería pintarImagenes(queryActual);
        actualizarCorazones(imagen.id, esFavorita);

        // Si estamos dentro de la lista de favoritos, la volvemos a pintar pero funcion pintarFavoritos
        if (listaFavoritos.contains(tarjeta)) {
            pintarFavoritos();
        }
    }
});

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

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.log("Ha ocurrido un error:", error);
        throw error;
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
        if (!zona) {
            throw new Error("No se encontró el contenedor de fotografías.");
        }

        const datosRecibidos = await consultarApi(
            `${baseUrl}search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&orientation=${orientacion}`,
        );

        if (!datosRecibidos) {
            throw new Error("No se pudieron cargar las fotografías.");
        }

        const fotos = datosRecibidos.results;

        if (fotos.length === 0) {
            zona.innerHTML = "<p>No se encontraron fotografías.</p>";
            return;
        }

        zona.innerHTML = "";

        fotos.forEach((imagenObj) => {
            const contenedor = crearImagen(imagenObj, zona, query);
            fragment.append(contenedor);
        });

        zona.append(fragment);
    } catch (error) {
        console.error("Error al pintar las imágenes:", error);

        if (zona) {
            zona.innerHTML =
                "<p>Ha ocurrido un error al cargar las fotografías.</p>";
        }
    }
};

// funcion que busca si el favorito ya existe, podria ser find()
const buscarEnFavoritos = (imagen) => {
    return favoritos.some((foto) => foto.id === imagen.id);
};

// 3. Función para crear cada tarjeta de imagen
const crearImagen = (imagen, zona, query) => {
    const contenedor = document.createElement("article");

    const titulo = document.createElement("h4");

    if (zona === gridFotosCategoria || zona === listaFavoritos) {
        titulo.textContent = imagen.alt_description || "Sin título";
    } else {
        titulo.textContent = query.toUpperCase();
    }

    const img = document.createElement("img");
    img.src = imagen.urls.small;
    img.alt = imagen.alt_description || "Fotografía de Unsplash";
    img.title = imagen.description || imagen.alt_description || "Sin título";

    // Guardamos los datos de la imagen directamente en el img
    img.dataset.id = imagen.id;

    // Creamos el botón de favoritos
    const botonFavorito = document.createElement("button");
    botonFavorito.type = "button";
    botonFavorito.classList.add("botonFavorito");

    // Comprobamos si la imagen ya está guardada como favorita, devulve true o false
    const esFavorita = buscarEnFavoritos(imagen);

    // font awesome el icono corazon nos fijamos en html para crearlo
    const corazon = document.createElement("i");

    if (esFavorita) {
        botonFavorito.classList.add("favorito");
        corazon.classList.add("fa-solid", "fa-heart");
    } else {
        corazon.classList.add("fa-regular", "fa-heart");
    }

    botonFavorito.append(corazon);

    contenedor.append(titulo, img, botonFavorito);

    return contenedor;
};

// 4. Función para alternar un favorito, pinchando en el corazon y voliendo o no a pinchar
const alternarFavorito = (imagen) => {
    // Comprobamos si ya existe en favoritos
    const existe = buscarEnFavoritos(imagen);

    if (existe) {
        // Si existe, lo eliminamos, devuelve un array donde ya no esta ese favorito
        favoritos = favoritos.filter((foto) => foto.id !== imagen.id);
    } else {
        // Si no existe, lo añadimos a nuestro array
        favoritos.push(imagen);
    }

    // Guardamos los cambios en LocalStorage
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
};

// 5. Función para actualizar los corazones
// una misma fotografía puede aparecer en distintos sitios:
// por ejemplo, en una categoría y también en los resultados de búsqueda.
// mantener sincronizada la parte visual con el contenido del array favoritos
// evitamos volver a pintar toda la galería cada vez que añadimos o eliminamos un favorito
const actualizarCorazones = (id, esFavorita) => {
    // Buscamos todas las tarjetas que tengan ese ID
    const tarjetas = document.querySelectorAll("article");

    tarjetas.forEach((tarjeta) => {
        const img = tarjeta.querySelector("img");

        if (img && img.dataset.id === id) {
            const boton = tarjeta.querySelector(".botonFavorito");
            const corazon = boton.querySelector("i");

            boton.classList.toggle("favorito", esFavorita);
            corazon.classList.toggle("fa-solid", esFavorita);
            corazon.classList.toggle("fa-regular", !esFavorita);
        }
    });
};

// 6. Función para pintar los favoritos en el modal
const pintarFavoritos = () => {
    listaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {
        listaFavoritos.textContent = "Todavía no tienes favoritos.";
        return;
    }

    favoritos.forEach((foto) => {
        const contenedor = crearImagen(foto, listaFavoritos, "");
        fragment.append(contenedor);
    });

    listaFavoritos.append(fragment);
};

// 7. Función para mostrar las categorías
const mostrarCategorias = () => {
    categorias.forEach((query) => {
        const contendorFotoCategoria = document.createElement("div");

        contendorFotoCategoria.dataset.query = query;

        fragment.append(contendorFotoCategoria);
    });

    // Primero añadimos los contenedores al DOM
    categoria.append(fragment);

    // Después cargamos las imágenes de cada categoría
    categorias.forEach((query) => {
        const contenedor = categoria.querySelector(`[data-query="${query}"]`);

        pintarImagenes(query, 1, 1, "landscape", contenedor);
    });
};

// 8. Función para bajar hasta la galería
const bajarAGaleria = () => {
    document.querySelector("#seccionFotografias").scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};

// INICIO DE LA APLICACIÓN
mostrarCategorias();
