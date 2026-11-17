/**
 * Galería de Fotos API · Team Hero (Lizeth, Andrés y Óscar)
 * Web app que pide fotos a la API de Unsplash con fetch: tres colecciones de inicio,
 * buscador validado con expresión regular, filtro por orientación, paginación
 * y favoritos guardados en el LocalStorage del navegador.
 */

////////////////////////////////
// ELEMENTOS DEL HTML
////////////////////////////////

const select = document.querySelector("#orientacionFoto");
const categoria = document.querySelector("#categoria");
const gridFotosCategoria = document.querySelector("#gridFotosCategoria");
const formulario = document.querySelector("#busqueda");
const inputBuscar = document.querySelector("#buscar");
const modalFavoritos = document.querySelector("#modalFavoritos");
const listaFavoritos = document.querySelector("#listaFavoritos");
// Botones de la paginación (debajo de la galería)
const pagAnterior = document.querySelector("#paginaAnterior");
const pagSiguiente = document.querySelector("#paginaSiguiente");
// Hueco entre los dos botones donde escribimos el tema y la página en la que estamos
const numeroPagina = document.querySelector("#numeroPagina");
// Párrafo donde avisamos si el texto del buscador no es válido
const mensajeBusqueda = document.querySelector("#mensajeBusqueda");

// Fragmento para preparar las tarjetas y añadirlas al DOM de una sola vez
const fragment = document.createDocumentFragment();

////////////////////////////////
// CONSTANTES Y ESTADO
////////////////////////////////

// URL base de la API
const baseUrl = "https://api.unsplash.com/";

// Clave pública de la app en Unsplash (va en la cabecera Authorization de cada petición)
const CLAVE_UNSPLASH = "mn0ZeYNymUf55hXfBfPBIaTYcK8G34hvT8r3gnzYa-k";

// Fotos que pedimos en cada página de la galería
const FOTOS_POR_PAGINA = 16;

// Clave del LocalStorage donde guardamos la lista de favoritos
const CLAVE_FAVORITOS = "favoritos";

// Lo que admite el buscador: letras (también con tilde y ñ), números y espacios, de 2 a 30 caracteres.
// Así no se manda a la API un texto vacío ni símbolos raros.
const REGEX_BUSQUEDA = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]{2,30}$/;

const categorias = ["nature", "technology", "people"];

let queryActual = "nature";    // Tema que se está viendo, para que Siguiente y Anterior lo sepan
let paginaActual = 1;          // Página en la que vamos; toda búsqueda empieza en la 1
let orientacionActual = "";    // Orientación elegida en el select; "" = sin filtro (todas)

// Recuperamos los favoritos guardados en LocalStorage; si no hay nada, empezamos con la lista vacía
let favoritos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || [];

////////////////////////////////
// PAGINACIÓN Y BÚSQUEDA
////////////////////////////////

/**
 * Escribe entre los botones Anterior y Siguiente el tema y la página que se están viendo.
 * Se llama cada vez que cambia la galería: búsqueda, categoría, orientación, Siguiente y Anterior.
 * @example
 * // con queryActual = "gatos" y paginaActual = 3
 * mostrarPagina(); // escribe «GATOS · Página 3»
 */
const mostrarPagina = () => {
    numeroPagina.textContent = `${queryActual.toUpperCase()} · Página ${paginaActual}`;
};

/**
 * Empieza una búsqueda desde cero (lo pidió Héctor): tema nuevo, página 1 y sin filtro de orientación.
 * La usan el buscador y las tres categorías de arriba.
 * @param {string} tema - Palabra que se busca en Unsplash (por ejemplo "nature" o lo escrito en el buscador).
 * @returns {Promise<void>} Termina cuando la galería ya está pintada.
 * @example
 * nuevaBusqueda("technology"); // galería de tecnología, página 1, todas las orientaciones
 */
const nuevaBusqueda = async (tema) => {
    queryActual = tema;         // apuntamos el tema nuevo para que Siguiente y Anterior lo sepan
    paginaActual = 1;           // toda búsqueda nueva empieza en la página 1
    orientacionActual = "";     // y sin filtro de orientación: salen todas
    select.value = "";          // el select vuelve a «Todas»
    // La galería vuelve a su aspecto de partida (el del index.html), para que no se quede en vertical o cuadrada
    gridFotosCategoria.classList.remove("orientacion-vertical", "orientacion-cuadrada");
    gridFotosCategoria.classList.add("orientacion-horizontal");
    // Pedimos las fotos a la API y bajamos la pantalla hasta la galería
    await pintarImagenes(queryActual, paginaActual, FOTOS_POR_PAGINA, orientacionActual);
    mostrarPagina();            // escribimos el tema nuevo y la página 1
    bajarAGaleria();
};

