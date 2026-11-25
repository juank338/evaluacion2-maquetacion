// Pure catalog functions: these never touch `document` or mutate the input array.

// Builds the HTML string for a single catalog card
function crearCard(item) {
  const valorCampo = item[configuracion.campoOrden];
  const etiqueta = configuracion.etiquetaValor || "Valor";

  return `
    <div class="col">
      <article class="card h-100 rounded-0 shadow-sm">
        <img src="${item.imagen}" class="card-img-top rounded-0" alt="${item.nombre} - ${item.categoria}">
        <div class="card-body d-flex flex-column">
          <div class="mb-2">
            <span class="badge rounded-0 badge-categoria">${item.categoria}</span>
          </div>
          <h3 class="card-title h5 fw-bold">${item.nombre}</h3>
          <p class="card-text flex-grow-1">${item.descripcion}</p>
          <p class="fw-bold precio-item mb-2">${etiqueta}: $${valorCampo}</p>
          <ul class="list-unstyled small mb-0">
            <li><strong>Marca:</strong> ${item.marca}</li>
            <li><strong>Stock:</strong> ${item.stock}</li>
          </ul>
        </div>
      </article>
    </div>
  `;
}

// Joins all card HTML strings or returns a friendly empty message
function generarHTML(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return `
      <div class="col-12">
        <p class="alert alert-secondary rounded-0 mb-0">No hay resultados que coincidan con los filtros seleccionados.</p>
      </div>
    `;
  }

  return lista.map(function (item) {
    return crearCard(item);
  }).join("");
}

// Filters items by category without mutating the original list
function filtrarPorCategoria(lista, categoria) {
  const categoriaLimpia = String(categoria || "todas").trim().toLowerCase();
  const resultado = [];
  let indice = 0;

  // Use a while loop to build a new array clearly
  while (indice < lista.length) {
    const actual = lista[indice];
    if (categoriaLimpia === "todas" || actual.categoria === categoriaLimpia) {
      resultado.push(actual);
    }
    indice += 1;
  }

  return resultado;
}

// Searches case-insensitively in name and description without mutating the original list
function buscarPorTexto(lista, texto) {
  const termino = String(texto || "").trim().toLowerCase();
  if (termino === "") {
    return lista.slice();
  }

  return lista.filter(function (item) {
    const nombre = String(item.nombre || "").toLowerCase();
    const descripcion = String(item.descripcion || "").toLowerCase();
    return nombre.includes(termino) || descripcion.includes(termino);
  });
}

// Returns a sorted copy according to criteria without modifying the original array
function ordenarItems(lista, criterio) {
  const copia = lista.slice();
  const campo = configuracion.campoOrden;

  copia.sort(function (a, b) {
    if (criterio === "valor-asc") {
      return Number(a[campo]) - Number(b[campo]);
    } else if (criterio === "valor-desc") {
      return Number(b[campo]) - Number(a[campo]);
    } else {
      return String(a.nombre).localeCompare(String(b.nombre), "es", { sensitivity: "base" });
    }
  });

  return copia;
}

// Chains category filter, text search, and sorting in order
function aplicarFiltros(lista, estado) {
  const estadoActual = estado || {};
  const porCategoria = filtrarPorCategoria(lista, estadoActual.categoria);
  const porTexto = buscarPorTexto(porCategoria, estadoActual.texto);
  return ordenarItems(porTexto, estadoActual.orden);
}

// Interface state and DOM helpers (only actualizarVista and iniciar touch `document`)
const estado = {
  categoria: "todas",
  texto: "",
  orden: "nombre-asc"
};

function actualizarVista() {
  const contenedorCatalogo = document.getElementById("catalogo");
  const contadorElemento = document.getElementById("contador");

  if (!contenedorCatalogo || !contadorElemento) {
    return;
  }

  const filtrados = aplicarFiltros(items, estado);
  contenedorCatalogo.innerHTML = generarHTML(filtrados);
  contadorElemento.textContent = "Mostrando " + filtrados.length + " de " + items.length;
}

function iniciar() {
  const botonesFiltro = document.querySelectorAll("#filtros-categoria button[data-categoria]");
  const inputBuscador = document.getElementById("buscador");
  const selectOrden = document.getElementById("orden");

  let i = 0;
  while (i < botonesFiltro.length) {
    const boton = botonesFiltro[i];
    boton.addEventListener("click", function () {
      estado.categoria = boton.getAttribute("data-categoria") || "todas";

      let j = 0;
      while (j < botonesFiltro.length) {
        const btn = botonesFiltro[j];
        const esElegido = btn === boton;
        btn.setAttribute("aria-pressed", esElegido ? "true" : "false");
        if (esElegido) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
        j += 1;
      }

      actualizarVista();
    });
    i += 1;
  }

  if (inputBuscador) {
    inputBuscador.addEventListener("input", function (evento) {
      estado.texto = evento.target.value;
      actualizarVista();
    });
  }

  if (selectOrden) {
    selectOrden.addEventListener("change", function (evento) {
      estado.orden = evento.target.value;
      actualizarVista();
    });
  }

  actualizarVista();
}

document.addEventListener("DOMContentLoaded", iniciar);