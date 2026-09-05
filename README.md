# 🏡 RentaCasa — Sistema de Gestión de Alquiler Coliving & Media Temporada

Aplicación web integral diseñada para la gestión profesional de alquiler de media temporada (**alquiler por habitaciones coliving** y **apartamentos independientes** con cobro de suministros), conforme al **art. 3 de la Ley de Arrendamientos Urbanos (LAU)** de España.

Diseñado con arquitectura **Multi-Dueño**, firma digital móvil con **Audit Trail probatorio**, motor de cálculo de suministros y empaquetado para despliegue automático en servidores **Linux con Portainer y Docker**, compatible con proxy inverso de **Nginx y Cloudflare**.

---

## 🚀 Características Principales

### 1. Estructura Jerárquica & Calendario Gantt de Ocupación
* **Inmueble Padre:** Gastos fijos (IBI, Comunidad, Seguro, Fibra), zonas comunes, normas generales y credenciales WiFi.
* **Unidades Hijas:** Habitaciones con metros, cama, escritorio, baño privado o compartido, precio base, fianza y tope de suministros (ej. 35 €/mes). Apartamentos independientes con registro de contador/subcontador eléctrico.
* **Línea Temporal / Gantt:** Matriz interactiva de habitaciones $\times$ meses para prever con meses de antelación la rotación de febrero (fin de 1er cuatrimestre universitario) y junio (fin de curso), evitando habitaciones vacías.

### 2. Generador de Contratos de Media Temporada (Blindaje Legal LAU Art. 3)
* **Causa de Temporalidad Obligatoria:** Formulario estructurado para justificar legalmente la no habitualidad (Estudios universitarios/Máster, contrato laboral temporal/obra, nómadas digitales, prácticas) con adjunto probatorio.
* **Cláusula de Exclusión de Vivienda Habitual:** Declaración jurada de mantener residencia permanente en otra localidad y renuncia a prórrogas forzosas de la LAU.
* **Prohibición Expresa de Subarriendo:** Prohibición tajante de cesión o alquiler turístico en plataformas tipo Airbnb bajo causa de rescisión inmediata.
* **Anexo I (Normas de Convivencia):** Silencio nocturno (23:00 a 08:00 h), política de visitas (máx. 2 noches), turnos de cocina y prohibición de fumar o fiestas.
* **Anexo II (Inventario Digital):** Mobiliario con plazo estricto de 48 horas tras la entrega de llaves para reportar fotos de desperfectos preexistentes.

### 3. Firma Digital Móvil (Magic Link + Canvas + Audit Trail)
* **Enlace de un solo uso con caducidad:** URL única tipo `/firmar/[token]` que se envía por WhatsApp sin obligar al inquilino a descargar aplicaciones nativas ni registrarse.
* **Visor Móvil Adaptado:** Tarjetas resumen de puntos clave con botón para desplegar el documento legal completo.
* **Lienzo Táctil (HTML5 Canvas):** Firma con el dedo en pantalla.
* **Hoja de Evidencias (Audit Trail):** Registro fehaciente de fecha y hora UTC, IP pública (obtenida de Cloudflare `CF-Connecting-IP` o Nginx `X-Forwarded-For`), User-Agent del dispositivo y Hash criptográfico SHA-256 (conforme Reglamento eIDAS y Ley 6/2020).

### 4. Motor Inteligente de Suministros (Luz, Agua, Gas, Internet)
* **Apartamentos (Repercusión directa):** Prorrateo por días exactos de estancia dentro del ciclo de facturación.
* **Habitaciones Coliving (Bolsa de topes incluidos):** Cada habitación tiene un tope incluido (ej. 35 €/mes). Se calcula la bolsa común de las habitaciones ocupadas. Si la factura real supera la bolsa, el exceso se reparte equitativamente entre los inquilinos activos y se añade automáticamente al recibo del mes siguiente.