////////////////////////////////
// EVENTOS
////////////////////////////////

// Buscador: validamos el texto con la expresión regular y, si es correcto, empezamos una búsqueda nueva
formulario.addEventListener("submit", async (event) => {
    // Evitamos que el formulario recargue la página
    event.preventDefault();

    // Obtenemos el valor del input, sin espacios al principio ni al final
    const textoBuscar = inputBuscar.value.trim();

    // Validamos antes de pedir nada a la API
    if (!REGEX_BUSQUEDA.test(textoBuscar)) {
        mensajeBusqueda.textContent = "Escribe de 2 a 30 letras o números, sin símbolos.";
        return;
    }

    // Texto válido: borramos el aviso y empezamos la búsqueda nueva
    mensajeBusqueda.textContent = "";
    await nuevaBusqueda(textoBuscar);
});

// Select de orientación: al elegir una opción, filtramos la galería
select.addEventListener("change", async () => {
    const orientacion = select.value;  // leemos la opción elegida (landscape, portrait, squarish o "" = Todas)
    orientacionActual = orientacion;   // lo apuntamos para que Siguiente y Anterior lo sepan
    paginaActual = 1;                  // otra orientación = otro montón de fotos: se empieza por la 1

    // Reseteamos las clases de la galería
    gridFotosCategoria.classList.remove(
        "orientacion-horizontal",
        "orientacion-vertical",
        "orientacion-cuadrada",
    );

    // Añadimos la clase correspondiente
    if (orientacion === "portrait") {
        gridFotosCategoria.classList.add("orientacion-vertical");
    } else if (orientacion === "squarish") {
        gridFotosCategoria.classList.add("orientacion-cuadrada");
    } else {
        // "landscape" o "" (Todas): el aspecto de partida, para que la galería nunca se quede sin clase
        gridFotosCategoria.classList.add("orientacion-horizontal");
    }

    // Volvemos a consultar las fotografías y esperamos a que se pinten
    await pintarImagenes(queryActual, paginaActual, FOTOS_POR_PAGINA, orientacionActual);
    mostrarPagina();    // mismo tema, pero vuelve a la página 1
    bajarAGaleria();
});

// Siguiente: pasamos de página y pedimos las fotos del mismo tema y orientación
pagSiguiente.addEventListener("click", async () => {
    paginaActual++;     // sumamos 1 a la página
    await pintarImagenes(queryActual, paginaActual, FOTOS_POR_PAGINA, orientacionActual);
    mostrarPagina();    // escribimos la página nueva
    bajarAGaleria();
});

// Anterior: igual, pero restando; la página 0 no existe, así que en la 1 no hace nada
pagAnterior.addEventListener("click", async () => {
    if (paginaActual > 1) {
        paginaActual--;     // restamos 1 a la página
        await pintarImagenes(queryActual, paginaActual, FOTOS_POR_PAGINA, orientacionActual);
        mostrarPagina();    // escribimos la página nueva
        bajarAGaleria();
    }
});

// Delegación de eventos: un solo escuchador para las categorías, la ventana de favoritos y los corazones.
// Es async porque al pulsar una categoría esperamos (await) a que se pinte la galería.
document.addEventListener("click", async (ev) => {
    // Seleccionar una categoría: closest() comprueba el elemento pulsado y después sus padres
    const categoriaDiv = ev.target.closest("#categoria > div");

    if (categoriaDiv) {
        await nuevaBusqueda(categoriaDiv.dataset.query);
    }

    // Mostrar favoritos: pintamos la lista actualizada y abrimos la ventana
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

    // Añadir o eliminar un favorito: buscamos el botón del corazón desde el elemento donde se ha hecho clic
    const botonFavorito = ev.target.closest(".botonFavorito");

    if (botonFavorito) {
        // Buscamos hacia arriba el article que tiene ese botón y su imagen
        const tarjeta = botonFavorito.closest("article");
        const img = tarjeta.querySelector("img");

        // Recuperamos los datos de la imagen desde el propio img (con la misma forma que los de Unsplash)
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

        // Actualizamos los corazones de todas las tarjetas con esa imagen,
        // en lugar de volver a pintar toda la galería
        actualizarCorazones(imagen.id, esFavorita);

        // Si el clic ha sido dentro de la ventana de favoritos, la volvemos a pintar
        if (listaFavoritos.contains(tarjeta)) {
            pintarFavoritos();
        }
    }
});

