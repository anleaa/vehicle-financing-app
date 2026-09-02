/* ==========================================================================
   SERVICIO DE BASE DE DATOS EN LA NUBE (cloudDbService.js)
   Sincronización en tiempo real con Firebase Firestore + Respaldo LocalStorage
   ========================================================================== */

// Configuración de Firebase (Reemplazar con tus llaves gratuitas de Firebase Console)
// Si no hay llaves configuradas, el sistema opera en modo Híbrido/Local automáticamente.
const firebaseConfig = {
  apiKey: "TU_FIREBASE_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const STORAGE_KEY_DB = 'vehicle_financing_credit_db_v1';

export const cloudDbService = {
  dbInstance: null,
  isCloudActive: false,

  // Inicializar Firebase si las SDKs y llaves están disponibles
  init() {
    if (window.firebase && window.firebase.apps && firebaseConfig.apiKey !== "TU_FIREBASE_API_KEY") {
      try {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }
        this.dbInstance = window.firebase.firestore();
        this.isCloudActive = true;
        console.log("☁️ Base de Datos en la Nube (Firebase Firestore) Conectada Exitosamente.");
      } catch (err) {
        console.warn("⚠️ No se pudo inicializar Firebase Cloud, usando respaldo LocalStorage:", err);
        this.isCloudActive = false;
      }
    } else {
      console.log("ℹ️ Operando en Modo Híbrido Local (LocalStorage) hasta configurar Firebase.");
      this.isCloudActive = false;
    }
  },

  // Escuchar cambios en tiempo real desde la nube
  subscribeToCloudChanges(onDataUpdate) {
    if (this.isCloudActive && this.dbInstance) {
      return this.dbInstance.collection("financing_system").doc("app_data")
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));
            onDataUpdate(data);
          }
        }, (error) => {
          console.error("Error al recibir sincronización de la nube:", error);
        });
    }
    return null;
  },

  // Guardar datos en la Nube y en LocalStorage
  async syncData(data) {
    // 1. Guardar en almacenamiento local
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));

    // 2. Si la nube está activa, sincronizar con Firestore
    if (this.isCloudActive && this.dbInstance) {
      try {
        await this.dbInstance.collection("financing_system").doc("app_data").set(data, { merge: true });
        console.log("☁️ Cambios sincronizados con la Nube Firestore.");
      } catch (e) {
        console.error("❌ Error al guardar datos en la nube:", e);
      }
    }
  }
};
