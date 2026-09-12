# DENYA SWEETLAB — Roadmap de implementación

Regla del proyecto: no abrir nuevos frentes fuera de esta lista hasta cerrar los puntos activos. Si surge una buena idea, se agrega aquí como punto nuevo y se prioriza después de los pendientes actuales, salvo que sea necesaria para desbloquear un punto en curso.

## 1. Cotización → Pedido → Producción → Venta
Estado: CERRADO ✅

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
- El resumen de Inicio toma ventas cerradas, anticipos cobrados y saldo pendiente desde el flujo real de pedidos.

## 2. Pedidos y producción profesional
Estado: CERRADO ✅

Implementado en Pedidos:
- Una sola área operativa con pestañas internas Pedidos / Producción.
- Buscador por folio, cliente, producto, fecha y estatus.
- Filtros por Activos, Todos, Próximos, Pendiente, En producción, Listo, Entregado y pagado y Cancelado.
- Filtro por mes del evento.
- KPIs de pedidos activos, próximos, en producción y por cobrar.
- Saldo pendiente visible por pedido.
- Total del pedido visible.
- Acciones rápidas: producir, marcar listo, entregar + cobrar.
- Acceso directo a lista de materiales.
- Vista compacta tipo tabla para operación diaria.
- Ficha de detalle por pedido con progreso, estatus comercial, anticipo, saldo, producto y fechas.

## 3. Planeación de producción
Estado: CERRADO ✅

Implementado:
- Vista semanal de carga de trabajo dentro de Pedidos y producción.
- Navegación entre semanas y acceso rápido a la semana actual.
- Pedidos agrupados por fecha de entrega.
- Capacidad diaria configurable y alerta visual cuando se rebasa.
- Prioridad por pedido: Alta, Normal o Baja.
- Selección múltiple de pedidos pendientes.
- Acción “Producir seleccionados” usando el flujo real de producción e inventario.
- Consolidado semanal de recetas a preparar.
- Consolidado semanal de insumos necesarios.
- KPIs semanales de pedidos, pendientes, en producción y listos.

## 4. Compras automáticas
Estado: EN CURSO

Implementado:
- Vista de compras automáticas por semana.
- Toma únicamente pedidos pendientes de la semana para evitar volver a contar inventario ya consumido por producción.
- Consolida insumos requeridos desde las recetas/materiales reales de cada cotización.
- Compara necesidad contra stock actual.
- Muestra únicamente faltantes por comprar.
- Costo estimado por artículo y total semanal.
- Identifica qué pedidos generan cada necesidad.
- Muestra proveedor cuando el artículo ya lo tiene configurado; en caso contrario aparece “Sin proveedor”.
- Registro de recepción por artículo.
- Opción para recibir todos los faltantes de la semana.
- Cada recepción incrementa inventario y registra movimiento de entrada.
- Historial de recepciones de compras automáticas por semana.
- Acceso desde Inventario y compras y desde Planeación semanal.

Pendiente para cerrar el punto:
- Validar visualmente la versión publicada.
- Confirmar con datos reales que las unidades de compra coincidan con las unidades configuradas en inventario.

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
