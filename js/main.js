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

const datosRecibidos = consultarApi("")