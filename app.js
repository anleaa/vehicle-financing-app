/* ==========================================================================
   SISTEMA DE GESTIÓN DE FINANCIAMIENTO DE VEHÍCULOS A CRÉDITO Y CONTROL SEMANAL
   React 18 Native - Generador de Facturas PDF e Impresión Nativa sin Errores
   ========================================================================== */

const { useState, useEffect } = React;
const h = React.createElement;

// CREDENCIALES OFICIALES DE ADMINISTRADOR
const OFFICIAL_ADMIN = {
  name: 'Andres Rebolledo',
  username: 'andres.rebolledo',
  altUsername: 'andres',
  password: 'Andres2026!',
  role: 'Administrador Principal'
};

const STORAGE_KEY_DB = 'vehicle_financing_credit_db_v1';
const STORAGE_KEY_AUTH = 'vehicle_financing_auth_session_v11';

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

function loadDB() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DB);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.contracts) && parsed.contracts.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

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
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
  } catch (e) {}
  return db;
}

// 1. PANTALLA DE INICIO DE SESIÓN
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

  return h('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'radial-gradient(circle at top, #ffffff 0%, #f1f5f9 100%)'
    }
  }, 
    h('div', {
      style: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)'
      }
    }, [
      h('div', { key: 'header', style: { textAlign: 'center', marginBottom: '24px' } }, [
        h('div', {
          key: 'icon',
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '2px solid #2563eb',
            color: '#2563eb',
            marginBottom: '12px',
            fontSize: '1.8rem'
          }
        }, '🛡️'),
        h('h2', { key: 'title', style: { fontSize: '1.45rem', fontWeight: '800', color: '#0f172a' } }, 'Control Financiamiento Auto'),
        h('p', { key: 'sub', style: { fontSize: '0.88rem', color: '#64748b', marginTop: '4px' } }, 'Inicio de Sesión Administrador')
      ]),

      errorMsg ? h('div', {
        key: 'err',
        style: { background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', border: '1px solid #fecaca' }
      }, errorMsg) : null,

      h('form', { key: 'form', onSubmit: handleSubmit }, [
        h('div', { key: 'user-group', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Usuario Administrador:'),
          h('input', {
            type: 'text',
            className: 'form-control',
            placeholder: 'andres.rebolledo',
            value: username,
            onChange: (e) => setUsername(e.target.value),
            required: true
          })
        ]),
        h('div', { key: 'pass-group', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Contraseña:'),
          h('input', {
            type: 'password',
            className: 'form-control',
            placeholder: '••••••••',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true
          })
        ]),
        h('button', { key: 'submit-btn', type: 'submit', className: 'btn btn-primary', style: { marginTop: '12px', fontSize: '1rem', height: '50px' } }, '🔑 Ingresar al Sistema')
      ]),

      h('div', {
        key: 'quick-card',
        style: {
          marginTop: '22px',
          padding: '16px',
          background: 'rgba(37, 99, 235, 0.04)',
          border: '1px dashed #bfdbfe',
          borderRadius: '16px',
          textAlign: 'center'
        }
      }, [
        h('div', { key: 'q-lbl', style: { fontSize: '0.78rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' } }, 'CUENTA OFICIAL DE ADMINISTRADOR'),
        h('strong', { key: 'q-name', style: { fontSize: '1rem', color: '#1d4ed8', display: 'block', marginTop: '2px' } }, `👤 ${OFFICIAL_ADMIN.name}`),
        h('div', { key: 'q-creds', style: { fontSize: '0.8rem', color: '#475569', marginTop: '4px' } }, [
          'Usuario: ', h('code', { key: 'u', style: { background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' } }, OFFICIAL_ADMIN.username),
          ' | Clave: ', h('code', { key: 'p', style: { background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' } }, OFFICIAL_ADMIN.password)
        ]),
        h('button', {
          key: 'q-btn',
          className: 'btn btn-secondary',
          style: { marginTop: '12px', height: '40px', fontSize: '0.85rem', background: '#ffffff', border: '1px solid #cbd5e1' },
          onClick: handleQuickLogin
        }, '⚡ Ingreso Rápido como Andres Rebolledo')
      ])
    ])
  );
}

// 2. MODAL SELECTOR DE ACCIÓN PARA CADA SEMANA
function WeekActionModal({ week, contract, db, onClose, onSelectAbono, onSelectPausa, onMarkStatus, onViewReceipt }) {
  const existingReceipt = (db && Array.isArray(db.receipts))
    ? db.receipts.find(r => r.contractId === contract.id && r.weekRange && r.weekRange.includes(`Semana ${week.weekNumber}`))
    : null;

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content', style: { maxWidth: '500px' } }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't', style: { color: '#0f172a' } }, `Gestión de Semana ${week.weekNumber}`),
        h('button', { key: 'c', className: 'close-btn', onClick: onClose }, '×')
      ]),
      h('div', { key: 'sub', style: { fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' } }, [
        'Vehículo: ', h('strong', { key: 'p', style: { color: '#2563eb' } }, contract.plate),
        ' | Rango: ', h('strong', { key: 'r', style: { color: '#0f172a' } }, week.rangeText)
      ]),
      h('div', { key: 'badge-box', style: { marginBottom: '20px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
        h('span', { key: 'lbl', style: { fontSize: '0.82rem', color: '#64748b', fontWeight: '700' } }, 'ESTADO ACTUAL:'),
        h('span', { key: 'badge', className: `status-badge-pill badge-${week.status}` }, 
          week.status === 'PAGADA' ? '🟢 Pagada' : (week.status === 'PENDIENTE' ? '🟡 Pendiente' : (week.status === 'PAUSA' ? '🔵 Pausa / Libre' : '🔴 En Mora'))
        )
      ]),

      h('h4', { key: 'opts-lbl', style: { fontSize: '0.9rem', color: '#0f172a', marginBottom: '12px' } }, 'Seleccione la acción a realizar:'),

      h('div', { key: 'opts-grid', style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
        h('button', {
          key: 'opt-pagada',
          className: 'btn btn-success',
          style: { justifyContent: 'flex-start', padding: '12px 16px', height: 'auto', textAlign: 'left' },
          onClick: () => onSelectAbono(week)
        }, [
          h('span', { key: 'ico', style: { fontSize: '1.4rem' } }, '🟢'),
          h('div', { key: 'txt' }, [
            h('div', { key: 'title', style: { fontWeight: '800', fontSize: '0.95rem' } }, '1. Marcar como PAGADA (Registrar Abono)'),
            h('div', { key: 'desc', style: { fontSize: '0.78rem', opacity: 0.9, fontWeight: 'normal' } }, 'Ingresar pago ($200 o editable) y emitir Factura PDF')
          ])
        ]),

        h('button', {
          key: 'opt-pausa',
          className: 'btn btn-primary',
          style: { justifyContent: 'flex-start', padding: '12px 16px', height: 'auto', textAlign: 'left' },
          onClick: () => onSelectPausa(week)
        }, [
          h('span', { key: 'ico', style: { fontSize: '1.4rem' } }, '🔵'),
          h('div', { key: 'txt' }, [
            h('div', { key: 'title', style: { fontWeight: '800', fontSize: '0.95rem' } }, '2. Marcar PAUSA / SEMANA LIBRE ($0.00)'),
            h('div', { key: 'desc', style: { fontSize: '0.78rem', opacity: 0.9, fontWeight: 'normal' } }, 'Congelar por taller / mantenimiento sin cobrar mora')
          ])
        ]),

        h('button', {
          key: 'opt-pendiente',
          className: 'btn btn-secondary',
          style: { justifyContent: 'flex-start', padding: '12px 16px', height: 'auto', textAlign: 'left', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
          onClick: () => onMarkStatus(week.id, 'PENDIENTE')
        }, [
          h('span', { key: 'ico', style: { fontSize: '1.4rem' } }, '🟡'),
          h('div', { key: 'txt' }, [
            h('div', { key: 'title', style: { fontWeight: '800', fontSize: '0.95rem' } }, '3. Marcar como PENDIENTE / MORA'),
            h('div', { key: 'desc', style: { fontSize: '0.78rem', opacity: 0.9, fontWeight: 'normal' } }, 'Revertir estado a cuota pendiente por pagar')
          ])
        ]),

        existingReceipt ? h('button', {
          key: 'opt-receipt',
          className: 'btn',
          style: { justifyContent: 'flex-start', padding: '12px 16px', height: 'auto', textAlign: 'left', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', marginTop: '6px' },
          onClick: () => onViewReceipt(existingReceipt)
        }, [
          h('span', { key: 'ico', style: { fontSize: '1.4rem' } }, '📄'),
          h('div', { key: 'txt' }, [
            h('div', { key: 'title', style: { fontWeight: '800', fontSize: '0.95rem' } }, `Ver Factura PDF #${existingReceipt.receiptNumber}`),
            h('div', { key: 'desc', style: { fontSize: '0.78rem', opacity: 0.9, fontWeight: 'normal' } }, 'Re-emitir o descargar la factura de este abono')
          ])
        ]) : null
      ]),

      h('div', { key: 'acts', style: { display: 'flex', marginTop: '20px' } }, [
        h('button', { key: 'btn-c', className: 'btn btn-secondary', onClick: onClose }, 'Cerrar')
      ])
    ])
  ]);
}

// 3. FORMULARIO NUEVO CRÉDITO
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

  return h('div', { style: { background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' } }, [
    h('h3', { key: 't', style: { marginBottom: '18px', color: '#0f172a' } }, '➕ Registrar Nuevo Contrato de Financiamiento'),
    h('form', { key: 'f', onSubmit: handleSubmit }, [
      h('div', { key: 'g1', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } }, [
        h('div', { key: 'p1', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Placa del Vehículo:'),
          h('input', { type: 'text', className: 'form-control', placeholder: 'Ej: ABC-999', value: plate, onChange: e => setPlate(e.target.value), required: true })
        ]),
        h('div', { key: 'p2', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Modelo del Auto:'),
          h('input', { type: 'text', className: 'form-control', placeholder: 'Ej: Toyota Yaris 2022', value: vehicleModel, onChange: e => setVehicleModel(e.target.value), required: true })
        ])
      ]),
      h('div', { key: 'g2', className: 'form-group' }, [
        h('label', { className: 'form-label' }, 'Nombre del Comprador / Deudor:'),
        h('input', { type: 'text', className: 'form-control', placeholder: 'Nombre completo del cliente', value: buyerName, onChange: e => setBuyerName(e.target.value), required: true })
      ]),
      h('div', { key: 'g3', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } }, [
        h('div', { key: 'd1', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Cédula / DNI:'),
          h('input', { type: 'text', className: 'form-control', placeholder: 'Ej: V-18.999.000', value: buyerDocument, onChange: e => setBuyerDocument(e.target.value) })
        ]),
        h('div', { key: 'd2', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Teléfono:'),
          h('input', { type: 'text', className: 'form-control', placeholder: 'Ej: +58 414-000-1122', value: buyerPhone, onChange: e => setBuyerPhone(e.target.value) })
        ])
      ]),
      h('div', { key: 'g4', style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' } }, [
        h('div', { key: 'v1', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Precio Total ($ USD):'),
          h('input', { type: 'number', className: 'form-control', value: totalVehiclePrice, onChange: e => setTotalVehiclePrice(e.target.value), required: true })
        ]),
        h('div', { key: 'v2', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Abono Semanal ($):'),
          h('input', { type: 'number', className: 'form-control', value: weeklyRate, onChange: e => setWeeklyRate(e.target.value), required: true })
        ]),
        h('div', { key: 'v3', className: 'form-group' }, [
          h('label', { className: 'form-label' }, 'Plazo (Semanas):'),
          h('input', { type: 'number', className: 'form-control', value: totalWeeks, onChange: e => setTotalWeeks(e.target.value), required: true })
        ])
      ]),
      h('div', { key: 'g5', style: { display: 'flex', gap: '12px', marginTop: '20px' } }, [
        h('button', { key: 'c', type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Cancelar'),
        h('button', { key: 's', type: 'submit', className: 'btn btn-success' }, 'Crear Contrato')
      ])
    ])
  ]);
}

// 4. MODAL DE ABONO EDITABLE
function AbonoModal({ week, contract, onClose, onSaveAbono }) {
  const [editableAmount, setEditableAmount] = useState(week.paidAmount > 0 ? week.paidAmount : (week.agreedAmount || 200));
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria');

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content' }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't', style: { color: '#0f172a' } }, `Registrar Abono - Semana ${week.weekNumber}`),
        h('button', { key: 'c', className: 'close-btn', onClick: onClose }, '×')
      ]),
      h('p', { key: 'sub', style: { fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' } }, [
        'Vehículo: ', h('strong', { key: 'p', style: { color: '#2563eb' } }, contract.plate), ' | Comprador: ', h('strong', { key: 'b', style: { color: '#0f172a' } }, contract.buyerName)
      ]),
      h('div', { key: 'fg1', className: 'form-group' }, [
        h('label', { className: 'form-label', style: { color: '#059669', fontWeight: '700' } }, 'Monto a Cancelar ($ USD) - EDITABLE:'),
        h('input', {
          type: 'number',
          className: 'form-control',
          style: { fontSize: '1.3rem', fontWeight: '800', color: '#059669', border: '2px solid #10b981' },
          value: editableAmount,
          onChange: (e) => setEditableAmount(e.target.value),
          required: true
        }),
        h('span', { style: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' } }, '* Puedes modificar libremente este monto ($200 sugerido, abonos parciales o pagos mayores).')
      ]),
      h('div', { key: 'fg2', className: 'form-group' }, [
        h('label', { className: 'form-label' }, 'Método de Pago:'),
        h('select', {
          className: 'form-control',
          value: paymentMethod,
          onChange: (e) => setPaymentMethod(e.target.value)
        }, [
          h('option', { key: 'o1', value: 'Transferencia Bancaria' }, 'Transferencia Bancaria'),
          h('option', { key: 'o2', value: 'Pago Móvil' }, 'Pago Móvil'),
          h('option', { key: 'o3', value: 'Efectivo USD' }, 'Efectivo USD'),
          h('option', { key: 'o4', value: 'Zelle / USDT' }, 'Zelle / USDT')
        ])
      ]),
      h('div', { key: 'acts', style: { display: 'flex', gap: '12px', marginTop: '22px' } }, [
        h('button', { key: 'btn-c', className: 'btn btn-secondary', onClick: onClose }, 'Cancelar'),
        h('button', { key: 'btn-s', className: 'btn btn-success', onClick: () => onSaveAbono(week.id, editableAmount, paymentMethod) }, '💾 Registrar y Emitir Factura PDF')
      ])
    ])
  ]);
}

