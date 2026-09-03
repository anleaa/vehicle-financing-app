/* ==========================================================================
   SISTEMA DE GESTIÓN DE FINANCIAMIENTO DE VEHÍCULOS A CRÉDITO Y CONTROL SEMANAL
   React 18 + Firebase Cloud Sync + Admin Andres Rebolledo
   ========================================================================== */

const { useState, useEffect } = React;

// CREDENCIALES OFICIALES DE ADMINISTRADOR
const OFFICIAL_ADMIN = {
  name: 'Andres Rebolledo',
  username: 'andres.rebolledo',
  altUsername: 'andres',
  password: 'Andres2026!',
  role: 'Administrador Principal'
};

// Claves de Almacenamiento
const STORAGE_KEY_DB = 'vehicle_financing_credit_db_v1';
const STORAGE_KEY_AUTH = 'vehicle_financing_auth_session_v2';

// Datos de Demostración Iniciales (Semillas)
const INITIAL_SEED = {
  contracts: [
    {
      id: 'CTR-001',
      plate: 'ABC-999',
      vehicleModel: 'Toyota Corolla Cross',
      vehicleName: 'Corolla Cross 2022',
      sellerName: 'Andres Rebolledo (Administrador)',
      buyerName: 'Juan Carlos Rodríguez',
      buyerDocument: 'V-19.823.411',
      buyerPhone: '+58 412-888-9900',
      totalVehiclePrice: 12000,
      weeklyRate: 200,
      totalWeeks: 60,
      startDate: '2026-01-05',
      status: 'ACTIVE'
    },
    {
      id: 'CTR-002',
      plate: 'XYZ-111',
      vehicleModel: 'Nissan Sentra Exclusive',
      vehicleName: 'Sentra 2020 (Liquidado 100%)',
      sellerName: 'Andres Rebolledo (Administrador)',
      buyerName: 'Ana María Martínez',
      buyerDocument: 'V-21.094.122',
      buyerPhone: '+58 414-777-1122',
      totalVehiclePrice: 8000,
      weeklyRate: 200,
      totalWeeks: 40,
      startDate: '2025-01-01',
      status: 'ARCHIVED_PAID'
    }
  ],
  weeklyInstallments: [],
  receipts: [
    {
      id: 'REC-2026-001',
      receiptNumber: '0001',
      contractId: 'CTR-001',
      plate: 'ABC-999',
      vehicleModel: 'Toyota Corolla Cross',
      sellerName: 'Andres Rebolledo (Administrador)',
      buyerName: 'Juan Carlos Rodríguez',
      buyerDocument: 'V-19.823.411',
      weekRange: 'Semana 7 (16 Feb - 22 Feb)',
      amountPaid: 250,
      previousBalance: 10750,
      newBalance: 10500,
      paymentMethod: 'Transferencia Bancaria',
      date: '2026-02-18',
      pauseReason: ''
    }
  ]
};

// Generador de Semanas de Financiamiento
function createWeeksForContract(contractId, totalWeeks = 60, weeklyRate = 200) {
  const weeks = [];
  const startOfYear = new Date(2026, 0, 5);

  for (let i = 1; i <= totalWeeks; i++) {
    const s = new Date(startOfYear);
    s.setDate(startOfYear.getDate() + (i - 1) * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);

    const format = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const rangeText = `${format(s)} - ${format(e)}`;

    let status = 'PENDIENTE';
    let paidAmount = 0;
    let pauseReason = '';

    if (i <= 5) {
      status = 'PAGADA';
      paidAmount = weeklyRate;
    } else if (i === 6) {
      status = 'PAUSA';
      paidAmount = 0;
      pauseReason = 'Mantenimiento en Taller (Frenos y Repuestos) - Semana Libre';
    } else if (i === 7) {
      status = 'PAGADA';
      paidAmount = 250;
    } else if (i === 8) {
      status = 'EN_MORA';
      paidAmount = 0;
    }

    weeks.push({
      id: `W-${contractId}-${i}`,
      contractId,
      weekNumber: i,
      rangeText,
      startDate: s.toISOString().split('T')[0],
      endDate: e.toISOString().split('T')[0],
      status,
      agreedAmount: weeklyRate,
      paidAmount,
      pauseReason,
      paymentDate: (i <= 5 || i === 7) ? s.toISOString().split('T')[0] : null
    });
  }

  return weeks;
}

