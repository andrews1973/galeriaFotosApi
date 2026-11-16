// URL base de la API
const baseUrl = "https://api.unsplash.com/";

let queryActual = "nature"; // Search term, para guardar la busqueda

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
const modalFavoritos = document.querySelector("#modalFavoritos");

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
            const contenedor = crearImagen(imagenObj, zona, query);
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
const crearImagen = (imagen, zona, query) => {
    // Creamos el article
    const contenedor = document.createElement("article");

    // Creamos el título
    const titulo = document.createElement("h4");

    // Comprobamos dónde vamos a mostrar la imagen, dependiendo de ello mostramos un titulo diferente en la imagen
    if (zona !== gridFotosCategoria) {
        // Si es una colleccion de las 3 de imagenes de arriba, mostramos el término de búsqueda como título, en mayuscula
        titulo.textContent = query.toUpperCase();
    } else {
        // Si es una fotografía de la galería, mostramos su descripción
        titulo.textContent = imagen.alt_description || "Sin título";
    }

    // Creamos la imagen
    const img = document.createElement("img");
    img.src = imagen.urls.small;
    img.alt = imagen.alt_description || "Fotografía de Unsplash";
    img.title = imagen.description || imagen.alt_description || "Sin título";

    // Creamos el botón de favoritos
    const botonFavorito = document.createElement("button");
    botonFavorito.type = "button";
    botonFavorito.classList.add("botonFavorito");

    // Creamos el icono del corazón con font awesome
    const corazon = document.createElement("i");
    corazon.classList.add("fa-regular", "fa-heart");

    // Añadimos el corazón al botón
    botonFavorito.append(corazon);

    // Añadimos los elementos al article
    contenedor.append(titulo, img, botonFavorito);

    // Devolvemos el article completo
    return contenedor;
};

// 4. Ejecutamos la función 3 veces una por cada imagen
pintarImagenes("nature", 1, 1, "landscape", img1);
pintarImagenes("technology", 1, 1, "landscape", img2);
pintarImagenes("people", 1, 1, "landscape", img3);

//busqueda

formulario.addEventListener("submit", (event) => {
    // Evitamos que el formulario recargue la página
    event.preventDefault();

    // Obtenemos el valor del input
    const textoBuscar = inputBuscar.value.trim();

    // Comprobamos que no esté vacío y guardamos el termino a buscar en queryActual
    if (textoBuscar !== "") {
        queryActual = textoBuscar;
        pintarImagenes(textoBuscar);
    }
});

// A la caja select, cuando cambie la opción, pido las fotos con esa orientación
select.addEventListener("change", (ev) => {
    //console.log("Ha cambiado la orientación de tu imagen");
    // target es el objetivo (el select) y value el valor elegido: portrait, landscape o squarish
    const orientacionElegida = ev.target.value;
    //console.log(orientacionElegida);
    // Pido a Unsplash la última búsqueda (queryActual) filtrada por la orientación elegida
    pintarImagenes(queryActual, 1, 16, orientacionElegida);
});

document.addEventListener("click", (ev) => {
    // delegacion de eventos
    // closest() comprueba el elemento pulsado y después sus padres
    // Busca hacia elementos padres la imagen hasta encontrar el primer elemento que coincida con #categoria > div
    const categoriaDiv = ev.target.closest("#categoria > div");

    if (categoriaDiv) {
        const query = categoriaDiv.dataset.query;
        queryActual = query;
        pintarImagenes(query);
    }

    // Comprobar si hemos pulsado el botón de favoritos
    const botonFavoritos = ev.target.closest("#mostrarFavoritos");

    if (botonFavoritos) {
        modalFavoritos.classList.toggle("ocultar");
    }

    // Comprobar si hemos pulsado el botón de cerrar favoritos
    const cerrarFavoritos = ev.target.closest("#cerrarFavoritos");

    if (cerrarFavoritos) {
        modalFavoritos.classList.add("ocultar");
    }

    const clikCorazon = ev.target.closest(".botonFavorito");
    if (clikCorazon) {
        const id = clikCorazon.target.id;
        const src = clikCorazon.target.src;
        const alt = clikCorazon.target.alt;
        const cajaFavoritos = pintarFavoritos({ id, src, alt });

        console.log(cajaFavoritos);

        pintarFavoritos({ id });
        console.log(id);
     

        //pendiente funcion de pintar favoritos y el segundo es el uso de pintargrid ya tenia para dibujar las fotos alli
    }
});

///////////////////
//Local storage
////////////////////

let favoritos = [];

const leerLocalStorage = () => {
    const leerFavorito =
        JSON.parse(localStorage.getItem("favoritosFotos")) || [];
    // console.log("favo ", leerFavorito);
    return leerFavorito;
};

const guardarLocalStorage = (favoritos) => {
    // la lista que entrara en el input y cambiarla con strinfy a texto
    const datosFavorito = JSON.stringify(favoritos); // convirrtiendo a texto
    localStorage.setItem("favoritosFotos", datosFavorito); //guardando en el localstorage con setitem , abre el cajón 'favoritosFotos' (key) y mete el texto dentro

    console.log("favv", favoritos);
};

leerLocalStorage();

///////////////////////////////
// Guardar favortitos y pintar
////////////////////////////////

// guardarLocalStorage(favoritos);

const pintarFavoritos = () => {
    console.log("pintando");

    // // container.innerHTML = '';  // vaciar el contenedor
    // let favoritosLocal = leerLocalStorage();

    //favoritosLocal.push(cajaFavoritos);

};