// 5. MODAL DE PAUSA
function PauseModal({ week, onClose, onSavePausa }) {
  const [reason, setReason] = useState('Mantenimiento en Taller (Frenos y Repuestos)');

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content' }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't', style: { color: '#1d4ed8' } }, '🔵 Marcar Pausa / Semana Libre ($0.00)'),
        h('button', { key: 'c', className: 'close-btn', onClick: onClose }, '×')
      ]),
      h('p', { key: 'sub', style: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' } }, `Congelar la Semana ${week.weekNumber}. No genera cobro de $200 ni mora, pero mantiene el saldo sin reducir.`),
      h('div', { key: 'fg', className: 'form-group' }, [
        h('label', { className: 'form-label' }, 'Motivo de la Pausa / Semana Libre:'),
        h('input', {
          type: 'text',
          className: 'form-control',
          placeholder: 'Ej: Auto en taller por cambio de repuestos',
          value: reason,
          onChange: (e) => setReason(e.target.value),
          required: true
        })
      ]),
      h('div', { key: 'acts', style: { display: 'flex', gap: '12px', marginTop: '20px' } }, [
        h('button', { key: 'btn-c', className: 'btn btn-secondary', onClick: onClose }, 'Cancelar'),
        h('button', { key: 'btn-s', className: 'btn btn-primary', onClick: () => onSavePausa(week.id, reason) }, '🔵 Congelar Semana Libre')
      ])
    ])
  ]);
}

