// ============================================================
//  Credenciales (publishable key: está diseñada para el navegador)
// ============================================================
const SUPABASE_URL = "https://htbjjtmcpjshiazcqhxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_f6VRsfcFyBRbfx0CtqIYaw_HOLZW_AW";

// ============================================================
//  Cliente
// ============================================================
const cliente = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
//  Referencias al DOM
// ============================================================
const estadoEl  = document.getElementById("estado");
const form      = document.getElementById("formProducto");
const tbody     = document.querySelector("#tablaProductos tbody");
const inNombre  = document.getElementById("nombre");
const inCategoria = document.getElementById("categoria");
const inCantidad  = document.getElementById("cantidad");
const inPrecio    = document.getElementById("precio");
const inMinimo    = document.getElementById("minimo");

// ============================================================
//  Utilidad: cambiar el estado visible
// ============================================================
function setEstado(texto, ok = true) {
  estadoEl.textContent = texto;
  estadoEl.classList.toggle("ok", ok);
  estadoEl.classList.toggle("error", !ok);
}

// ============================================================
//  Prueba de conexión (esto arregla el "Conectando…" pegado)
// ============================================================
async function probarConexion() {
  setEstado("Conectando…", true);
  try {
    const { error } = await cliente.from("productos").select("id").limit(1);
    if (error) throw error;
    setEstado("Conectado", true);
  } catch (err) {
    setEstado("Error de conexión", false);
    console.error("Fallo Supabase:", err.message);
    alert("No se pudo conectar con Supabase:\n" + err.message);
  }
}

// ============================================================
//  Cargar productos
// ============================================================
async function cargarProductos() {
  const { data, error } = await cliente
    .from("productos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al cargar:", error.message);
    return;
  }

  tbody.innerHTML = "";
  data.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.cantidad}</td>
      <td>$${Number(p.precio).toFixed(2)}</td>
      <td>${p.minimo}</td>
      <td><button class="btn-borrar" data-id="${p.id}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
//  Agregar producto
// ============================================================
async function agregarProducto(e) {
  e.preventDefault();

  const nuevo = {
    nombre:    inNombre.value.trim(),
    categoria: inCategoria.value.trim(),
    cantidad:  Number(inCantidad.value),
    precio:    Number(inPrecio.value),
    minimo:    Number(inMinimo.value)
  };

  const { data, error } = await cliente
    .from("productos")
    .insert([nuevo])
    .select();

  if (error) {
    alert("Error al guardar:\n" + error.message);
    console.error(error);
    return;
  }

  console.log("Insertado:", data);
  form.reset();
  await cargarProductos();
}

// ============================================================
//  Eliminar producto
// ============================================================
async function eliminarProducto(id) {
  if (!confirm("¿Eliminar el producto " + id + "?")) return;

  const { error } = await cliente.from("productos").delete().eq("id", id);

  if (error) {
    alert("Error al eliminar:\n" + error.message);
    console.error(error);
    return;
  }
  await cargarProductos();
}

// ============================================================
//  Eventos
// ============================================================
form.addEventListener("submit", agregarProducto);

tbody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-borrar")) {
    eliminarProducto(e.target.dataset.id);
  }
});

// ============================================================
//  Arranque
// ============================================================
(async function init() {
  await probarConexion();
  await cargarProductos();
})();
