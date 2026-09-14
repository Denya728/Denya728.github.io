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
Estado: CERRADO ✅

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
- Visibilidad por plan.
- Alta automática en Clientes cuando aparece un cliente nuevo en cotizaciones.

## 6. Facturación
Estado: POSPUESTO ⏸️

Se retomará después por decisión del proyecto.

- IVA.
- RFC.
- Razón social.
- Código postal fiscal.
- Régimen fiscal.
- Uso CFDI.
- Integración futura con PAC.

## 7. Planes y permisos reales
Estado: CERRADO ✅

Filosofía de planes definida:
- Emprende = lo esencial para empezar y trabajar sin complicarse.
- Negocio = operación completa para cuando ya hay más movimiento.
- Pro = extras útiles, capacidad adicional y funciones avanzadas; no debe ser necesario para operar bien.

Implementado:
- Definiciones de Emprende / Negocio / Pro centralizadas.
- Protección funcional por plan, no solo visual.
- Bloqueo de acciones críticas según el plan.
- Emprende: 1 usuario, 1 marca, cotizaciones, clientes básicos, calendario, productos/recetas/presentaciones, pedidos básicos y finanzas básicas.
- Negocio: todo Emprende + producción, planeación semanal, inventario, compras automáticas, clientes avanzados, finanzas completas, hasta 3 usuarios y 2 marcas.
- Pro: todo Negocio + reportes avanzados, roles personalizados, finanzas avanzadas, hasta 10 usuarios y 5 marcas.
- Vista Mi plan integrada dentro de Perfil.
- Negocio se presenta como el plan recomendado para operar un negocio en crecimiento.
- Pro se presenta como capa de extras y capacidad, no como requisito para tener el flujo completo.
- Límite funcional de alta de usuarios y marcas según plan.
- Mensajes de bloqueo y registro local de intentos bloqueados.

Importante:
- En esta versión estática/local los permisos son controles funcionales del frontend. La protección de seguridad a nivel servidor y aislamiento real por negocio se implementará con el punto 10.

## 8. Suscripciones
Estado: CERRADO EN DEMO ✅

Implementado:
- Suscripción integrada dentro de Perfil.
- Registro local de nombre, correo y negocio para simular alta de cuenta.
- Prueba de 14 días.
- Selección de Emprende / Negocio / Pro durante la prueba.
- Activación de suscripción sin cobro real.
- Ciclo mensual o anual.
- Cambio de plan desde la suscripción.
- Cambio de ciclo de cobro.
- Próxima fecha de renovación calculada.
- Cancelación inmediata de prueba.
- Cancelación de suscripción al final del periodo.
- Reanudación de suscripción cancelada o programada para cancelar.
- Historial local de movimientos de suscripción.
- Estado, plan, ciclo, renovación y método de pago demo visibles.
- Cambiar plan actualiza inmediatamente las capacidades del sistema.

Pendiente para producción real:
- Pasarela de pago real.
- Webhooks de cobro/renovación.
- Registro, prueba, renovaciones y cancelaciones en backend.
- Esto se conecta cuando exista el backend del punto 10.

## 9. Usuarios y roles
Estado: CERRADO EN FRONTEND ✅

Implementado:
- Propietario.
- Administrador.
- Ventas.
- Producción.
- Caja.
- Permisos funcionales por sección.
- Selector para simular qué ve cada usuario.
- Límite de usuarios según plan.
- Protección para mantener al menos un Propietario activo.
- Roles personalizados disponibles solo en Pro.
- Alta y eliminación de roles personalizados.
- Menú lateral adaptado al rol activo.

Importante:
- El selector de usuario es una simulación de sesión local. Inicio de sesión real, tokens, sesiones y autorización de servidor pertenecen al punto 10.

## 10. Base de datos real / multiempresa
Estado: PENDIENTE

- Backend.
- Base de datos.
- Aislamiento por negocio.
- Inicio de sesión real.
- Persistencia en nube.
- Autorización de servidor.
- Suscripciones y pagos reales.

## Cierre de calidad para esta semana
Estado: EN VALIDACIÓN 🔎

Implementado:
- Centro de Diagnóstico dentro de Perfil.
- Verificación de vistas críticas.
- Verificación de planes y suscripción.
- Detección de IDs duplicados en cotizaciones y pedidos.
- Revisión de cotizaciones aceptadas vinculadas a pedidos.
- Revisión de ventas cerradas con saldo 0.
- Revisión de inventario sin stock negativo.
- Revisión de límites de usuarios y marcas.
- Revisión de existencia de Propietario activo.
- Revisión de sesión simulada válida.
- Prueba destructiva segura con datos sintéticos, sin tocar información real.
- Historial local de ejecuciones QA.

Pendiente antes de declarar la versión estable:
- Ejecutar Diagnóstico con los datos actuales.
- Ejecutar Prueba destructiva segura.
- Corregir cualquier check que aparezca en rojo.
- Recorrer manualmente el flujo completo: cotizar → aceptar → anticipo → pedido → producción → inventario → entrega → venta → finanzas.
- Validar móvil y escritorio.

## Ideas nuevas agregadas durante el desarrollo

Aún ninguna. Se agregarán aquí sin perder de vista los puntos principales.
