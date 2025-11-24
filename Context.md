# Contexto y especificación: Feature "Ordenar contenidos por Sección"

Prioridad: 1

Resumen rápido

- Objetivo: agregar dentro del flujo de edición de una Sección (UI: `SectionForm`) un modal que liste todos los contenidos de esa sección (por `categoryId` + `sectionId`), permita reordenarlos vía drag & drop y, al guardar, envíe al backend el nuevo orden.
- Endpoints backend involucrados:

  - GET `/api/Content/{categoryId}/{sectionId}`

    - Respuesta esperada (ejemplo):
      {
      "success": true,
      "message": "items-by-category-section",
      "data": [ { ... }, { ... } ]
      }
    - `data` es un array de objetos contenidos. Cada objeto tiene, entre otros, `id` y `contentTitle`.

  - POST `/api/Content/update-order`
    - Body esperado (según especificación dada):
      {
      "idContent": 0,
      "idContent": 1,
      "idContent": 2
      }
    - Nota: el ejemplo de body provisto en la petición del usuario es poco convencional (claves repetidas). En la implementación concreta deberemos confirmar formato con backend (preferible: un array de ids, p.e. `{ "ids": ["id1","id2"] }`). Aquí documentamos la forma solicitada por el Product Owner y dejamos la validación del formato como punto de verificación con backend.

Dónde integrar (repositorio)

- UI actual: `src/pages/AdminPanel.tsx` abre el modal de edición con `SectionForm` pasando `editingSection` y `categoryId`.
- `SectionForm` (archivo actual): `src/components/SectionForm.tsx` — recibe `editingSection?: Section | null` y `categoryId: string`. Es el lugar más lógico para exponer el botón que abre el nuevo modal de ordenamiento.

Comportamiento UI requerido (detallado)

1. En `SectionForm` añadir un botón (p. ej. "Reordenar contenidos") visible cuando la sección ya existe (es decir, `editingSection?.id` disponible). En creación de sección (no existe `id`) el botón puede estar deshabilitado o invisible.

2. Al pulsar el botón se abre un nuevo modal hijo (Within `SectionForm` or mounted by parent) que:

   - Llama a `GET /api/Content/{categoryId}/{sectionId}` usando los valores actuales de `categoryId` y `editingSection.id`.
   - Muestra una lista ordenable (drag & drop) de todas las entradas devueltas, mostrando al menos `contentTitle` y opcionalmente `contentType` o fecha.
   - Permite reordenar mediante mouse (drag & drop). La UX debe mostrar un manejo claro (handle, cursor, placeholder durante drag).
   - Internamente mantiene el orden actual como un array de objetos: `[ { id, contentTitle, ... }, ... ]`.

3. Guardado:

   - Al confirmar (botón "Guardar orden") construir un payload que represente el nuevo orden.
   - Según la especificación inicial, el backend espera un body con claves `idContent` (ver nota arriba). Mientras no se confirme lo siguiente, documentar ambas alternativas:
     - Forma literal solicitada: `{ "idContent": 0, "idContent": 1, "idContent": 2 }` (no válida en JSON estándar porque repetir claves sobreescribe; por eso no recomendable)
     - Forma preferible (recomendada por frontend): `{ "ids": ["uuid1","uuid2","uuid3"] }` o `{ "order": [{"id":"uuid1","orderIndex":0}, ...] }`.
   - Enviar POST a `/api/Content/update-order` con el payload acordado.
   - Mostrar feedback (éxito/fracaso) y cerrar modal en caso de éxito.

4. Reglas de orden:
   - El primer ítem en la lista del modal tendrá orderIndex = 0.
   - El último tendrá orderIndex = n-1.
   - El backend debe persistir `orderIndex` por cada contenido.

Consideraciones técnicas y de integración

- Dónde colocar la llamada al servicio GET:

  - Opción A (recomendada): dentro de `SectionForm` (encapsulado). `SectionForm` usa `useEffect` cuando `isOpen` o `editingSection.id` cambian para cargar la lista desde `/api/Content/{categoryId}/{sectionId}`. Ventaja: encapsulación y menor acoplamiento con `AdminPanel`.
  - Opción B: calcular `sectionContents` en `AdminPanel` (ya dispone de `contents` del hook `useContent`) y pasar como prop a `SectionForm`. Ventaja: evita llamada adicional si ya tienes datos actualizados en memoria.

- Drag & drop: usar una librería pequeña y bien probada (p.ej. `@dnd-kit/core` o `react-beautiful-dnd`) para gestionar reordenamiento accesible. Documentar dependencia si se implementa.

- Formato del payload al guardar: confirmar con backend. Recomiendo enviar `{ "order": [{ "id": "<content-id>", "orderIndex": 0 }, ...] }` o `{ "ids": ["id1","id2","id3"] }`. Si backend insiste en formato diferente, adaptar en un adaptador local.

- Validación y errores:

  - Validar que `categoryId` y `sectionId` estén presentes antes de llamar al GET.
  - Manejar estados: carga, vacío (no contenidos), error de red.
  - Control de bloqueo durante POST (evitar múltiples envíos). Mostrar spinner/disabled en botón "Guardar orden".

- Experiencia UX:
  - Permitir cancelar (no persistir cambios locales si se cierra el modal).
  - Mostrar un contador del número de items y posición actual al arrastrar (opcional).

Compatibilidad con el código existente y rutas de trabajo

- No es necesario refactorizar `AdminPanel` para esta feature; `SectionForm` ya recibe lo necesario (`categoryId` y `editingSection`).
- Si se opta por Opción B (precomputado en `AdminPanel`), añadir prop `sectionContents?: Content[]` a `SectionForm` y ajustar llamadas.

Propuesta de pasos de implementación (por fases)

1. Crear modal y UI estática dentro de `SectionForm` que reciba datos simulados (mock) y soporte drag & drop (sin persistencia). Pruebas visuales.
2. Implementar llamada real GET `/api/Content/{categoryId}/{sectionId}` en `SectionForm` y mapear respuesta (`data` array) a la UI.
3. Implementar reordenamiento gráfico (drag & drop) y obtener array de ids ordenados.
4. Definir con backend el formato exacto para `/api/Content/update-order`. Implementar POST con payload adaptado y manejar respuesta.
5. Tests manuales y cobertura de errores.

Notas y decisiones abiertas

- Confirmar con backend el formato exacto del body para `/api/Content/update-order`.
- Decidir si se añade una nueva dependencia para drag & drop (`@dnd-kit` o `react-beautiful-dnd`).

Checklist (para seguimiento)

- [ ] Confirmar formato `update-order` con backend.
- [ ] Implementar modal + UI drag & drop (Stage).
- [ ] Implementar GET `/api/Content/{categoryId}/{sectionId}` y mapping `data`.
- [ ] Implementar POST `/api/Content/update-order` con payload acordado.
- [ ] Añadir tests/manual QA y mensajes de error claros.

Referencias y recomendaciones previas (resumen de lo sugerido antes)

- Extraer tabs a componentes separados: `ContentTab`, `CategoriesTab`, `UsersTab`, `AnalyticsTab`, `SettingsTab`.
- Centralizar estados y handlers con `useAdminModals()` y `useAdminData()` si se hace refactor mayor.
- HOC/Hook sugeridos:
  - `withSectionContents` / `useSectionContents(categoryId, sectionId)` para inyectar la lista de contenidos por sección.
  - `withAuthorization` para ocultar tabs según `user.role`.

Ruta del archivo creado

- `Context.md` (este archivo)

Fin del documento.
