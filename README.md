# Newsly

Newsly es una aplicación web tipo periódico que permite explorar noticias de Tecnología, Educación, Turismo y Negocios, consultar su información detallada, guardarlas como favoritas y comunicarse con el equipo editorial.

## Objetivo de la Entrega 2 — Prototipo funcional

Esta entrega implementa un prototipo funcional de Newsly desarrollado en **HTML, CSS y JavaScript**, con renderizado dinámico de noticias desde un archivo JSON local, gestión de favoritos, validación de formularios y un mini CRUD de administración de noticias. Mantiene la identidad visual definida en los mockups de Figma de la Entrega 1.

No incluye backend, base de datos, API remota ni autenticación real: esos componentes, junto con la migración a Angular y el despliegue público, corresponden a la Entrega 3.

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 (variables CSS, Flexbox, Grid)
- JavaScript moderno (ES2020+), sin frameworks ni TypeScript
- JSON local como fuente de datos inicial
- `localStorage` para persistencia de favoritos y del mini CRUD
- Google Fonts (Playfair Display + Inter)

## Estructura del proyecto

```text
newsly/
├── index.html            Inicio
├── noticias.html         Listado general de noticias
├── detalle.html           Detalle de una noticia (?id=)
├── nosotros.html          Quiénes somos (página estática)
├── contacto.html          Formulario de contacto
├── favoritos.html         Noticias guardadas
├── administracion.html    Mini CRUD local de noticias
├── data/
│   └── noticias.json      Catálogo base de noticias
├── partials/
│   ├── header.html        Encabezado reutilizable (inyectado por JS)
│   └── footer.html        Pie de página reutilizable (inyectado por JS)
├── css/
│   ├── variables.css      Tokens de diseño (colores, tipografía, espaciado)
│   ├── styles.css         Estilos de componentes y secciones
│   └── responsive.css     Ajustes para tablet y móvil
├── js/
│   ├── storage.js         Acceso a localStorage (favoritos, CRUD local)
│   ├── noticias.js        Carga de datos, filtros, tarjetas de noticia
│   ├── common.js          Header/footer, navegación, buscador, newsletter
│   ├── home.js             Lógica de Inicio
│   ├── listado.js         Lógica de Noticias (búsqueda/filtros/paginación)
│   ├── detalle.js         Lógica de Detalle
│   ├── favoritos.js       Lógica de Favoritos
│   ├── contacto.js        Validación del formulario de contacto
│   └── administracion.js  Mini CRUD de noticias
└── assets/
    └── images/            Imágenes de noticias, equipo y portada
```

## Cómo ejecutar el proyecto

El sitio usa `fetch()` para cargar `data/noticias.json` y los parciales de `header`/`footer`, por lo que **no funciona abriendo los archivos directamente con `file://`** (el navegador bloquea esas peticiones). Debe ejecutarse con un servidor local:

**Opción 1 — Live Server (VS Code):** instala la extensión "Live Server", clic derecho sobre `index.html` → "Open with Live Server".

**Opción 2 — Python:**
```bash
python -m http.server 5500
```
y abrir `http://localhost:5500` en el navegador.

## Funcionalidades implementadas

- Renderizado dinámico de noticias desde `data/noticias.json` en Inicio, Listado, Detalle y Favoritos.
- Búsqueda por título, contenido, categoría o autor, combinable con filtro por categoría y ordenamiento.
- Detalle de noticia leído desde la URL (`detalle.html?id=`), con noticias relacionadas y estado de error si el id no existe.
- Favoritos: agregar/quitar desde cualquier tarjeta o el detalle, persistentes entre recargas, eliminación individual y "limpiar lista" con confirmación, estado vacío.
- Formulario de Contacto con validaciones (campos obligatorios, formato de correo, longitud mínima, aceptación de política de datos) y confirmación simulada en el navegador (no se envían datos a ningún servidor).
- Mini CRUD de Administración: listar, buscar/filtrar por categoría y estado, crear noticias (validadas, como publicada o borrador) y eliminarlas con confirmación previa.
- Newsletter (Inicio y pie de página) con validación de correo simulada.
- Diseño adaptable a escritorio y móvil, con menú de navegación colapsable.

## Uso de `localStorage`

| Clave | Contenido |
|---|---|
| `newsly_favoritos_v1` | Arreglo de identificadores de noticias favoritas |
| `newsly_noticias_personalizadas_v1` | Noticias creadas desde Administración |
| `newsly_noticias_eliminadas_v1` | Identificadores de noticias base (JSON) eliminadas desde Administración |

El catálogo mostrado en la aplicación combina siempre `data/noticias.json` con las noticias personalizadas, excluyendo las eliminadas. La lectura de `localStorage` está protegida ante datos ausentes o corruptos (ver `js/storage.js`).

## Limitaciones de esta versión

- No hay backend ni base de datos: todo el contenido creado o eliminado en Administración vive únicamente en el navegador donde se usó.
- El envío del formulario de Contacto y del newsletter es simulado; no se conecta a ningún servicio de correo.
- La edición de noticias existentes no está implementada (solo creación y eliminación), conforme al alcance de esta entrega.
- Las imágenes de las noticias son de stock (Picsum Photos), descargadas localmente para que el proyecto funcione sin conexión a internet.

## Autor

[Nombre del estudiante] — Proyecto académico para el módulo de Desarrollo de Front-end.
