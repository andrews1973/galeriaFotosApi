const baseUrl = "https://api.unsplash.com/";

const consultarApi = async (url) => {
    try {
        // Limpiar errores anteriores
        erroresApi.textContent = "";

        // Realizar la petición a la URL recibida
        const respuesta = await fetch(url);

        // Comprobar si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        // Convertir el JSON en datos JavaScript
        const datos = await respuesta.json();

        // Devolver los datos obtenidos
        return datos;
    } catch (error) {
        // Mostrar el error en el DOM
        console.log("Ha ocurrido un error:", error);

        pintarErrores(error.message, erroresApi);

        // Devolver null para indicar que ha habido un error
        return null;
    }
};

/////////////////////////////////////////////////////////////////
const contenedorResultados = document.querySelector("#contenedor");

const pintarDatos = async (url) => {
    // 1. Llamar a tu función consultarApi y esperar los datos
    const datos = await consultarApi(url);

    // 2. Comprobar si hubo un error (si consultarApi devolvió null, detenemos la ejecución)
    if (!datos) {
        return;
    }

    // 3. Limpiar el contenedor antes de pintar nuevos elementos
    contenedorResultados.innerHTML = "";

    // 4. Usar un DocumentFragment para mejorar el rendimiento al insertar en el DOM
    const fragmento = document.createDocumentFragment();

    // 5. Recorrer los datos (asumiendo que la API devuelve un array de objetos)
    datos.forEach((item) => {
        // Crear los elementos HTML necesarios
        const tarjeta = document.createElement("article");
        const titulo = document.createElement("h2");
        const descripcion = document.createElement("p");

        // Rellenar con las propiedades que devuelva tu API (ej. item.name, item.title, etc.)
        titulo.textContent = item.title || item.name;
        descripcion.textContent = item.body || item.description;

        // Añadir los elementos a la tarjeta y la tarjeta al fragmento
        tarjeta.append(titulo, descripcion);
        fragmento.append(tarjeta);
    });

    // 6. Pintar todo de una sola vez en el DOM
    contenedorResultados.append(fragmento);
};
//////////////////////////////////////////////////////////////////////////////

// Eventos
// Bussqueda de imagenes por input
document.addEventListener("click", (ev) => {
    if (ev.target.matches("#input")) {
        const buscarPalabraCave = input.value;
        //const busqueda = // funcion pintar 3 imagenes
        console.log(buscarPalabraCave);
    }
});

const PintarImagCategoria = () => {
    
    consultarApi(`${baseUrl}/collections?page=8`);
};