////////////////////////////////
// API DE UNSPLASH
////////////////////////////////

/**
 * Pide datos a la API de Unsplash con fetch y los devuelve ya convertidos de JSON.
 * @param {string} url - Dirección completa de la petición (con tema, página, fotos por página y orientación).
 * @returns {Promise<Object>} Los datos de la respuesta.
 * @throws {Error} Si la respuesta no es correcta (sin conexión, clave incorrecta, error del servidor).
 * @example
 * const datos = await consultarApi(`${baseUrl}search/photos?query=nature&page=1&per_page=16`);
 * datos.results; // array con las fotos
 */
const consultarApi = async (url) => {
    try {
        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Client-ID ${CLAVE_UNSPLASH}`,
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
        console.error("Error al consultar la API:", error.message);
        // Lo relanzamos para que quien llama (pintarImagenes) avise en la página
        throw error;
    }
};

/**
 * Pide las fotos de un tema a Unsplash y las pinta en una zona de la página.
 * La orientación solo se añade a la dirección si hay una elegida: "" significa todas.
 * @param {string} [query="nature"] - Tema o palabra que se busca.
 * @param {number} [page=1] - Página de resultados que se pide.
 * @param {number} [per_page=FOTOS_POR_PAGINA] - Cuántas fotos se piden.
 * @param {string} [orientacion=""] - "landscape", "portrait", "squarish" o "" (todas).
 * @param {HTMLElement} [zona=gridFotosCategoria] - Dónde se pintan: la galería o la portada de una categoría.
 * @returns {Promise<void>} Termina cuando las fotos (o el aviso de error) ya están en la página.
 * @example
 * pintarImagenes("gatos", 2, 16, "portrait"); // página 2 de gatos en vertical, en la galería
 */
const pintarImagenes = async (
    query = "nature",
    page = 1,
    per_page = FOTOS_POR_PAGINA,
    orientacion = "",               // "" = sin filtro: no se envía orientation y Unsplash devuelve todas
    zona = gridFotosCategoria,
) => {
    try {
        // Comprobamos que existe el contenedor
        if (!zona) {
            throw new Error("No se encontró el contenedor de fotografías.");
        }

        // Montamos la dirección con lo que va siempre: tema, página y fotos por página.
        // encodeURIComponent prepara el texto para ir en la dirección (espacios, tildes, ñ...).
        let urlBusqueda = `${baseUrl}search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;

        // Si hay una orientación elegida, la pegamos al final de la dirección (si no, salen todas)
        if (orientacion !== "") {
            urlBusqueda += `&orientation=${orientacion}`;
        }

        // Pedimos a la API la dirección ya montada y esperamos los datos
        const datosRecibidos = await consultarApi(urlBusqueda);

        // Obtenemos el array de fotografías
        const fotos = datosRecibidos.results;

        // Comprobamos que existen fotografías
        if (fotos.length === 0) {
            zona.innerHTML = "<p>No se encontraron fotografías.</p>";
            return;
        }

        // Limpiamos las fotografías anteriores
        zona.innerHTML = "";

        // Recorremos el array de fotografías y preparamos cada tarjeta
        fotos.forEach((imagenObj) => {
            const tarjeta = crearImagen(imagenObj, zona, query);
            fragment.append(tarjeta);
        });

        // Añadimos todas las tarjetas al DOM de una vez
        zona.append(fragment);
    } catch (error) {
        console.error("Error al pintar las imágenes:", error.message);

        if (zona) {
            zona.innerHTML = "<p>Ha ocurrido un error al cargar las fotografías.</p>";
        }
    }
};

////////////////////////////////
// TARJETAS Y FAVORITOS
////////////////////////////////

/**
 * Comprueba si una imagen ya está guardada en favoritos.
 * @param {{id: string}} imagen - Cualquier objeto con el id de la foto.
 * @returns {boolean} true si está en favoritos.
 */
const buscarEnFavoritos = (imagen) => {
    return favoritos.some((foto) => foto.id === imagen.id);
};

/**
 * Crea la tarjeta (article) de una foto: título, imagen y botón de corazón.
 * En las portadas de las categorías el título es el tema; en la galería y en favoritos, la descripción.
 * El corazón sale lleno y rojo si la foto ya está en favoritos.
 * @param {Object} imagen - Foto con la forma de Unsplash (id, urls.small, alt_description, description).
 * @param {HTMLElement} zona - Dónde se va a pintar, para decidir qué título lleva.
 * @param {string} query - Tema buscado, que se usa como título en las portadas.
 * @returns {HTMLElement} El article listo para añadir a la página.
 */