### 5. Finanzas, Semáforo de Cobros y Rentabilidad Real
* **Tablero Semáforo Mensual:**
  * 🟢 **Verde (Pagado):** Con fecha y método (Transferencia, Bizum, Efectivo).
  * 🟡 **Amarillo (En plazo):** Días 1 al 5 de cada mes.
  * 🔴 **Rojo (Atrasado):** Botón directo de **WhatsApp con recordatorio pre-redactado en 1 clic**.
* **Ciclo de Vida de la Fianza:** Custodia con referencia autonómica (AVRA, IVIMA, INCASÒL) y calculadora de liquidación al check-out descontando limpieza, desperfectos y luz pendiente.
* **Rentabilidad Neta y Reparto de Socios:**
  * Cálculo de Cash Flow Neto Mensual y Cap Rate / Yield neto anualizado.
  * Liquidación automática de beneficios entre co-propietarios según su porcentaje (ej. 50% / 50%).

### 6. Operativa Diaria & Buzón Oficial
* **Portal Ligero del Inquilino:** Acceso directo para consultar accesos WiFi, cuadro eléctrico, contrato, recibos e incidencias.
* **Buzón de Incidencias:** Reporte con selector de habitación vs zona común, nivel de urgencia y fotos.
* **Limpieza de Zonas Comunes:** Calendario público de visitas del personal de limpieza.
* **Comunicaciones Oficiales:** Avisos vinculantes del arrendador con acuse de lectura fechado e IP trazable.

---

## 👥 Modelo de Permisos y Roles

| Rol | Alcance |
| :--- | :--- |
| **SUPERADMIN (Tú)** | Creador y moderador de la plataforma. Acceso absoluto a todos los propietarios, todos los inmuebles, métricas globales agregadas y auditoría del sistema. |
| **ADMIN (Dueño Principal)** | Solo gestiona y ve **sus propios inmuebles**: altas/bajas de habitaciones, precios, gastos fijos, contratos, facturas y configuración de socios. Aislamiento total de datos. |
| **CO_OWNER (Socio Inversor)** | Visualización en tiempo real de métricas de rentabilidad, ocupación y liquidación mensual según su porcentaje de participación (ej. 50%). |
| **MANAGER (Gestor / Operador)** | Operativa del día a día: gestión de averías, limpiezas y check-ins. **Sin acceso a datos fiscales ni financieros privados de los dueños**. |
| **TENANT (Inquilino)** | Portal ligero exclusivo para ver su habitación, recibos, reportar incidencias y confirmar avisos formales. |

---

## 🔑 Credenciales de Prueba (Simulador Rápido en 1 Clic)

En la pantalla de inicio de sesión (`/login`), dispones de un **Simulador de Roles de 1 Clic** para acceder instantáneamente con cualquier perfil sin necesidad de escribir contraseñas:

* **Superadmin:** `superadmin@rentacasa.com` (Contraseña: `admin123`)
* **Dueño Principal (Admin):** `propietario@rentacasa.com` (Contraseña: `admin123`)
* **Socia Inversora (Co-owner 50%):** `socio@rentacasa.com` (Contraseña: `admin123`)
* **Gestor Operativo (Manager):** `gestor@rentacasa.com` (Contraseña: `admin123`)
* **Inquilino (Juan M.):** `juan.estudiante@rentacasa.com` (O acceso directo mediante token `/portal/tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e`)

---

## 🐳 Despliegue en Servidor Portainer (Linux) vía GitHub

El proyecto está 100% preparado para ser sincronizado directamente como un **Stack de Portainer**:

### Paso 1: Subir a tu repositorio de GitHub
```bash
git add .
git commit -m "Initial release RentaCasa Coliving Platform"
git push origin main
```