// Cargar Base de Datos
function loadDB() {
  const saved = localStorage.getItem(STORAGE_KEY_DB);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar la DB:", e);
    }
  }

  const db = { ...INITIAL_SEED };
  let weeks = [];
  weeks = weeks.concat(createWeeksForContract('CTR-001', 60, 200));

  for (let i = 1; i <= 40; i++) {
    weeks.push({
      id: `W-CTR-002-${i}`,
      contractId: 'CTR-002',
      weekNumber: i,
      rangeText: `Semana ${i}`,
      status: 'PAGADA',
      agreedAmount: 200,
      paidAmount: 200,
      pauseReason: '',
      paymentDate: '2025-10-15'
    });
  }

  db.weeklyInstallments = weeks;
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
  return db;
}

// COMPONENTE PRINCIPAL
function App() {
  const [db, setDb] = useState(loadDB);
  
  // ESTADO DE SESIÓN DEL ADMINISTRADOR (Andres Rebolledo)
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    return saved ? JSON.parse(saved) : null;
  });

  // Navegación Inferior Móvil: 'financiamientos', 'nuevo', 'archivados', 'balance'
  const [activeTab, setActiveTab] = useState('financiamientos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('CTR-001');

  // Modales
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Sincronización en la Nube con Firebase Firestore / Realtime DB
  useEffect(() => {
    if (window.cloudDbService) {
      window.cloudDbService.subscribeToCloudChanges((cloudData) => {
        if (cloudData && cloudData.contracts) {
          setDb(cloudData);
        }
      });
    }
  }, []);

  const updateDatabase = (newDb) => {
    setDb(newDb);
    if (window.cloudDbService) {
      window.cloudDbService.syncData(newDb);
    } else {
      localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(newDb));
    }
  };

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Si no hay sesión iniciada, mostrar la Pantalla de Inicio de Sesión Administrador
  if (!userSession) {
    return (
      <LoginScreen 
        onLoginSuccess={(userData) => {
          setUserSession(userData);
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userData));
        }}
      />
    );
  }

  const currentContract = db.contracts.find(c => c.id === selectedContractId) || db.contracts[0];
  const currentWeeks = db.weeklyInstallments.filter(w => w.contractId === selectedContractId);

  // Cálculo de Progreso
  let totalPaid = 0;
  if (currentContract) {
    if (currentContract.status === 'ARCHIVED_PAID') {
      totalPaid = currentContract.totalVehiclePrice;
    } else {
      currentWeeks.forEach(w => {
        if (w.status === 'PAGADA') totalPaid += Number(w.paidAmount || 0);
      });
    }
  }

  const pendingBalance = currentContract ? Math.max(0, currentContract.totalVehiclePrice - totalPaid) : 0;
  const progressPercent = currentContract ? Math.min(100, Math.round((totalPaid / currentContract.totalVehiclePrice) * 100)) : 0;

  const filteredVehicles = searchQuery.trim() === '' ? [] : db.contracts.filter(c => 
    c.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPlate = (contractId) => {
    setSelectedContractId(contractId);
    setSearchQuery('');
    setActiveTab('financiamientos');
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  // Registrar Abono Editable
  const handleSaveAbono = (weekId, editableAmount, paymentMethod) => {
    const numericAmount = Number(editableAmount);

    const updatedWeeks = db.weeklyInstallments.map(w => {
      if (w.id === weekId) {
        return {
          ...w,
          status: 'PAGADA',
          paidAmount: numericAmount,
          paymentDate: new Date().toISOString().split('T')[0],
          pauseReason: ''
        };
      }
      return w;
    });

    const newReceiptNumber = String(db.receipts.length + 1).padStart(4, '0');
    const targetWeek = db.weeklyInstallments.find(w => w.id === weekId);
    
    const newReceipt = {
      id: `REC-${Date.now()}`,
      receiptNumber: newReceiptNumber,
      contractId: currentContract.id,
      plate: currentContract.plate,
      vehicleModel: currentContract.vehicleModel,
      sellerName: userSession.name,
      buyerName: currentContract.buyerName,
      buyerDocument: currentContract.buyerDocument,
      weekRange: `Semana ${targetWeek.weekNumber} (${targetWeek.rangeText})`,
      amountPaid: numericAmount,
      previousBalance: pendingBalance,
      newBalance: Math.max(0, pendingBalance - numericAmount),
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      pauseReason: ''
    };

    const newDb = {
      ...db,
      weeklyInstallments: updatedWeeks,
      receipts: [newReceipt, ...db.receipts]
    };

    updateDatabase(newDb);
    setReceiptData(newReceipt);
    setShowReceiptModal(true);
    setSelectedWeek(null);
  };

  // Pausa / Semana Libre ($0.00)
  const handleSavePausa = (weekId, pauseReason) => {
    const updatedWeeks = db.weeklyInstallments.map(w => {
      if (w.id === weekId) {
        return {
          ...w,
          status: 'PAUSA',
          paidAmount: 0,
          pauseReason: pauseReason || 'Semana Libre por Taller / Repuestos'
        };
      }
      return w;
    });

    updateDatabase({ ...db, weeklyInstallments: updatedWeeks });
    setSelectedWeek(null);
    setShowPauseModal(false);
  };

  // Archivar / Liquidar Financiamiento
  const handleArchiveContract = (contractId) => {
    const updatedContracts = db.contracts.map(c => c.id === contractId ? { ...c, status: 'ARCHIVED_PAID' } : c);
    updateDatabase({ ...db, contracts: updatedContracts });
    alert("🟢 ¡El financiamiento ha sido archivado como 100% Liquidado!");
  };

  // Borrar Contrato (Privilegio Admin)
  const handleDeleteContract = (contractId) => {
    const updatedContracts = db.contracts.filter(c => c.id !== contractId);
    const updatedWeeks = db.weeklyInstallments.filter(w => w.contractId !== contractId);
    
    updateDatabase({
      ...db,
      contracts: updatedContracts,
      weeklyInstallments: updatedWeeks
    });

    setShowDeleteModal(false);
    setSelectedContractId(updatedContracts[0]?.id || '');
  };

  // Crear Nuevo Contrato (Privilegio Admin)
  const handleCreateContract = (newContractData) => {
    const newId = `CTR-${Date.now()}`;
    const fullContract = {
      id: newId,
      ...newContractData,
      sellerName: `${userSession.name} (Administrador)`,
      status: 'ACTIVE'
    };

    const newWeeks = createWeeksForContract(newId, Number(newContractData.totalWeeks), Number(newContractData.weeklyRate));

    const newDb = {
      ...db,
      contracts: [fullContract, ...db.contracts],
      weeklyInstallments: [...db.weeklyInstallments, ...newWeeks]
    };

    updateDatabase(newDb);
    setSelectedContractId(newId);
    setActiveTab('financiamientos');
  };

  return (
    <div className="app-container">
      {/* HEADER PRINCIPAL CON SESIÓN DE ANDRES REBOLLEDO */}
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-title">
            <i data-lucide="shield-check"></i>
            <h2>Control Financiamiento Auto</h2>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{fontSize:'0.82rem', color:'#60a5fa', background:'rgba(59, 130, 246, 0.15)', padding:'6px 12px', borderRadius:'20px', border:'1px solid rgba(59, 130, 246, 0.3)', fontWeight:'600'}}>
              👤 {userSession.name}
            </div>
            <button className="btn btn-secondary" style={{height:'32px', padding:'0 10px', fontSize:'0.75rem'}} onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>

        {/* Buscador Rápido por Placa */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <i data-lucide="search" className="search-icon"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="INGRESAR PLACA O VEHÍCULO (EJ: ABC-999)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredVehicles.length > 0 && (
            <div className="search-results-dropdown">
              {filteredVehicles.map(c => (
                <div key={c.id} className="search-result-item" onClick={() => handleSelectPlate(c.id)}>
                  <div>
                    <span className="plate-pill">{c.plate}</span>
                    <strong style={{marginLeft:'8px'}}>{c.vehicleName}</strong>
                  </div>
                  <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{c.buyerName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* PESTAÑA 1: FINANCIAMIENTOS ACTIVOS */}
      {activeTab === 'financiamientos' && currentContract && (
        <section>
          {/* Selector de Contratos Activos */}
          <div style={{display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'10px', marginBottom:'16px'}}>
            {db.contracts.filter(c => c.status === 'ACTIVE').map(c => (
              <button 
                key={c.id}
                onClick={() => setSelectedContractId(c.id)}
                style={{
                  background: c.id === selectedContractId ? '#2563eb' : 'var(--bg-card)',
                  color: c.id === selectedContractId ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                🚘 {c.plate} - {c.vehicleName}
              </button>
            ))}
          </div>

          {/* BARRA DE PROGRESO DE PAGOS */}
          <div className="progress-card">
            <div className="progress-header">
              <span className="plate-pill" style={{fontSize:'1.1rem'}}>{currentContract.plate}</span>
              <strong style={{color:'#10b981', fontSize:'1.1rem'}}>{progressPercent}% COMPLETADO</strong>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{width: `${progressPercent}%`}}></div>
            </div>

            <div className="progress-stats-grid">
              <div className="progress-stat-box">
                <div className="progress-stat-label">Costo Total</div>
                <div className="progress-stat-value" style={{color:'#f8fafc'}}>${currentContract.totalVehiclePrice}</div>
              </div>

              <div className="progress-stat-box">
                <div className="progress-stat-label">Total Pagado</div>
                <div className="progress-stat-value" style={{color:'#10b981'}}>${totalPaid}</div>
              </div>

              <div className="progress-stat-box">
                <div className="progress-stat-label">Pendiente</div>
                <div className="progress-stat-value" style={{color:'#ef4444'}}>${pendingBalance}</div>
              </div>
            </div>
          </div>

          {/* DATOS CLAVE DEL CONTRATO */}
          <div style={{background:'var(--bg-card)', padding:'16px', borderRadius:'12px', border:'1px solid var(--border-color)', marginBottom:'16px'}}>
            <h3 style={{fontSize:'1.1rem', marginBottom:'8px'}}>{currentContract.vehicleName} ({currentContract.vehicleModel})</h3>
            <div style={{fontSize:'0.85rem', color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:'4px'}}>
              <div>👤 <strong>Comprador / Deudor:</strong> {currentContract.buyerName} (Doc: {currentContract.buyerDocument})</div>
              <div>🏢 <strong>Vendedor / Dueño:</strong> {currentContract.sellerName}</div>
              <div>📅 <strong>Plazo de Financiamiento:</strong> {currentContract.totalWeeks} Semanas (~14 meses) | 💰 Abono sugerido: ${currentContract.weeklyRate}/sem</div>
            </div>

            {/* BOTONES DE ACCIÓN RÁPIDA (PERMISOS ADMIN) */}
            <div className="vehicle-action-buttons">
              <button className="btn btn-success" onClick={() => setSelectedWeek(currentWeeks.find(w => w.status === 'PENDIENTE') || currentWeeks[0])}>
                ➕ Registrar Abono
              </button>
              <button className="btn btn-primary" onClick={() => setShowPauseModal(true)}>
                🔵 Marcar Pausa
              </button>
              <button className="btn btn-warning" onClick={() => handleArchiveContract(currentContract.id)}>
                📦 Archivar / Liquidado
              </button>
              <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                🗑️ Borrar
              </button>
            </div>
          </div>

          {/* CALENDARIO DE SEMANAS */}
          <h3 style={{marginBottom:'12px'}}>Calendario de Semanas por Estado</h3>
          
          <div className="weeks-cards-mobile">
            {currentWeeks.map(w => (
              <div 
                key={w.id} 
                className={`week-card-item status-${w.status}`}
                onClick={() => setSelectedWeek(w)}
              >
                <div>
                  <strong>Semana {w.weekNumber}</strong>
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{w.rangeText}</div>
                  {w.status === 'PAUSA' && (
                    <div style={{fontSize:'0.75rem', color:'#60a5fa', marginTop:'2px'}}>
                      🛠️ {w.pauseReason}
                    </div>
                  )}
                </div>

                <div style={{textAlign:'right'}}>
                  <span className={`status-badge-pill badge-${w.status}`}>
                    {w.status === 'PAGADA' && '🟢 Pagada'}
                    {w.status === 'PENDIENTE' && '🟡 Pendiente'}
                    {w.status === 'PAUSA' && '🔵 Pausa / Libre'}
                    {w.status === 'EN_MORA' && '🔴 En Mora'}
                  </span>
                  <div style={{fontWeight:'700', marginTop:'4px'}}>
                    ${w.status === 'PAGADA' ? w.paidAmount : (w.status === 'PAUSA' ? 0 : w.agreedAmount)} USD
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PESTAÑA 2: NUEVO CRÉDITO */}
      {activeTab === 'nuevo' && (
        <NewCreditForm 
          adminName={userSession.name}
          onSave={handleCreateContract}
          onCancel={() => setActiveTab('financiamientos')}
        />
      )}

      {/* PESTAÑA 3: ARCHIVADOS */}
      {activeTab === 'archivados' && (
        <section>
          <h3 style={{marginBottom:'16px'}}>Contratos Archivados / Liquidados (100% Pagados)</h3>
          {db.contracts.filter(c => c.status === 'ARCHIVED_PAID').length === 0 ? (
            <p style={{color:'var(--text-muted)'}}>No hay contratos archivados aún.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {db.contracts.filter(c => c.status === 'ARCHIVED_PAID').map(c => (
                <div key={c.id} style={{background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'12px', padding:'16px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span className="plate-pill">{c.plate}</span>
                    <span style={{color:'#10b981', fontWeight:'bold', fontSize:'0.85rem'}}>100% LIQUIDADO 🟢</span>
                  </div>
                  <h4 style={{marginTop:'8px'}}>{c.vehicleName}</h4>
                  <div style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'4px'}}>
                    Comprador: {c.buyerName} | Costo Total: ${c.totalVehiclePrice} USD
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PESTAÑA 4: BALANCE CONTABLE */}
      {activeTab === 'balance' && (
        <FinancialBalanceDashboard db={db} />
      )}

      {/* MODAL DE ABONO (EDITABLE) */}
      {selectedWeek && !showPauseModal && (
        <AbonoModal 
          week={selectedWeek}
          contract={currentContract}
          onClose={() => setSelectedWeek(null)}
          onSaveAbono={handleSaveAbono}
        />
      )}

      {/* MODAL DE PAUSA */}
      {showPauseModal && (
        <PauseModal 
          week={currentWeeks.find(w => w.status === 'PENDIENTE') || currentWeeks[0]}
          onClose={() => setShowPauseModal(false)}
          onSavePausa={handleSavePausa}
        />
      )}

      {/* MODAL COMPROBANTE PDF */}
      {showReceiptModal && receiptData && (
        <ReceiptModal 
          receipt={receiptData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* MODAL BORRAR CONTRATO */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth:'400px'}}>
            <h3>Confirmar Eliminación</h3>
            <p style={{marginTop:'10px', color:'var(--text-muted)'}}>
              ¿Está seguro de que desea borrar permanentemente el contrato del vehículo <strong>{currentContract.plate}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDeleteContract(currentContract.id)}>Eliminar Definitivamente</button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR MÓVIL */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'financiamientos' ? 'active' : ''}`} onClick={() => setActiveTab('financiamientos')}>
          <i data-lucide="car"></i>
          <span>Créditos</span>
        </button>

        <button className={`nav-item ${activeTab === 'nuevo' ? 'active' : ''}`} onClick={() => setActiveTab('nuevo')}>
          <i data-lucide="plus-circle"></i>
          <span>Nuevo</span>
        </button>

        <button className={`nav-item ${activeTab === 'archivados' ? 'active' : ''}`} onClick={() => setActiveTab('archivados')}>
          <i data-lucide="archive"></i>
          <span>Archivados</span>
        </button>

        <button className={`nav-item ${activeTab === 'balance' ? 'active' : ''}`} onClick={() => setActiveTab('balance')}>
          <i data-lucide="bar-chart-2"></i>
          <span>Balance</span>
        </button>
      </nav>
    </div>
  );
}

// COMPONENTE PANTALLA DE INICIO DE SESIÓN (LOGIN SCREEN)
function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('andres.rebolledo');
  const [password, setPassword] = useState('Andres2026!');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    
    if ((cleanUser === OFFICIAL_ADMIN.username || cleanUser === OFFICIAL_ADMIN.altUsername) && password === OFFICIAL_ADMIN.password) {
      onLoginSuccess(OFFICIAL_ADMIN);
    } else {
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
  };

  const handleQuickLogin = () => {
    onLoginSuccess(OFFICIAL_ADMIN);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'radial-gradient(circle at top, #1e293b 0%, #0a0e17 100%)'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '28px 24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            color: '#3b82f6',
            marginBottom: '12px'
          }}>
            <i data-lucide="shield-check" style={{width:'32px', height:'32px'}}></i>
          </div>
          <h2 style={{fontSize:'1.4rem', fontWeight:'700'}}>Control Financiamiento Auto</h2>
          <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'4px'}}>
            Inicio de Sesión Administrador
          </p>
        </div>

        {errorMsg && (
          <div style={{background:'rgba(239, 68, 68, 0.15)', color:'#ef4444', padding:'10px', borderRadius:'8px', fontSize:'0.85rem', marginBottom:'16px', textAlign:'center', border:'1px solid rgba(239, 68, 68, 0.3)'}}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario Administrador:</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="andres.rebolledo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña:</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{marginTop:'12px', fontSize:'1rem'}}>
            🔑 Ingresar al Sistema
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>CUENTA OFICIAL DE ADMINISTRADOR</div>
          <strong style={{fontSize:'0.95rem', color:'#60a5fa', display:'block', marginTop:'2px'}}>👤 {OFFICIAL_ADMIN.name}</strong>
          <div style={{fontSize:'0.78rem', color:'var(--text-dim)', marginTop:'4px'}}>
            Usuario: <code>{OFFICIAL_ADMIN.username}</code> | Clave: <code>{OFFICIAL_ADMIN.password}</code>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{marginTop:'10px', height:'36px', fontSize:'0.8rem'}}
            onClick={handleQuickLogin}
          >
            ⚡ Ingreso Rápido como Andres Rebolledo
          </button>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE FORMULARIO NUEVO CRÉDITO
function NewCreditForm({ adminName, onSave, onCancel }) {
  const [plate, setPlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [sellerName, setSellerName] = useState(`${adminName} (Administrador)`);
  const [buyerName, setBuyerName] = useState('');
  const [buyerDocument, setBuyerDocument] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [totalVehiclePrice, setTotalVehiclePrice] = useState(12000);
  const [weeklyRate, setWeeklyRate] = useState(200);
  const [totalWeeks, setTotalWeeks] = useState(60);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (plate && buyerName && totalVehiclePrice) {
      onSave({
        plate: plate.toUpperCase(),
        vehicleModel,
        vehicleName: vehicleName || `${vehicleModel} (${plate.toUpperCase()})`,
        sellerName,
        buyerName,
        buyerDocument,
        buyerPhone,
        totalVehiclePrice: Number(totalVehiclePrice),
        weeklyRate: Number(weeklyRate),
        totalWeeks: Number(totalWeeks),
        startDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div style={{background:'var(--bg-card)', padding:'20px', borderRadius:'16px', border:'1px solid var(--border-color)'}}>
      <h3 style={{marginBottom:'16px'}}>➕ Registrar Nuevo Contrato de Financiamiento</h3>

      <form onSubmit={handleSubmit}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div className="form-group">
            <label className="form-label">Placa del Vehículo:</label>
            <input type="text" className="form-control" placeholder="Ej: ABC-999" value={plate} onChange={e => setPlate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Modelo del Auto:</label>
            <input type="text" className="form-control" placeholder="Ej: Toyota Yaris 2022" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nombre del Comprador / Deudor:</label>
          <input type="text" className="form-control" placeholder="Nombre completo del cliente" value={buyerName} onChange={e => setBuyerName(e.target.value)} required />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div className="form-group">
            <label className="form-label">Cédula / DNI:</label>
            <input type="text" className="form-control" placeholder="Ej: V-18.999.000" value={buyerDocument} onChange={e => setBuyerDocument(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono:</label>
            <input type="text" className="form-control" placeholder="Ej: +58 414-000-1122" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
          <div className="form-group">
            <label className="form-label">Precio Total ($ USD):</label>
            <input type="number" className="form-control" value={totalVehiclePrice} onChange={e => setTotalVehiclePrice(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Abono Semanal ($):</label>
            <input type="number" className="form-control" value={weeklyRate} onChange={e => setWeeklyRate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Plazo (Semanas):</label>
            <input type="number" className="form-control" value={totalWeeks} onChange={e => setTotalWeeks(e.target.value)} required />
          </div>
        </div>

        <div style={{display:'flex', gap:'10px', marginTop:'16px'}}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn-success">Crear Contrato</button>
        </div>
      </form>
    </div>
  );
}

// COMPONENTE MODAL DE ABONO EDITABLE
function AbonoModal({ week, contract, onClose, onSaveAbono }) {
  const [editableAmount, setEditableAmount] = useState(week.paidAmount > 0 ? week.paidAmount : (week.agreedAmount || 200));
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Registrar Abono - Semana {week.weekNumber}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'14px'}}>
          Vehículo: <strong>{contract.plate}</strong> | Comprador: <strong>{contract.buyerName}</strong>
        </p>

        <div className="form-group">
          <label className="form-label" style={{color:'#10b981', fontWeight:'bold'}}>
            Monto a Cancelar ($ USD) - EDITABLE:
          </label>
          <input 
            type="number" 
            className="form-control" 
            style={{fontSize:'1.2rem', fontWeight:'bold', color:'#10b981'}}
            value={editableAmount}
            onChange={(e) => setEditableAmount(e.target.value)}
            placeholder="Ingrese el monto recibido..."
            required 
          />
          <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>
            * Puedes modificar libremente este monto ($200 sugerido, abonos parciales o pagos mayores).
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Método de Pago:</label>
          <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            <option value="Pago Móvil">Pago Móvil</option>
            <option value="Efectivo USD">Efectivo USD</option>
            <option value="Zelle / USDT">Zelle / USDT</option>
          </select>
        </div>

        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-success" onClick={() => onSaveAbono(week.id, editableAmount, paymentMethod)}>
            💾 Registrar Abono y Emitir Comprobante PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE MODAL DE PAUSA
function PauseModal({ week, onClose, onSavePausa }) {
  const [reason, setReason] = useState('Mantenimiento en Taller (Frenos y Repuestos)');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🔵 Marcar Pausa / Semana Libre ($0.00)</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'14px'}}>
          Congelar la Semana {week.weekNumber}. No genera cobro de $200 ni mora, pero mantiene el saldo del vehículo sin reducir.
        </p>

        <div className="form-group">
          <label className="form-label">Motivo de la Pausa / Semana Libre:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ej: Auto en taller por cambio de repuestos"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required 
          />
        </div>

        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSavePausa(week.id, reason)}>
            🔵 Congelar Semana Libre
          </button>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE COMPROBANTE PDF
function ReceiptModal({ receipt, onClose }) {
  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    const opt = {
      margin:       10,
      filename:     `Comprobante_Abono_${receipt.receiptNumber}_${receipt.plate}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth:'650px'}}>
        <div className="modal-header">
          <h3>Comprobante de Abono #{receipt.receiptNumber}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div id="printable-receipt" className="receipt-printable">
          <div className="receipt-header">
            <h2 style={{color:'#0f172a', margin:0}}>COMPROBANTE DE ABONO A FINANCIAMIENTO</h2>
            <p style={{fontSize:'0.85rem', color:'#475569', margin:'4px 0'}}>N° Recibo: <strong>{receipt.receiptNumber}</strong> | Fecha: {receipt.date}</p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', fontSize:'0.85rem', marginBottom:'14px'}}>
            <div style={{border:'1px solid #cbd5e1', padding:'10px', borderRadius:'6px'}}>
              <strong>DATOS DEL VEHÍCULO:</strong>
              <div>Placa: <strong>{receipt.plate}</strong></div>
              <div>Modelo: {receipt.vehicleModel}</div>
            </div>

            <div style={{border:'1px solid #cbd5e1', padding:'10px', borderRadius:'6px'}}>
              <strong>DATOS DE LAS PARTES:</strong>
              <div>Vendedor: {receipt.sellerName}</div>
              <div>Comprador: <strong>{receipt.buyerName}</strong></div>
              <div>Cédula/DNI: {receipt.buyerDocument}</div>
            </div>
          </div>

          <div style={{border:'1px solid #0f172a', padding:'12px', borderRadius:'6px', marginBottom:'16px', background:'#f8fafc'}}>
            <h4 style={{color:'#0f172a', margin:0}}>RESUMEN FINANCIERO DEL ABONO</h4>
            <div style={{marginTop:'6px'}}>Semana: <strong>{receipt.weekRange}</strong></div>
            <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#059669', marginTop:'6px'}}>
              Monto Cancelado: ${receipt.amountPaid} USD ({receipt.paymentMethod})
            </div>
            <div style={{marginTop:'6px', fontSize:'0.9rem'}}>Saldo Anterior: ${receipt.previousBalance} USD</div>
            <div style={{fontWeight:'bold', color:'#dc2626'}}>Nuevo Saldo Pendiente: ${receipt.newBalance} USD</div>
          </div>

          <div className="receipt-signatures-print">
            <div className="signature-box-print">
              <div style={{height:'40px'}}></div>
              Firma del Vendedor / Dueño
            </div>

            <div className="signature-box-print">
              <div style={{height:'40px'}}></div>
              Firma del Comprador
            </div>
          </div>
        </div>

        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            📄 Descargar Comprobante PDF / Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// DASHBOARD BALANCE CONTABLE
function FinancialBalanceDashboard({ db }) {
  let totalRecaudado = 0;
  let totalCarteraPendiente = 0;

  db.receipts.forEach(r => {
    totalRecaudado += Number(r.amountPaid || 0);
  });

  db.contracts.forEach(c => {
    if (c.status === 'ACTIVE') {
      const installments = db.weeklyInstallments.filter(w => w.contractId === c.id);
      let paid = 0;
      installments.forEach(w => {
        if (w.status === 'PAGADA') paid += Number(w.paidAmount || 0);
      });
      totalCarteraPendiente += Math.max(0, c.totalVehiclePrice - paid);
    }
  });

  return (
    <div style={{background:'var(--bg-card)', padding:'18px', borderRadius:'16px', border:'1px solid var(--border-color)'}}>
      <h3 style={{marginBottom:'16px'}}>📊 Balance y Recaudación de Financiamientos</h3>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
        <div style={{background:'rgba(16, 185, 129, 0.1)', border:'1px solid rgba(16, 185, 129, 0.3)', padding:'14px', borderRadius:'10px'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>TOTAL RECAUDADO ACUMULADO</div>
          <div style={{fontSize:'1.4rem', fontWeight:'bold', color:'#10b981'}}>${totalRecaudado} USD</div>
        </div>

        <div style={{background:'rgba(239, 68, 68, 0.1)', border:'1px solid rgba(239, 68, 68, 0.3)', padding:'14px', borderRadius:'10px'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>CARTERA TOTAL PENDIENTE</div>
          <div style={{fontSize:'1.4rem', fontWeight:'bold', color:'#ef4444'}}>${totalCarteraPendiente} USD</div>
        </div>
      </div>

      <h4>Historial de Comprobantes Emitidos</h4>
      <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'10px'}}>
        {db.receipts.map(r => (
          <div key={r.id} style={{background:'var(--bg-card-hover)', padding:'12px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <strong>Comprobante #{r.receiptNumber}</strong> - {r.plate}
              <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{r.buyerName} | Fecha: {r.date}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <strong style={{color:'#10b981'}}>${r.amountPaid} USD</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Renderizado en DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
