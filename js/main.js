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




