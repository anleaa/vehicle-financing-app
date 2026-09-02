# 🚗 Sistema de Gestión de Financiamiento de Vehículos a Crédito

Aplicación web progresiva orientada a la **Gestión de Financiamiento de Vehículos a Crédito y Control Semanal**, optimizada con **Mobile-First UI para teléfonos celulares**, abonos editables, barra de progreso a 14 meses, pausas/semanas libres por taller, contratos archivados al 100% de liquidación y sincronización en la Nube.

---

## 🌟 Características Principales

1. **📱 Interfaz Celular (Mobile-First UI)**:
   - Barra de navegación inferior adhesiva (Sticky Bottom Navigation Bar) con botones táctiles de acceso rápido: `[ 🚗 Créditos ]`, `[ ➕ Nuevo ]`, `[ 📦 Archivados ]`, `[ 📊 Balance ]`.
   - Buscador rápido por placa con autocompletado en tiempo real.

2. **📊 Barra de Progreso del Financiamiento**:
   - Muestra de forma interactiva el **Costo Total del Vehículo**, **Monto Total Pagado**, **Saldo Pendiente por Pagar** y **% Completado**.

3. **💰 Abonos Semanales con Monto Editable**:
   - Permite registrar el abono semanal modificando libremente el campo **"Monto a Cancelar ($ USD)"** (sugiere $200 USD base, pero acepta montos mayores o menores).

4. **🔵 Pausa / Semana Libre ($0.00)**:
   - Permite congelar semanas especificando el motivo (taller, mantenimiento, repuestos) sin cobrar los $200 ni generar mora.

5. **📄 Comprobantes PDF con Firmas**:
   - Generación de recibos de abono en PDF con saldos anteriores, nuevos saldos y recuadros impresos para la **Firma del Vendedor** y la **Firma del Comprador**.

6. **☁️ Sincronización en la Nube (Multidispositivo)**:
   - Integrado con **Firebase Firestore** para sincronizar datos automáticamente entre múltiples celulares, computadoras y tablets en tiempo real.

---

## 🚀 Cómo Usar en Celular o Navegador

1. **Abrir en Navegador**: Abre `index.html` en Chrome, Safari o cualquier navegador móvil.
2. **Nube en Tiempo Real**: Configura tus llaves de Firebase en `cloudDbService.js` para tener sincronización automática multidispositivo.

---

## ☁️ Configuración de Base de Datos Nube (Firebase Firestore)

Para activar la sincronización nube multidispositivo:
1. Crea un proyecto gratuito en [Firebase Console](https://console.firebase.google.com/).
2. Activa **Firestore Database** en modo de prueba.
3. Copia tus llaves de configuración de Firebase y pégalas en el archivo `cloudDbService.js`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3 Mobile-First, React 18, Babel Standalone.
- **Nube / Persistencia**: Firebase Firestore, LocalStorage.
- **PDF & Utilidades**: HTML2PDF.js, Lucide Icons.

---

## ✒️ Autor

Desarrollado para **anleaa** (`ing.andreasoftware@gmail.com`).