const crearImagen = (imagen, zona, query) => {
    const contenedor = document.createElement("article");

    const titulo = document.createElement("h4");

    // En la galería y en favoritos, la descripción de la foto; en las portadas, el tema en mayúsculas
    if (zona === gridFotosCategoria || zona === listaFavoritos) {
        titulo.textContent = imagen.alt_description || "Sin título";
    } else {
        titulo.textContent = query.toUpperCase();
    }

    const img = document.createElement("img");
    img.src = imagen.urls.small;
    img.alt = imagen.alt_description || "Fotografía de Unsplash";
    img.title = imagen.description || imagen.alt_description || "Sin título";

    // Guardamos el id de la imagen directamente en el img, para saber qué foto es al pulsar el corazón
    img.dataset.id = imagen.id;

    // Creamos el botón de favoritos
    const botonFavorito = document.createElement("button");
    botonFavorito.type = "button";
    botonFavorito.classList.add("botonFavorito");
    botonFavorito.setAttribute("aria-label", "Añadir o quitar de favoritos");

    // Comprobamos si la imagen ya está guardada como favorita (true o false)
    const esFavorita = buscarEnFavoritos(imagen);

    // Icono de corazón de Font Awesome: lleno si es favorita, vacío si no
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

/**
 * Añade la foto a favoritos si no estaba, o la quita si ya estaba, y guarda la lista en LocalStorage.
 * @param {{id: string, urls: {small: string}, alt_description: string}} imagen - La foto pulsada.
 * @example
 * alternarFavorito(foto); // 1.er clic: se guarda · 2.º clic: se elimina
 */
const alternarFavorito = (imagen) => {
    // Comprobamos si ya existe en favoritos
    const existe = buscarEnFavoritos(imagen);

    if (existe) {
        // Si existe, la eliminamos: filter devuelve una lista nueva sin esa foto
        favoritos = favoritos.filter((foto) => foto.id !== imagen.id);
    } else {
        // Si no existe, la añadimos a la lista
        favoritos.push(imagen);
    }

    // Guardamos los cambios en LocalStorage (solo guarda texto: convertimos la lista a JSON)
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
};

/**
 * Pone lleno o vacío el corazón de todas las tarjetas que muestran una misma foto.
 * Una foto puede salir a la vez en la galería y en la ventana de favoritos;
 * así la parte visual sigue igual que la lista sin volver a pintar toda la galería.
 * @param {string} id - Id de la foto.
 * @param {boolean} esFavorita - true para el corazón lleno y rojo, false para vacío.
 */
const actualizarCorazones = (id, esFavorita) => {
    // Recorremos todas las tarjetas de la página
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

/**
 * Pinta en la ventana «Mis favoritos» todas las fotos guardadas, o un aviso si no hay ninguna.
 * Cada favorito usa la misma tarjeta que la galería, así que se elimina pulsando su corazón.
 */
const pintarFavoritos = () => {
    listaFavoritos.innerHTML = "";

    // Si no hay favoritos, avisamos y no hay nada más que pintar
    if (favoritos.length === 0) {
        listaFavoritos.textContent = "Todavía no tienes favoritos.";
        return;
    }

    favoritos.forEach((foto) => {
        const tarjeta = crearImagen(foto, listaFavoritos, "");
        fragment.append(tarjeta);
    });

    listaFavoritos.append(fragment);
};

/**
 * Pinta las tres colecciones de inicio (una foto horizontal de cada tema).
 * Primero crea los contenedores y después pide una foto para cada uno.
 * Cada portada guarda su tema en data-query para saber qué buscar al pulsarla.
 */
const mostrarCategorias = () => {
    categorias.forEach((query) => {
        const contenedorFotoCategoria = document.createElement("div");
        contenedorFotoCategoria.dataset.query = query;
        fragment.append(contenedorFotoCategoria);
    });

    // Primero añadimos los contenedores al DOM
    categoria.append(fragment);

    // Después cargamos la imagen de cada categoría en su contenedor
    categorias.forEach((query) => {
        const contenedor = categoria.querySelector(`[data-query="${query}"]`);
        pintarImagenes(query, 1, 1, "landscape", contenedor);
    });
};

/**
 * Desplaza la página con suavidad hasta la sección de la galería,
 * para que el usuario vea las fotos nuevas sin tener que bajar.
 */
const bajarAGaleria = () => {
    document.querySelector("#seccionFotografias").scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};

////////////////////////////////
// INICIO DE LA APLICACIÓN
////////////////////////////////

mostrarCategorias();
