# DENYA SWEETLAB — Roadmap de implementación

Regla del proyecto: no abrir nuevos frentes fuera de esta lista hasta cerrar los puntos activos. Si surge una buena idea, se agrega aquí como punto nuevo y se prioriza después de los pendientes actuales, salvo que sea necesaria para desbloquear un punto en curso.

## 1. Cotización → Pedido → Producción → Venta
Estado: EN CURSO / PRIMERA IMPLEMENTACIÓN HECHA

Implementado:
- Cotización aceptada crea pedido automáticamente.
- Pedido aparece en calendario a partir de la fecha del evento.
- Pedido genera lista de materiales.
- Pedido alimenta producción.
- Inventario se descuenta al iniciar producción, una sola vez.
- Se registran movimientos de salida de inventario por producción.
- Si se cancela la cotización después de haber descontado inventario, se repone y queda movimiento de reverso.
- Pedido entregado y pagado cambia la cotización a venta cerrada y entra a finanzas/rentabilidad.

Pendiente para cerrar el punto:
- Validar visualmente todo el flujo de punta a punta.
- Revisar qué debe pasar si una cotización cambia después de iniciar producción.
- Mejorar mensajes y bloqueos de estados inconsistentes.

## 2. Pedidos profesional
Estado: PENDIENTE

- Filtros: próximos, producción, listos, entregados, cancelados.
- Saldo pendiente visible.
- Acciones rápidas: producir, listo, entregar/cobrar.
- Vista compacta y operativa.

## 3. Producción
Estado: PENDIENTE

- Qué preparar por pedido.
- Cantidades de recetas.
- Insumos necesarios.
- Faltantes por comprar.
- Costo estimado.
- Estado de producción.

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
