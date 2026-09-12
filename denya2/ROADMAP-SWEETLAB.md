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

Implementado:
- Una sola área operativa con pestañas internas Pedidos / Producción.
- Buscador y filtros por estatus y mes.
- KPIs de pedidos activos, próximos, en producción y por cobrar.
- Saldo y total visibles.
- Acciones rápidas de producción y cobro.
- Lista de materiales y ficha completa por pedido.

## 3. Planeación de producción
Estado: CERRADO ✅

Implementado:
- Vista semanal de carga de trabajo.
- Navegación entre semanas.
- Pedidos agrupados por fecha de entrega.
- Capacidad diaria configurable.
- Prioridad por pedido.
- Selección múltiple para producir.
- Consolidado semanal de recetas e insumos.

## 4. Compras automáticas
Estado: CERRADO ✅

Implementado:
- Vista de compras automáticas por semana.
- Consolida insumos de pedidos pendientes.
- Compara necesidad contra stock actual.
- Muestra únicamente faltantes por comprar.
- Costo estimado por artículo y total semanal.
- Identifica los pedidos que generan cada faltante.
- Muestra proveedor si está configurado.
- Recepción por artículo o recepción masiva.
- Cada recepción incrementa inventario y registra movimiento.
- Historial de recepciones automáticas.

## 5. Clientes
Estado: EN CURSO

Implementado:
- Vista profesional tipo CRM.
- Buscador por nombre, teléfono, Instagram y notas.
- Filtros por estado y segmento.
- Segmentos: con saldo, recurrentes y sin compras.
- Comprado acumulado.
- Número de compras cerradas.
- Frecuencia promedio de compra.
- Ticket promedio.
- Última compra.
- Saldo pendiente real desde pedidos activos.
- Productos favoritos por recurrencia.
- Ficha completa de cliente.
- Historial comercial de cotizaciones/pedidos.
- Notas visibles dentro de la ficha.
- Acceso a WhatsApp.
- Visibilidad por plan: Emprende conserva contactos/notas; métricas e historial avanzado desde Negocio.
- Alta automática en Clientes cuando aparece un cliente nuevo en cotizaciones.

Pendiente para cerrar el punto:
- Validar visualmente la versión publicada.
- Confirmar con datos reales que frecuencia, favorito y saldo coincidan con el historial esperado.

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
