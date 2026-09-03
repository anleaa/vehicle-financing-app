/* ==========================================================================
   SERVICIO DE BASE DE DATOS EN LA NUBE (cloudDbService.js)
   Sincronización en tiempo real con Firebase Cloud (Realtime DB & Firestore)
   ========================================================================== */

// Credenciales Reales de Firebase de la cuenta del usuario
const firebaseConfig = {
  apiKey: "AIzaSyCIzNQVHRs--KpHD1bBfsnp7j4Hi9d07HI",
  authDomain: "financiamientoautos-b9878.firebaseapp.com",
  databaseURL: "https://financiamientoautos-b9878-default-rtdb.firebaseio.com",
  projectId: "financiamientoautos-b9878",
  storageBucket: "financiamientoautos-b9878.firebasestorage.app",
  messagingSenderId: "481504197968",
  appId: "1:481504197968:web:6c97770f9fe99d78134055"
};

const STORAGE_KEY_DB = 'vehicle_financing_credit_db_v1';

const cloudDbService = {
  dbInstance: null,
  rtdbInstance: null,
  isCloudActive: false,

  init() {
    if (window.firebase && window.firebase.apps) {
      try {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }
        
        if (window.firebase.database) {
          this.rtdbInstance = window.firebase.database();
        }
        if (window.firebase.firestore) {
          this.dbInstance = window.firebase.firestore();
        }
        
        this.isCloudActive = true;
        console.log("☁️ Base de Datos Nube Firebase (FinanciamientoAutos) Conectada Exitosamente.");
      } catch (err) {
        console.warn("⚠️ Operando con respaldo local debido a:", err);
        this.isCloudActive = false;
      }
    } else {
      this.isCloudActive = false;
    }
  },

  subscribeToCloudChanges(onDataUpdate) {
    this.init();

    if (this.rtdbInstance) {
      const dbRef = this.rtdbInstance.ref('financing_app_data');
      dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));
          onDataUpdate(data);
        }
      });
      return;
    }

    if (this.dbInstance) {
      return this.dbInstance.collection("financing_system").doc("app_data")
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));
            onDataUpdate(data);
          }
        });
    }
  },

  async syncData(data) {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));

    if (this.isCloudActive) {
      try {
        if (this.rtdbInstance) {
          await this.rtdbInstance.ref('financing_app_data').set(data);
          console.log("☁️ Datos sincronizados con Firebase Realtime DB.");
        } else if (this.dbInstance) {
          await this.dbInstance.collection("financing_system").doc("app_data").set(data, { merge: true });
          console.log("☁️ Datos sincronizados con Firebase Firestore.");
        }
      } catch (e) {
        console.error("Error al sincronizar con la nube:", e);
      }
    }
  }
};

// Asignar al objeto global window para disponibilidad inmediata en el navegador
window.cloudDbService = cloudDbService;
