# DENYA SWEETLAB — Roadmap de implementación

Regla del proyecto: no abrir nuevos frentes fuera de esta lista hasta cerrar los puntos activos. Si surge una buena idea, se agrega aquí como punto nuevo y se prioriza después de los pendientes actuales, salvo que sea necesaria para desbloquear un punto en curso.

## 1. Cotización → Pedido → Producción → Venta
Estado: EN CURSO / FLUJO PRINCIPAL CERRADO, FALTA VALIDACIÓN VISUAL

Implementado:
- Cotización aceptada crea pedido automáticamente.
- Pedido aparece en calendario a partir de la fecha del evento.
- Pedido genera lista de materiales.
- Pedido alimenta producción.
- Inventario se descuenta al iniciar producción, una sola vez.
- Se registran movimientos de salida de inventario por producción.
- Si se cancela la cotización después de haber descontado inventario, se repone y queda movimiento de reverso.
- Pedido entregado y pagado cambia la cotización a venta cerrada y entra a finanzas/rentabilidad.
- Una cotización no puede cambiar producto, presentación, recetas o materiales mientras el pedido esté en producción, listo o entregado.
- Se bloquearon cambios de estado inconsistentes en pedidos.
- Un pedido en producción o listo puede regresar a Pendiente con confirmación y reposición del inventario descontado.
- El resumen de Inicio ahora toma ventas cerradas desde Pedidos y prioriza la fecha real de cierre; si un pedido antiguo no tiene fecha de cierre usa la fecha del evento.

Pendiente para cerrar el punto:
- Validar visualmente todo el flujo de punta a punta en la versión publicada.

## 2. Pedidos y producción profesional
Estado: EN CURSO

- Una sola área operativa con pestañas internas Pedidos / Producción.
- Filtros: próximos, producción, listos, entregados, cancelados.
- Saldo pendiente visible.
- Acciones rápidas: producir, listo, entregar/cobrar.
- Vista compacta y operativa.
- Qué preparar por pedido.
- Cantidades de recetas.
- Insumos necesarios.
- Faltantes por comprar.
- Costo estimado.
- Estado de producción.

## 3. Planeación de producción
Estado: PENDIENTE

- Vista semanal de carga de trabajo.
- Agrupar pedidos por fecha de entrega.
- Consolidar cantidades de recetas a preparar.
- Prioridades y capacidad de producción.
- Enviar pedidos seleccionados a producción.

## 4. Compras automáticas
Estado: PENDIENTE

- Necesidades semanales.
- Comparar contra inventario.
- Generar solo faltantes.
- Agrupar por artículo/proveedor cuando sea posible.

## 5. Clientes
Estado: PENDIENTE

- Historial completo.
- Comprado acumulado.
- Frecuencia.
- Ticket promedio.
- Última compra.
- Productos favoritos.
- Notas.
- Visibilidad por plan.

## 6. Facturación
Estado: PENDIENTE

- IVA.
- RFC.
- Razón social.
- Código postal fiscal.
- Régimen fiscal.
- Uso CFDI.
- Integración futura con PAC.

## 7. Planes y permisos reales
Estado: PENDIENTE

- Emprende / Negocio / Pro.
- Protección real de permisos, no solo visual.
- Límites por usuarios, marcas y funciones.

## 8. Suscripciones
Estado: PENDIENTE

- Registro.
- Prueba de 14 días.
- Elegir plan.
- Pago.
- Renovación/cancelación.
- Cambio de plan.

## 9. Usuarios y roles
Estado: PENDIENTE

- Dueño.
- Administrador.
- Ventas.
- Producción.
- Caja.
- Roles personalizados en Pro.

## 10. Base de datos real / multiempresa
Estado: PENDIENTE

- Backend.
- Base de datos.
- Aislamiento por negocio.
- Inicio de sesión real.
- Persistencia en nube.

## Ideas nuevas agregadas durante el desarrollo

Aún ninguna. Se agregarán aquí sin perder de vista los 10 puntos principales.