### Paso 2: Crear el Stack en Portainer
1. Abre tu panel de **Portainer** en tu servidor Linux.
2. Ve a **Stacks** ➔ **Add stack**.
3. Selecciona el método **Repository**.
4. Pega la URL de tu repositorio de GitHub: `https://github.com/tu-usuario/tu-repositorio.git`.
5. Selecciona la rama `main` y en *Compose path* indica `docker-compose.yml`.
6. En la sección **Environment variables**, añade o ajusta:
   ```env
   DATABASE_URL=postgresql://postgres:postgrespassword@db:5432/rentacasa?schema=public
   NEXTAUTH_SECRET=clave_secreta_super_segura_de_produccion_32_caracteres
   NEXTAUTH_URL=https://tu-dominio-alquiler.com
   NEXT_PUBLIC_APP_URL=https://tu-dominio-alquiler.com
   NODE_ENV=production
   ```
7. Haz clic en **Deploy the stack**.

> **Nota:** El archivo `entrypoint.sh` se ejecutará automáticamente al arrancar el contenedor, sincronizando el esquema de PostgreSQL e inicializando las semillas de datos de prueba sin necesidad de acceder a la consola.

---

### ⚠️ Solución al Error `504 Gateway Time-out (OpenResty / Nginx Proxy Manager)`

Si al hacer clic en **Deploy the stack** en Portainer recibes un error tipo:
```html
504 Gateway Time-out (openresty)
```

**¿Por qué ocurre este error?**
1. **Compilación en segundo plano más lenta que el timeout del proxy:** Portainer está clonando el repositorio, descargando paquetes de Node y compilando Next.js (`npm run build`). Si tu servidor tiene recursos moderados (1-2 vCPU), el build puede tardar entre 2 y 4 minutos.
2. Si tienes Portainer detrás de un reverse proxy como **Nginx Proxy Manager (que usa OpenResty)**, Traefik o Cloudflare, el proxy corta la conexión HTTP a los 60 segundos con un `504 Gateway Time-out`, **¡pero el servidor sigue compilando y levantando los contenedores en segundo plano!**

**¿Qué hacer si te aparece?**
1. **No pulses repetidamente en Deploy:** Espera 1 o 2 minutos.
2. Ve al menú lateral de Portainer ➔ **Containers**.
3. Verás que `renta-casa-app` y `renta-casa-db` se están creando o ya están en estado `running`.
4. Si quieres evitar que vuelva a saltar el timeout en el proxy de Portainer:
   * En **Nginx Proxy Manager** (en la pestaña *Advanced* del host de Portainer), aumenta los timeouts:
     ```nginx
     proxy_connect_timeout 600;
     proxy_send_timeout 600;
     proxy_read_timeout 600;
     send_timeout 600;
     ```
   * O bien accede a Portainer directamente por su IP y puerto local (ej. `http://IP-SERVIDOR:9000` o `9443`) para desplegar stacks con build de Docker sin intermediarios.

---

### ⚠️ Solución al Error `Prisma schema validation - P1012 (The datasource property url is no longer supported)`

Si observas en los logs del contenedor:
```text
Error: The datasource property `url` is no longer supported in schema files...
Prisma CLI Version : 7.x.x
```
**Causa:** Prisma lanzó la versión 7 que rompe la sintaxis de `url = env(...)` de Prisma v5. Si se invoca `npx prisma`, `npx` puede descargar la versión 7 por defecto.
**Solución implementada:** En `Dockerfile` y `entrypoint.sh` se incluye `node_modules` y se invoca directamente `./node_modules/.bin/prisma` para garantizar la ejecución estricta de **Prisma v5.21.1**. Asegúrate de marcar **Re-pull / Re-build** en Portainer para descartar imágenes en caché antiguas.

---

## 🌐 Configuración con Cloudflare y Nginx (Proxy Inverso)

Para que el **Audit Trail legal** registre la dirección IP pública real del inquilino al firmar desde el móvil, se incluye una plantilla en `nginx.conf.example`.

Asegúrate de incluir en tu bloque de Nginx:
```nginx
# Restaurar la IP real provista por Cloudflare
real_ip_header CF-Connecting-IP;
set_real_ip_from 173.245.48.0/20;
# ... (ver lista completa en nginx.conf.example)

location / {
    proxy_pass http://127.0.0.1:3060;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
}
```
