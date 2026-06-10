# Motor 4.0 — PWA Demo · Guía de despliegue

## Archivos
```
motor40-pwa/
├── index.html      ← App completa (una sola página)
├── sw.js           ← Service Worker (modo offline + instalable)
├── manifest.json   ← Metadata PWA para Android
├── icon-192.png    ← Ícono app (generá uno o usá placeholder)
└── icon-512.png    ← Ícono splash
```

---

## 1. Subir a hosting HTTPS (obligatorio para PWA + NFC)

### Opción más rápida: GitHub Pages (gratis)
```bash
# En tu repo de GitHub
git init
git add .
git commit -m "Motor 4.0 PWA"
git push origin main
# Settings → Pages → Source: main / root
# URL: https://tuusuario.github.io/motor40-pwa/
```

### Opción alternativa: Netlify (drag & drop)
1. Ir a netlify.com → "Deploy manually"
2. Arrastrar la carpeta motor40-pwa/
3. Obtener URL HTTPS en segundos

---

## 2. Conectar tus paneles de Grafana

En `index.html`, buscá las líneas con `data-src="TU_URL_GRAFANA_..."` y reemplazalas:

```html
<!-- Para cada panel de Grafana: -->
<!-- 1. Abrí el panel en Grafana -->
<!-- 2. Menú Share → Embed -->
<!-- 3. Copiá la URL del iframe -->
<!-- 4. Pegala en el data-src correspondiente -->

data-src="TU_URL_GRAFANA_TEMPERATURA"  → panel de temperatura
data-src="TU_URL_GRAFANA_CORRIENTE"    → panel de corriente RMS
data-src="TU_URL_GRAFANA_RMS"          → panel RMS vibración
data-src="TU_URL_GRAFANA_FFT"          → panel espectro FFT
data-src="TU_URL_GRAFANA_SALUD"        → panel tendencia de salud
```

### Configurar Grafana para permitir embed:
En grafana.ini (o variables de entorno):
```ini
[security]
allow_embedding = true
cookie_samesite = disabled
```

---

## 3. Instalar la PWA en el celular Android

1. Abrí Chrome en el celular
2. Navegá a tu URL HTTPS
3. Chrome muestra banner "Agregar a pantalla de inicio"
   (o: menú ⋮ → "Instalar aplicación")
4. Confirmá → queda en el home como app nativa

---

## 4. Programar el tag NFC

### Usando la app "NFC Tools" (Android, gratis):
1. Abrí NFC Tools → Write → Add a record
2. Elegí: **Custom URL / URI**
3. Usá el tipo de intent que abre la PWA directamente:

```
# Si la PWA ya está instalada, este intent la abre directamente:
intent://tuusuario.github.io/motor40-pwa/index.html#Intent;scheme=https;end

# Si no, simplemente la URL HTTPS también funciona:
https://tuusuario.github.io/motor40-pwa/index.html
```

4. Write → apoyá el celular sobre el tag
5. Listo — probá apoyando el celular en modo reposo

### Tip para la demo:
- Usá tags NTAG213 (son los más baratos y compatibles)
- Pegatlos sobre la carcasa del motor o en una plaquita metálica cerca
- Con un separador metálico de 1-2mm entre el tag y la carcasa metálica mejora la lectura

---

## 5. Simular datos reales (mientras conectás la API)

La app tiene simulación de métricas incorporada. Para conectar datos reales,
reemplazá la función `updateMetrics()` en index.html:

```javascript
async function updateMetrics() {
  // Ejemplo con AWS SiteWise (requiere Lambda o API Gateway como proxy):
  const res = await fetch('https://tu-api.amazonaws.com/motor/4712/latest');
  const d   = await res.json();

  set('mTemp',  d.temperatura.toFixed(1), tempColor(d.temperatura));
  set('mRms',   d.rms_vibracion.toFixed(2), rmsColor(d.rms_vibracion));
  set('mCurr',  d.corriente_rms.toFixed(1), 'accent');
  set('mOnOff', d.estado === 1 ? 'ON' : 'OFF', d.estado ? 'ok' : 'danger');
  set('mHealth', d.health_score + '%', healthColor(d.health_score));
}
```

---

## 6. Personalizar datos del AAS Tipo

En `index.html`, sección `tab-aas`, editá los datos fijos del motor:
- Fabricante, modelo, potencia, velocidad
- Composición de materiales (kg de Cu, Fe, Al)
- Huella de carbono
- Eficiencia nominal

Estos datos vienen del AAS Tipo (placa del motor + datasheet del fabricante).

---

## Resultado esperado en la demo

1. Apoyás el celular sobre el motor → la app se abre instantáneamente
2. Header muestra ID del motor y badge de salud en verde/amarillo/rojo
3. Barra superior: temperatura, vibración RMS, corriente, estado ON/OFF, score de salud
4. Tab "EN VIVO": gráficas de Grafana en tiempo real
5. Tab "VIBRACIÓN": RMS + espectro FFT
6. Tab "PREDICCIÓN": anillo RUL + lista de alertas predictivas
7. Tab "FICHA AAS": composición materiales, eficiencia nominal vs real
8. Tab "HISTORIAL": log de eventos, mantenimientos, alertas pasadas