// 6. MODAL DE FACTURA COMPLETA OFICIAL Y DESCARGA / IMPRESIÓN PDF NATIVA
function ReceiptModal({ receipt, onClose }) {

  // Descarga Directa en PDF usando el elemento visible en el DOM (Garantiza 100% que no salga en blanco)
  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Factura_Oficial_Abono_${receipt.receiptNumber}_${receipt.plate}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save().catch(err => {
        console.warn("Falling back to print popup:", err);
        handleNativePrint();
      });
    } else {
      handleNativePrint();
    }
  };

  // Impresión / Guardado Vectorial en PDF Nativo de Página Completa A4
  const handleNativePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Factura Comprobante N° ${receipt.receiptNumber} - ${receipt.plate}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #ffffff; }
          .header { text-align: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { font-size: 32px; margin-bottom: 4px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase; }
          .subtitle { font-size: 14px; font-weight: 700; color: #2563eb; margin: 6px 0; }
          .meta-bar { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 6px; display: flex; justify-content: space-around; font-size: 13px; font-weight: 600; margin-top: 10px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; font-size: 13px; }
          .card-box { border: 1px solid #cbd5e1; padding: 12px 14px; border-radius: 8px; background: #ffffff; }
          .card-title { color: #1e3a8a; font-size: 13px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
          .paid-box { border: 2px solid #059669; background: #ecfdf5; padding: 16px; border-radius: 10px; margin-bottom: 18px; }
          .paid-title { color: #047857; font-weight: 800; font-size: 14px; margin: 0 0 10px 0; }
          .paid-amount { font-size: 26px; font-weight: 900; color: #059669; text-align: right; }
          .balance-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-bottom: 20px; }
          .bal-item { padding: 10px; border-radius: 6px; font-size: 13px; }
          .disclaimer { font-size: 11px; color: #64748b; text-align: center; font-style: italic; margin-top: 20px; margin-bottom: 40px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
          .sig-box { width: 45%; text-align: center; border-top: 1.5px solid #0f172a; padding-top: 6px; font-size: 13px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🛡️</div>
          <div class="title">SISTEMA DE FINANCIAMIENTO VEHICULAR</div>
          <div class="subtitle">FACTURA COMPROBANTE OFICIAL DE ABONO Y RECIBO DE PAGO</div>
          <div class="meta-bar">
            <span>N° Recibo: <strong>#REC-${receipt.receiptNumber}</strong></span>
            <span>Fecha: <strong>${receipt.date}</strong></span>
            <span style="color: #059669;">ESTADO: APROBADO 🟢</span>
          </div>
        </div>

        <div class="grid-2">
          <div class="card-box">
            <div class="card-title">DATOS DEL VEHÍCULO:</div>
            <div>Placa de Identificación: <strong style="color: #2563eb; font-size: 15px;">${receipt.plate}</strong></div>
            <div style="margin-top: 4px;">Modelo / Marca: <strong>${receipt.vehicleModel}</strong></div>
          </div>
          <div class="card-box">
            <div class="card-title">PARTES DEL CONTRATO:</div>
            <div>Vendedor / Dueño: <strong>${receipt.sellerName}</strong></div>
            <div style="margin-top: 4px;">Comprador / Deudor: <strong>${receipt.buyerName}</strong></div>
            <div style="margin-top: 4px;">Cédula / Documento: <strong>${receipt.buyerDocument || 'No registrado'}</strong></div>
          </div>
        </div>

        <div class="paid-box">
          <div class="paid-title">💰 DETALLE DEL MONTO CANCELADO EN ESTA FACTURA</div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
            <span>Concepto: <strong>Abono de Cuota Semanal a Crédito</strong></span>
            <span>Período: <strong>${receipt.weekRange}</strong></span>
          </div>
          <div style="font-size: 13px; color: #475569;">Método de Pago: <strong>${receipt.paymentMethod}</strong></div>
          <div class="paid-amount">$${receipt.amountPaid}.00 USD</div>
        </div>

        <div class="card-box" style="margin-bottom: 20px; background: #f8fafc;">
          <div class="card-title" style="color: #0f172a;">📊 ESTADO DE CUENTA ACTUALIZADO DEL VEHÍCULO</div>
          <div class="balance-grid">
            <div class="bal-item" style="border: 1px solid #e2e8f0; background: #fff;">
              <div style="color: #64748b; font-size: 11px;">Saldo Anterior</div>
              <strong style="font-size: 16px;">$${receipt.previousBalance}.00 USD</strong>
            </div>
            <div class="bal-item" style="border: 1px solid #a7f3d0; background: #fff;">
              <div style="color: #047857; font-size: 11px;">Abono Recibido</div>
              <strong style="font-size: 16px; color: #059669;">-$${receipt.amountPaid}.00 USD</strong>
            </div>
            <div class="bal-item" style="border: 1px solid #fecaca; background: #fef2f2;">
              <div style="color: #b91c1c; font-size: 11px; font-weight: bold;">NUEVO SALDO PENDIENTE</div>
              <strong style="font-size: 16px; color: #dc2626;">$${receipt.newBalance}.00 USD</strong>
            </div>
          </div>
        </div>

        <div class="disclaimer">
          * Este documento certifica la recepción conforme del pago realizado. El comprador y vendedor expresan su conformidad con el saldo pendiente registrado.
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div style="height: 45px;"></div>
            <div>FIRMA VENDEDOR / DUEÑO</div>
            <div style="font-weight: normal; font-size: 12px; margin-top: 2px;">${receipt.sellerName}</div>
          </div>
          <div class="sig-box">
            <div style="height: 45px;"></div>
            <div>FIRMA COMPRADOR / DEUDOR</div>
            <div style="font-weight: normal; font-size: 12px; margin-top: 2px;">${receipt.buyerName} (${receipt.buyerDocument || 'Doc'})</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content', style: { maxWidth: '720px' } }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't', style: { color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' } }, [
          '📄 Factura Comprobante de Pago #', receipt.receiptNumber
        ]),
        h('button', { key: 'c', className: 'close-btn', onClick: onClose }, '×')
      ]),

      h('div', { key: 'pr', id: 'printable-receipt', className: 'receipt-printable' }, [
        h('div', { key: 'rh', className: 'receipt-header' }, [
          h('div', { key: 'logo', style: { fontSize: '2rem', marginBottom: '4px' } }, '🛡️'),
          h('h2', { key: 't1', style: { color: '#0f172a', fontSize: '1.4rem', fontWeight: '800', margin: 0, textTransform: 'uppercase' } }, 'SISTEMA DE FINANCIAMIENTO VEHICULAR'),
          h('div', { key: 't2', style: { fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: '4px 0 8px 0', letterSpacing: '0.5px' } }, 'FACTURA COMPROBANTE OFICIAL DE ABONO Y RECIBO DE PAGO'),
          h('div', { key: 'meta', style: { display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' } }, [
            h('span', { key: 'r' }, ['N° Recibo: ', h('strong', { key: 'rn', style: { color: '#0f172a' } }, `#REC-${receipt.receiptNumber}`)]),
            h('span', { key: 'd' }, ['Fecha de Emisión: ', h('strong', { key: 'dt', style: { color: '#0f172a' } }, receipt.date)]),
            h('span', { key: 'st', style: { color: '#059669', fontWeight: 'bold' } }, 'ESTADO: APROBADO 🟢')
          ])
        ]),

        h('div', { key: 'rg1', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem', marginBottom: '16px' } }, [
          h('div', { key: 'box1', style: { border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '8px', background: '#ffffff' } }, [
            h('h4', { key: 'b1', style: { color: '#1e3a8a', fontSize: '0.9rem', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' } }, '🚘 DATOS DEL VEHÍCULO:'),
            h('div', { key: 'p', style: { marginBottom: '3px' } }, ['Placa de Identificación: ', h('strong', { key: 'pl', style: { color: '#2563eb', fontSize: '1rem' } }, receipt.plate)]),
            h('div', { key: 'm', style: { marginBottom: '3px' } }, ['Modelo / Marca: ', h('strong', { key: 'mo' }, receipt.vehicleModel)])
          ]),

          h('div', { key: 'box2', style: { border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '8px', background: '#ffffff' } }, [
            h('h4', { key: 'b2', style: { color: '#1e3a8a', fontSize: '0.9rem', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' } }, '👤 PARTES DEL CONTRATO:'),
            h('div', { key: 'v', style: { marginBottom: '3px' } }, ['Vendedor / Dueño: ', h('strong', { key: 've' }, receipt.sellerName)]),
            h('div', { key: 'c', style: { marginBottom: '3px' } }, ['Comprador / Deudor: ', h('strong', { key: 'bu', style: { color: '#0f172a' } }, receipt.buyerName)]),
            h('div', { key: 'd' }, ['Cédula / Documento: ', h('strong', { key: 'doc' }, receipt.buyerDocument || 'No registrado')])
          ])
        ]),

        h('div', { key: 'rg2', style: { border: '1.5px solid #059669', padding: '16px', borderRadius: '10px', marginBottom: '18px', background: '#ecfdf5' } }, [
          h('h4', { key: 't', style: { color: '#047857', margin: 0, fontSize: '1.05rem', fontWeight: '800' } }, '💰 DETALLE DEL MONTO CANCELADO EN ESTA FACTURA'),
          h('div', { key: 'grid-abono', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontSize: '0.9rem' } }, [
            h('div', { key: 'concept' }, ['Concepto: ', h('strong', { key: 'co' }, 'Abono de Cuota Semanal a Crédito')]),
            h('div', { key: 'week' }, ['Período Cancelado: ', h('strong', { key: 'wr', style: { color: '#0f172a' } }, receipt.weekRange)]),
            h('div', { key: 'method' }, ['Método de Pago: ', h('strong', { key: 'me' }, receipt.paymentMethod)])
          ]),
          h('div', { key: 'big-paid', style: { marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
            h('span', { key: 'l', style: { fontSize: '1rem', fontWeight: '700', color: '#047857' } }, 'MONTO TOTAL PAGADO:'),
            h('span', { key: 'v', style: { fontSize: '1.6rem', fontWeight: '900', color: '#059669' } }, `$${receipt.amountPaid}.00 USD`)
          ])
        ]),

        h('div', { key: 'rg3', style: { border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px', marginBottom: '22px', background: '#f8fafc' } }, [
          h('h4', { key: 't', style: { color: '#0f172a', margin: '0 0 8px 0', fontSize: '0.95rem' } }, '📊 ESTADO DE CUENTA ACTUALIZADO DEL VEHÍCULO'),
          h('div', { key: 'bal-grid', style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', fontSize: '0.88rem' } }, [
            h('div', { key: 'prev', style: { background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' } }, [
              h('div', { key: 'l', style: { color: '#64748b', fontSize: '0.75rem' } }, 'Saldo Anterior'),
              h('strong', { key: 'v', style: { fontSize: '1.05rem', color: '#0f172a' } }, `$${receipt.previousBalance}.00 USD`)
            ]),
            h('div', { key: 'paid', style: { background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #a7f3d0' } }, [
              h('div', { key: 'l', style: { color: '#047857', fontSize: '0.75rem' } }, 'Abono Recibido'),
              h('strong', { key: 'v', style: { fontSize: '1.05rem', color: '#059669' } }, `-$${receipt.amountPaid}.00 USD`)
            ]),
            h('div', { key: 'new', style: { background: '#fef2f2', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca' } }, [
              h('div', { key: 'l', style: { color: '#b91c1c', fontSize: '0.75rem', fontWeight: 'bold' } }, 'NUEVO SALDO PENDIENTE'),
              h('strong', { key: 'v', style: { fontSize: '1.05rem', color: '#dc2626' } }, `$${receipt.newBalance}.00 USD`)
            ])
          ])
        ]),

        h('div', { key: 'terms', style: { fontSize: '0.75rem', color: '#64748b', textAlign: 'center', fontStyle: 'italic', marginBottom: '30px' } }, 
          '* Este documento certifica la recepción conforme del pago realizado. El comprador y vendedor expresan su conformidad con el saldo pendiente registrado.'
        ),

        h('div', { key: 'sigs', className: 'receipt-signatures-print' }, [
          h('div', { key: 's1', className: 'signature-box-print' }, [
            h('div', { key: 'spacer', style: { height: '50px' } }),
            h('div', { key: 'line', style: { borderTop: '1.5px solid #0f172a', paddingTop: '4px' } }, [
              h('div', { key: 'role' }, 'FIRMA VENDEDOR / DUEÑO'),
              h('div', { key: 'n', style: { fontWeight: 'normal', fontSize: '0.8rem' } }, receipt.sellerName)
            ])
          ]),
          h('div', { key: 's2', className: 'signature-box-print' }, [
            h('div', { key: 'spacer', style: { height: '50px' } }),
            h('div', { key: 'line', style: { borderTop: '1.5px solid #0f172a', paddingTop: '4px' } }, [
              h('div', { key: 'role' }, 'FIRMA COMPRADOR / DEUDOR'),
              h('div', { key: 'n', style: { fontWeight: 'normal', fontSize: '0.8rem' } }, `${receipt.buyerName} (${receipt.buyerDocument || 'Doc'})`)
            ])
          ])
        ])
      ]),

      h('div', { key: 'acts', style: { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px', marginTop: '20px' } }, [
        h('button', { key: 'b1', className: 'btn btn-secondary', onClick: onClose }, 'Cerrar'),
        h('button', { key: 'b2', className: 'btn btn-success', style: { fontSize: '0.92rem' }, onClick: handleDownloadPDF }, '📄 Descargar Factura PDF Completa'),
        h('button', { key: 'b3', className: 'btn btn-primary', style: { fontSize: '0.85rem' }, onClick: handleNativePrint }, '🖨️ Imprimir / PDF Nativo')
      ])
    ])
  ]);
}

// 7. DASHBOARD BALANCE CONTABLE
function FinancialBalanceDashboard({ db }) {
  let totalRecaudado = 0;
  let totalCarteraPendiente = 0;

  if (db && Array.isArray(db.receipts)) {
    db.receipts.forEach(r => {
      totalRecaudado += Number(r.amountPaid || 0);
    });
  }

  if (db && Array.isArray(db.contracts)) {
    db.contracts.forEach(c => {
      if (c.status === 'ACTIVE') {
        const installments = (db.weeklyInstallments && Array.isArray(db.weeklyInstallments)) 
          ? db.weeklyInstallments.filter(w => w.contractId === c.id) 
          : [];
        let paid = 0;
        installments.forEach(w => {
          if (w.status === 'PAGADA') paid += Number(w.paidAmount || 0);
        });
        totalCarteraPendiente += Math.max(0, c.totalVehiclePrice - paid);
      }
    });
  }

  return h('div', { style: { background: 'var(--bg-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' } }, [
    h('h3', { key: 't', style: { marginBottom: '18px', color: '#0f172a' } }, '📊 Balance y Recaudación de Financiamientos'),
    h('div', { key: 'g1', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' } }, [
      h('div', { key: 'b1', style: { background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '12px' } }, [
        h('div', { key: 'lbl1', style: { fontSize: '0.8rem', color: '#047857', fontWeight: '700' } }, 'TOTAL RECAUDADO ACUMULADO'),
        h('div', { key: 'val1', style: { fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '2px' } }, `$${totalRecaudado} USD`)
      ]),
      h('div', { key: 'b2', style: { background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px' } }, [
        h('div', { key: 'lbl2', style: { fontSize: '0.8rem', color: '#b91c1c', fontWeight: '700' } }, 'CARTERA TOTAL PENDIENTE'),
        h('div', { key: 'val2', style: { fontSize: '1.5rem', fontWeight: '800', color: '#dc2626', marginTop: '2px' } }, `$${totalCarteraPendiente} USD`)
      ])
    ]),
    h('h4', { key: 't2', style: { color: '#0f172a', marginBottom: '10px' } }, 'Historial de Comprobantes Emitidos'),
    h('div', { key: 'list', style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
      (!db || !Array.isArray(db.receipts) || db.receipts.length === 0) 
        ? h('p', { key: 'empty', style: { color: 'var(--text-muted)', fontSize: '0.85rem' } }, 'No hay recibos registrados.')
        : db.receipts.map(r => (
            h('div', { key: r.id, style: { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
              h('div', { key: 'info' }, [
                h('strong', { key: 'num', style: { color: '#0f172a' } }, `Comprobante #${r.receiptNumber}`), ` - ${r.plate}`,
                h('div', { key: 'sub', style: { fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' } }, `${r.buyerName} | Fecha: ${r.date}`)
              ]),
              h('div', { key: 'amt', style: { textAlign: 'right' } }, [
                h('strong', { style: { color: '#059669', fontSize: '1.1rem' } }, `$${r.amountPaid} USD`)
              ])
            ])
          ))
    ])
  ]);
}

// 8. COMPONENTE PRINCIPAL
function App() {
  const [db, setDb] = useState(loadDB);
  
  const [userSession, setUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return (parsed && typeof parsed === 'object' && parsed.name) ? parsed : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('financiamientos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('CTR-001');

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [activeWeekForAbono, setActiveWeekForAbono] = useState(null);
  const [activeWeekForPause, setActiveWeekForPause] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    try {
      if (window.cloudDbService) {
        window.cloudDbService.subscribeToCloudChanges((cloudData) => {
          if (cloudData && Array.isArray(cloudData.contracts) && cloudData.contracts.length > 0) {
            setDb(cloudData);
          }
        });
      }
    } catch (e) {}
  }, []);

  const updateDatabase = (newDb) => {
    setDb(newDb);
    try {
      if (window.cloudDbService) {
        window.cloudDbService.syncData(newDb);
      } else {
        localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(newDb));
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch(e) {}
  });

  if (!userSession || typeof userSession !== 'object' || !userSession.name) {
    return h(LoginScreen, {
      onLoginSuccess: (userData) => {
        setUserSession(userData);
        try {
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userData));
        } catch (e) {}
      }
    });
  }

  const currentContract = (db && Array.isArray(db.contracts)) 
    ? (db.contracts.find(c => c.id === selectedContractId) || db.contracts[0])
    : null;

  const currentWeeks = (currentContract && Array.isArray(db.weeklyInstallments))
    ? db.weeklyInstallments.filter(w => w.contractId === currentContract.id)
    : [];

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

  const filteredVehicles = (searchQuery.trim() === '' || !db.contracts) ? [] : db.contracts.filter(c => 
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
      sellerName: userSession.name || OFFICIAL_ADMIN.name,
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
    setActiveWeekForAbono(null);
    setSelectedWeek(null);
    setShowReceiptModal(true);
  };

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
    setActiveWeekForPause(null);
    setSelectedWeek(null);
  };

  const handleMarkStatus = (weekId, newStatus) => {
    const updatedWeeks = db.weeklyInstallments.map(w => {
      if (w.id === weekId) {
        return {
          ...w,
          status: newStatus,
          paidAmount: 0,
          pauseReason: ''
        };
      }
      return w;
    });

    updateDatabase({ ...db, weeklyInstallments: updatedWeeks });
    setSelectedWeek(null);
  };

  const handleArchiveContract = (contractId) => {
    const updatedContracts = db.contracts.map(c => c.id === contractId ? { ...c, status: 'ARCHIVED_PAID' } : c);
    updateDatabase({ ...db, contracts: updatedContracts });
    alert("🟢 ¡El financiamiento ha sido archivado como 100% Liquidado!");
  };

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

  const handleCreateContract = (newContractData) => {
    const newId = `CTR-${Date.now()}`;
    const fullContract = {
      id: newId,
      ...newContractData,
      sellerName: `${userSession.name || OFFICIAL_ADMIN.name} (Administrador)`,
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

  return h('div', { className: 'app-container' }, [
    // HEADER PRINCIPAL
    h('header', { key: 'top-header', className: 'top-header' }, [
      h('div', { key: 'brand', className: 'brand-section' }, [
        h('div', { key: 'bt', className: 'brand-title' }, [
          h('i', { key: 'i', 'data-lucide': 'shield-check' }),
          h('h2', { key: 'h' }, 'Control Financiamiento Auto')
        ]),
        h('div', { key: 'usr', style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
          h('div', { key: 'u', style: { fontSize: '0.82rem', color: '#1d4ed8', background: '#eff6ff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #bfdbfe', fontWeight: '700' } }, `👤 ${userSession.name || OFFICIAL_ADMIN.name}`),
          h('button', { key: 'b', className: 'btn btn-secondary', style: { height: '34px', padding: '0 12px', fontSize: '0.8rem' }, onClick: handleLogout }, 'Salir')
        ])
      ]),
      h('div', { key: 'search', className: 'search-container' }, [
        h('div', { key: 'sw', className: 'search-input-wrapper' }, [
          h('i', { key: 'si', 'data-lucide': 'search', className: 'search-icon' }),
          h('input', {
            type: 'text',
            className: 'search-input',
            placeholder: 'INGRESAR PLACA O VEHÍCULO (EJ: ABC-999)...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value)
          })
        ]),
        filteredVehicles.length > 0 ? h('div', { key: 'dd', className: 'search-results-dropdown' }, 
          filteredVehicles.map(c => (
            h('div', { key: c.id, className: 'search-result-item', onClick: () => handleSelectPlate(c.id) }, [
              h('div', { key: 'l' }, [
                h('span', { key: 'p', className: 'plate-pill' }, c.plate),
                h('strong', { key: 'n', style: { marginLeft: '8px' } }, c.vehicleName)
              ]),
              h('span', { key: 'r', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, c.buyerName)
            ])
          ))
        ) : null
      ])
    ]),

    // PESTAÑA 1: FINANCIAMIENTOS ACTIVOS
    activeTab === 'financiamientos' && currentContract ? h('section', { key: 'tab1' }, [
      h('div', { key: 'sel', style: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' } }, 
        db.contracts.filter(c => c.status === 'ACTIVE').map(c => (
          h('button', {
            key: c.id,
            onClick: () => setSelectedContractId(c.id),
            style: {
              background: c.id === selectedContractId ? '#2563eb' : '#ffffff',
              color: c.id === selectedContractId ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: c.id === selectedContractId ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
            }
          }, `🚘 ${c.plate} - ${c.vehicleName}`)
        ))
      ),

      h('div', { key: 'prog', className: 'progress-card' }, [
        h('div', { key: 'ph', className: 'progress-header' }, [
          h('span', { key: 'p', className: 'plate-pill', style: { fontSize: '1.1rem' } }, currentContract.plate),
          h('strong', { key: 'pct', style: { color: '#059669', fontSize: '1.15rem' } }, `${progressPercent}% COMPLETADO`)
        ]),
        h('div', { key: 'pbc', className: 'progress-bar-container' }, [
          h('div', { key: 'pbf', className: 'progress-bar-fill', style: { width: `${progressPercent}%` } })
        ]),
        h('div', { key: 'psg', className: 'progress-stats-grid' }, [
          h('div', { key: 'sb1', className: 'progress-stat-box' }, [
            h('div', { key: 'l', className: 'progress-stat-label' }, 'Costo Total'),
            h('div', { key: 'v', className: 'progress-stat-value', style: { color: '#0f172a' } }, `$${currentContract.totalVehiclePrice}`)
          ]),
          h('div', { key: 'sb2', className: 'progress-stat-box' }, [
            h('div', { key: 'l', className: 'progress-stat-label' }, 'Total Pagado'),
            h('div', { key: 'v', className: 'progress-stat-value', style: { color: '#059669' } }, `$${totalPaid}`)
          ]),
          h('div', { key: 'sb3', className: 'progress-stat-box' }, [
            h('div', { key: 'l', className: 'progress-stat-label' }, 'Pendiente'),
            h('div', { key: 'v', className: 'progress-stat-value', style: { color: '#dc2626' } }, `$${pendingBalance}`)
          ])
        ])
      ]),

      h('div', { key: 'det', style: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '18px', boxShadow: 'var(--shadow-md)' } }, [
        h('h3', { key: 't', style: { fontSize: '1.2rem', marginBottom: '8px', color: '#0f172a' } }, `${currentContract.vehicleName} (${currentContract.vehicleModel})`),
        h('div', { key: 'info', style: { fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' } }, [
          h('div', { key: 'b' }, ['👤 ', h('strong', { key: 's' }, 'Comprador / Deudor: '), `${currentContract.buyerName} (Doc: ${currentContract.buyerDocument})`]),
          h('div', { key: 'v' }, ['🏢 ', h('strong', { key: 's' }, 'Vendedor / Dueño: '), currentContract.sellerName]),
          h('div', { key: 'p' }, ['📅 ', h('strong', { key: 's' }, 'Plazo: '), `${currentContract.totalWeeks} Semanas (~14 meses) | 💰 Abono sugerido: $${currentContract.weeklyRate}/sem`])
        ]),

        h('div', { key: 'acts-wrapper', className: 'action-buttons-wrapper' }, [
          h('div', { key: 'row1', className: 'primary-action-row' }, [
            h('button', {
              key: 'b-abono',
              className: 'btn btn-success',
              style: { height: '52px', fontSize: '1.02rem' },
              onClick: () => {
                const targetW = currentWeeks.find(w => w.status === 'PENDIENTE') || currentWeeks[0];
                setActiveWeekForAbono(targetW);
              }
            }, '➕ Registrar Abono')
          ]),

          h('div', { key: 'row2', className: 'secondary-actions-grid' }, [
            h('button', { key: 'b-pausa', className: 'btn btn-primary', onClick: () => {
              const targetW = currentWeeks.find(w => w.status === 'PENDIENTE') || currentWeeks[0];
              setActiveWeekForPause(targetW);
            } }, '🔵 Marcar Pausa'),
            h('button', { key: 'b-archivar', className: 'btn btn-warning', onClick: () => handleArchiveContract(currentContract.id) }, '📦 Archivar / Liquidado')
          ]),

          h('div', { key: 'row3', className: 'danger-action-row' }, [
            h('button', { key: 'b-borrar', className: 'btn btn-danger-outline', onClick: () => setShowDeleteModal(true) }, '🗑️ Borrar')
          ])
        ])
      ]),

      h('h3', { key: 'wk-t', style: { marginBottom: '14px', color: '#0f172a' } }, 'Calendario de Semanas (Toca cualquier semana para gestionar)'),
      h('div', { key: 'wk-list', className: 'weeks-cards-mobile' }, 
        currentWeeks.map(w => (
          h('div', {
            key: w.id,
            className: `week-card-item status-${w.status}`,
            onClick: () => setSelectedWeek(w)
          }, [
            h('div', { key: 'l' }, [
              h('strong', { key: 'n', style: { color: '#0f172a', fontSize: '1rem' } }, `Semana ${w.weekNumber}`),
              h('div', { key: 'r', style: { fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' } }, w.rangeText),
              w.status === 'PAUSA' ? h('div', { key: 'pr', style: { fontSize: '0.78rem', color: '#2563eb', fontWeight: '600', marginTop: '3px' } }, `🛠️ ${w.pauseReason}`) : null
            ]),
            h('div', { key: 'r', style: { textAlign: 'right' } }, [
              h('span', { key: 'badge', className: `status-badge-pill badge-${w.status}` }, 
                w.status === 'PAGADA' ? '🟢 Pagada' : (w.status === 'PENDIENTE' ? '🟡 Pendiente' : (w.status === 'PAUSA' ? '🔵 Pausa / Libre' : '🔴 En Mora'))
              ),
              h('div', { key: 'amt', style: { fontWeight: '800', marginTop: '6px', fontSize: '1.05rem', color: '#0f172a' } }, `$${w.status === 'PAGADA' ? w.paidAmount : (w.status === 'PAUSA' ? 0 : w.agreedAmount)} USD`)
            ])
          ])
        ))
      )
    ]) : null,

    // PESTAÑA 2: NUEVO CRÉDITO
    activeTab === 'nuevo' ? h(NewCreditForm, {
      key: 'tab2',
      adminName: userSession.name || OFFICIAL_ADMIN.name,
      onSave: handleCreateContract,
      onCancel: () => setActiveTab('financiamientos')
    }) : null,

    // PESTAÑA 3: ARCHIVADOS
    activeTab === 'archivados' ? h('section', { key: 'tab3' }, [
      h('h3', { key: 't', style: { marginBottom: '16px', color: '#0f172a' } }, 'Contratos Archivados / Liquidados (100% Pagados)'),
      db.contracts.filter(c => c.status === 'ARCHIVED_PAID').length === 0 
        ? h('p', { key: 'empty', style: { color: 'var(--text-muted)' } }, 'No hay contratos archivados aún.')
        : h('div', { key: 'list', style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, 
            db.contracts.filter(c => c.status === 'ARCHIVED_PAID').map(c => (
              h('div', { key: c.id, style: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' } }, [
                h('div', { key: 'hdr', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
                  h('span', { key: 'p', className: 'plate-pill' }, c.plate),
                  h('span', { key: 's', style: { color: '#059669', fontWeight: 'bold', fontSize: '0.85rem' } }, '100% LIQUIDADO 🟢')
                ]),
                h('h4', { key: 'n', style: { marginTop: '8px', color: '#0f172a' } }, c.vehicleName),
                h('div', { key: 'sub', style: { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' } }, `Comprador: ${c.buyerName} | Costo Total: $${c.totalVehiclePrice} USD`)
              ])
            ))
          )
    ]) : null,

    // PESTAÑA 4: BALANCE CONTABLE
    activeTab === 'balance' ? h(FinancialBalanceDashboard, { key: 'tab4', db: db }) : null,

    // MODAL SELECTOR AL TOCAR CUALQUIER SEMANA
    selectedWeek && !activeWeekForAbono && !activeWeekForPause ? h(WeekActionModal, {
      key: 'mod-week-action',
      week: selectedWeek,
      contract: currentContract,
      db: db,
      onClose: () => setSelectedWeek(null),
      onSelectAbono: (w) => {
        setActiveWeekForAbono(w);
      },
      onSelectPausa: (w) => {
        setActiveWeekForPause(w);
      },
      onMarkStatus: (weekId, status) => {
        handleMarkStatus(weekId, status);
      },
      onViewReceipt: (receiptObj) => {
        setReceiptData(receiptObj);
        setSelectedWeek(null);
        setShowReceiptModal(true);
      }
    }) : null,

    // MODAL DE ABONO EDITABLE
    activeWeekForAbono ? h(AbonoModal, {
      key: 'mod-abono',
      week: activeWeekForAbono,
      contract: currentContract,
      onClose: () => setActiveWeekForAbono(null),
      onSaveAbono: handleSaveAbono
    }) : null,

    // MODAL DE PAUSA / SEMANA LIBRE
    activeWeekForPause ? h(PauseModal, {
      key: 'mod-pause',
      week: activeWeekForPause,
      onClose: () => setActiveWeekForPause(null),
      onSavePausa: handleSavePausa
    }) : null,

    // MODAL FACTURA PDF COMPLETA OFICIAL
    showReceiptModal && receiptData ? h(ReceiptModal, {
      key: 'mod-receipt',
      receipt: receiptData,
      onClose: () => setShowReceiptModal(false)
    }) : null,

    showDeleteModal ? h('div', { key: 'mod-del', className: 'modal-overlay' }, [
      h('div', { className: 'modal-content', style: { maxWidth: '400px' } }, [
        h('h3', { key: 't', style: { color: '#dc2626' } }, 'Confirmar Eliminación'),
        h('p', { key: 'p', style: { marginTop: '10px', color: 'var(--text-muted)' } }, [
          '¿Está seguro de que desea borrar permanentemente el contrato del vehículo ', h('strong', { key: 'pl', style: { color: '#0f172a' } }, currentContract ? currentContract.plate : ''), '? Esta acción no se puede deshacer.'
        ]),
        h('div', { key: 'acts', style: { display: 'flex', gap: '12px', marginTop: '20px' } }, [
          h('button', { key: 'c', className: 'btn btn-secondary', onClick: () => setShowDeleteModal(false) }, 'Cancelar'),
          h('button', { key: 'd', className: 'btn btn-danger', onClick: () => handleDeleteContract(currentContract.id) }, 'Eliminar Definitivamente')
        ])
      ])
    ]) : null,

    // BARRA DE NAVEGACIÓN INFERIOR MÓVIL
    h('nav', { key: 'bottom-nav', className: 'bottom-nav' }, [
      h('button', { key: 'n1', className: `nav-item ${activeTab === 'financiamientos' ? 'active' : ''}`, onClick: () => setActiveTab('financiamientos') }, [
        h('i', { key: 'i', 'data-lucide': 'car' }),
        h('span', { key: 's' }, 'Créditos')
      ]),
      h('button', { key: 'n2', className: `nav-item ${activeTab === 'nuevo' ? 'active' : ''}`, onClick: () => setActiveTab('nuevo') }, [
        h('i', { key: 'i', 'data-lucide': 'plus-circle' }),
        h('span', { key: 's' }, 'Nuevo')
      ]),
      h('button', { key: 'n3', className: `nav-item ${activeTab === 'archivados' ? 'active' : ''}`, onClick: () => setActiveTab('archivados') }, [
        h('i', { key: 'i', 'data-lucide': 'archive' }),
        h('span', { key: 's' }, 'Archivados')
      ]),
      h('button', { key: 'n4', className: `nav-item ${activeTab === 'balance' ? 'active' : ''}`, onClick: () => setActiveTab('balance') }, [
        h('i', { key: 'i', 'data-lucide': 'bar-chart-2' }),
        h('span', { key: 's' }, 'Balance')
      ])
    ])
  ]);
}

function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement && window.React && window.ReactDOM) {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(App));
    } catch(err) {
      console.error("Error al renderizar la App:", err);
    }
  }
}

renderApp();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
}
