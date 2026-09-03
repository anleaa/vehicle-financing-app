/* ==========================================================================
   SISTEMA DE GESTIÓN DE FINANCIAMIENTO DE VEHÍCULOS A CRÉDITO Y CONTROL SEMANAL
   React 18 Native (Sin compiladores externos - Carga Instantánea Garantizada)
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
const STORAGE_KEY_AUTH = 'vehicle_financing_auth_session_v6';

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

// 1. PANTALLA DE INICIO DE SESIÓN (LOGIN SCREEN PRINCIPAL)
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
      background: 'radial-gradient(circle at top, #1e293b 0%, #0a0e17 100%)'
    }
  }, 
    h('div', {
      style: {
        background: '#121826',
        border: '1px solid #243047',
        borderRadius: '24px',
        padding: '28px 24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
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
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            color: '#3b82f6',
            marginBottom: '12px',
            fontSize: '1.8rem'
          }
        }, '🛡️'),
        h('h2', { key: 'title', style: { fontSize: '1.4rem', fontWeight: '700', color: '#ffffff' } }, 'Control Financiamiento Auto'),
        h('p', { key: 'sub', style: { fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' } }, 'Inicio de Sesión Administrador')
      ]),

      errorMsg ? h('div', {
        key: 'err',
        style: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }
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
        h('button', { key: 'submit-btn', type: 'submit', className: 'btn btn-primary', style: { marginTop: '12px', fontSize: '1rem' } }, '🔑 Ingresar al Sistema')
      ]),

      h('div', {
        key: 'quick-card',
        style: {
          marginTop: '20px',
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed #243047',
          borderRadius: '12px',
          textAlign: 'center'
        }
      }, [
        h('div', { key: 'q-lbl', style: { fontSize: '0.8rem', color: '#94a3b8' } }, 'CUENTA OFICIAL DE ADMINISTRADOR'),
        h('strong', { key: 'q-name', style: { fontSize: '0.95rem', color: '#60a5fa', display: 'block', marginTop: '2px' } }, `👤 ${OFFICIAL_ADMIN.name}`),
        h('div', { key: 'q-creds', style: { fontSize: '0.78rem', color: '#64748b', marginTop: '4px' } }, [
          'Usuario: ', h('code', { key: 'u' }, OFFICIAL_ADMIN.username), ' | Clave: ', h('code', { key: 'p' }, OFFICIAL_ADMIN.password)
        ]),
        h('button', {
          key: 'q-btn',
          className: 'btn btn-secondary',
          style: { marginTop: '10px', height: '36px', fontSize: '0.8rem' },
          onClick: handleQuickLogin
        }, '⚡ Ingreso Rápido como Andres Rebolledo')
      ])
    ])
  );
}

// 2. FORMULARIO NUEVO CRÉDITO
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

  return h('div', { style: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' } }, [
    h('h3', { key: 't', style: { marginBottom: '16px' } }, '➕ Registrar Nuevo Contrato de Financiamiento'),
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
      h('div', { key: 'g5', style: { display: 'flex', gap: '10px', marginTop: '16px' } }, [
        h('button', { key: 'c', type: 'button', className: 'btn btn-secondary', onClick: onCancel }, 'Cancelar'),
        h('button', { key: 's', type: 'submit', className: 'btn btn-success' }, 'Crear Contrato')
      ])
    ])
  ]);
}

// 3. MODAL DE ABONO EDITABLE
function AbonoModal({ week, contract, onClose, onSaveAbono }) {
  const [editableAmount, setEditableAmount] = useState(week.paidAmount > 0 ? week.paidAmount : (week.agreedAmount || 200));
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria');

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content' }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't' }, `Registrar Abono - Semana ${week.weekNumber}`),
        h('button', { key: 'c', className: 'close-btn', onClick: onClose }, '×')
      ]),
      h('p', { key: 'sub', style: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' } }, [
        'Vehículo: ', h('strong', { key: 'p' }, contract.plate), ' | Comprador: ', h('strong', { key: 'b' }, contract.buyerName)
      ]),
      h('div', { key: 'fg1', className: 'form-group' }, [
        h('label', { className: 'form-label', style: { color: '#10b981', fontWeight: 'bold' } }, 'Monto a Cancelar ($ USD) - EDITABLE:'),
        h('input', {
          type: 'number',
          className: 'form-control',
          style: { fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' },
          value: editableAmount,
          onChange: (e) => setEditableAmount(e.target.value),
          required: true
        }),
        h('span', { style: { fontSize: '0.75rem', color: 'var(--text-muted)' } }, '* Puedes modificar libremente este monto ($200 sugerido, abonos parciales o pagos mayores).')
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
      h('div', { key: 'acts', style: { display: 'flex', gap: '10px', marginTop: '20px' } }, [
        h('button', { key: 'btn-c', className: 'btn btn-secondary', onClick: onClose }, 'Cancelar'),
        h('button', { key: 'btn-s', className: 'btn btn-success', onClick: () => onSaveAbono(week.id, editableAmount, paymentMethod) }, '💾 Registrar Abono y Emitir Comprobante PDF')
      ])
    ])
  ]);
}

// 4. MODAL DE PAUSA
function PauseModal({ week, onClose, onSavePausa }) {
  const [reason, setReason] = useState('Mantenimiento en Taller (Frenos y Repuestos)');

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content' }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't' }, '🔵 Marcar Pausa / Semana Libre ($0.00)'),
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
      h('div', { key: 'acts', style: { display: 'flex', gap: '10px', marginTop: '20px' } }, [
        h('button', { key: 'btn-c', className: 'btn btn-secondary', onClick: onClose }, 'Cancelar'),
        h('button', { key: 'btn-s', className: 'btn btn-primary', onClick: () => onSavePausa(week.id, reason) }, '🔵 Congelar Semana Libre')
      ])
    ])
  ]);
}

// 5. MODAL COMPROBANTE PDF
function ReceiptModal({ receipt, onClose }) {
  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Comprobante_Abono_${receipt.receiptNumber}_${receipt.plate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  return h('div', { className: 'modal-overlay' }, [
    h('div', { className: 'modal-content', style: { maxWidth: '650px' } }, [
      h('div', { key: 'mh', className: 'modal-header' }, [
        h('h3', { key: 't' }, `Comprobante de Abono #${receipt.receiptNumber}`),
        h('button', { key: 'c', className: 'close-btn', onClick: onClose }, '×')
      ]),
      h('div', { key: 'pr', id: 'printable-receipt', className: 'receipt-printable' }, [
        h('div', { key: 'rh', className: 'receipt-header' }, [
          h('h2', { key: 't1', style: { color: '#0f172a', margin: 0 } }, 'COMPROBANTE DE ABONO A FINANCIAMIENTO'),
          h('p', { key: 't2', style: { fontSize: '0.85rem', color: '#475569', margin: '4px 0' } }, [
            'N° Recibo: ', h('strong', { key: 'rn' }, receipt.receiptNumber), ` | Fecha: ${receipt.date}`
          ])
        ]),
        h('div', { key: 'rg1', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '14px' } }, [
          h('div', { key: 'box1', style: { border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' } }, [
            h('strong', { key: 'b1' }, 'DATOS DEL VEHÍCULO:'),
            h('div', { key: 'p' }, ['Placa: ', h('strong', { key: 'pl' }, receipt.plate)]),
            h('div', { key: 'm' }, `Modelo: ${receipt.vehicleModel}`)
          ]),
          h('div', { key: 'box2', style: { border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' } }, [
            h('strong', { key: 'b2' }, 'DATOS DE LAS PARTES:'),
            h('div', { key: 'v' }, `Vendedor: ${receipt.sellerName}`),
            h('div', { key: 'c' }, ['Comprador: ', h('strong', { key: 'bu' }, receipt.buyerName)]),
            h('div', { key: 'd' }, `Cédula/DNI: ${receipt.buyerDocument}`)
          ])
        ]),
        h('div', { key: 'rg2', style: { border: '1px solid #0f172a', padding: '12px', borderRadius: '6px', marginBottom: '16px', background: '#f8fafc' } }, [
          h('h4', { key: 't', style: { color: '#0f172a', margin: 0 } }, 'RESUMEN FINANCIERO DEL ABONO'),
          h('div', { key: 'w', style: { marginTop: '6px' } }, ['Semana: ', h('strong', { key: 'wr' }, receipt.weekRange)]),
          h('div', { key: 'a', style: { fontSize: '1.2rem', fontWeight: 'bold', color: '#059669', marginTop: '6px' } }, `Monto Cancelado: $${receipt.amountPaid} USD (${receipt.paymentMethod})`),
          h('div', { key: 'prev', style: { marginTop: '6px', fontSize: '0.9rem' } }, `Saldo Anterior: $${receipt.previousBalance} USD`),
          h('div', { key: 'new', style: { fontWeight: 'bold', color: '#dc2626' } }, `Nuevo Saldo Pendiente: $${receipt.newBalance} USD`)
        ]),
        h('div', { key: 'sigs', className: 'receipt-signatures-print' }, [
          h('div', { key: 's1', className: 'signature-box-print' }, [
            h('div', { key: 'spacer', style: { height: '40px' } }),
            'Firma del Vendedor / Dueño'
          ]),
          h('div', { key: 's2', className: 'signature-box-print' }, [
            h('div', { key: 'spacer', style: { height: '40px' } }),
            'Firma del Comprador'
          ])
        ])
      ]),
      h('div', { key: 'acts', style: { display: 'flex', gap: '10px', marginTop: '20px' } }, [
        h('button', { key: 'b1', className: 'btn btn-secondary', onClick: onClose }, 'Cerrar'),
        h('button', { key: 'b2', className: 'btn btn-primary', onClick: handleDownloadPDF }, '📄 Descargar Comprobante PDF / Imprimir')
      ])
    ])
  ]);
}

// 6. DASHBOARD BALANCE CONTABLE
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

  return h('div', { style: { background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' } }, [
    h('h3', { key: 't', style: { marginBottom: '16px' } }, '📊 Balance y Recaudación de Financiamientos'),
    h('div', { key: 'g1', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' } }, [
      h('div', { key: 'b1', style: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '10px' } }, [
        h('div', { key: 'lbl1', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'TOTAL RECAUDADO ACUMULADO'),
        h('div', { key: 'val1', style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' } }, `$${totalRecaudado} USD`)
      ]),
      h('div', { key: 'b2', style: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px', borderRadius: '10px' } }, [
        h('div', { key: 'lbl2', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'CARTERA TOTAL PENDIENTE'),
        h('div', { key: 'val2', style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' } }, `$${totalCarteraPendiente} USD`)
      ])
    ]),
    h('h4', { key: 't2' }, 'Historial de Comprobantes Emitidos'),
    h('div', { key: 'list', style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' } }, [
      (!db || !Array.isArray(db.receipts) || db.receipts.length === 0) 
        ? h('p', { key: 'empty', style: { color: 'var(--text-muted)', fontSize: '0.85rem' } }, 'No hay recibos registrados.')
        : db.receipts.map(r => (
            h('div', { key: r.id, style: { background: 'var(--bg-card-hover)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
              h('div', { key: 'info' }, [
                h('strong', { key: 'num' }, `Comprobante #${r.receiptNumber}`), ` - ${r.plate}`,
                h('div', { key: 'sub', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, `${r.buyerName} | Fecha: ${r.date}`)
              ]),
              h('div', { key: 'amt', style: { textAlign: 'right' } }, [
                h('strong', { style: { color: '#10b981' } }, `$${r.amountPaid} USD`)
              ])
            ])
          ))
    ])
  ]);
}

// 7. COMPONENTE PRINCIPAL (APP)
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
  const [showPauseModal, setShowPauseModal] = useState(false);
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

  // SI NO HAY SESIÓN INICIADA: RENDERIZAR LOGIN SCREEN
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
    setShowReceiptModal(true);
    setSelectedWeek(null);
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
    setSelectedWeek(null);
    setShowPauseModal(false);
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
          h('div', { key: 'u', style: { fontSize: '0.82rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: '600' } }, `👤 ${userSession.name || OFFICIAL_ADMIN.name}`),
          h('button', { key: 'b', className: 'btn btn-secondary', style: { height: '32px', padding: '0 10px', fontSize: '0.75rem' }, onClick: handleLogout }, 'Salir')
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
              background: c.id === selectedContractId ? '#2563eb' : 'var(--bg-card)',
              color: c.id === selectedContractId ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }
          }, `🚘 ${c.plate} - ${c.vehicleName}`)
        ))
      ),

      h('div', { key: 'prog', className: 'progress-card' }, [
        h('div', { key: 'ph', className: 'progress-header' }, [
          h('span', { key: 'p', className: 'plate-pill', style: { fontSize: '1.1rem' } }, currentContract.plate),
          h('strong', { key: 'pct', style: { color: '#10b981', fontSize: '1.1rem' } }, `${progressPercent}% COMPLETADO`)
        ]),
        h('div', { key: 'pbc', className: 'progress-bar-container' }, [
          h('div', { key: 'pbf', className: 'progress-bar-fill', style: { width: `${progressPercent}%` } })
        ]),
        h('div', { key: 'psg', className: 'progress-stats-grid' }, [
          h('div', { key: 'sb1', className: 'progress-stat-box' }, [
            h('div', { key: 'l', className: 'progress-stat-label' }, 'Costo Total'),
            h('div', { key: 'v', className: 'progress-stat-value', style: { color: '#f8fafc' } }, `$${currentContract.totalVehiclePrice}`)
          ]),
          h('div', { key: 'sb2', className: 'progress-stat-box' }, [
            h('div', { key: 'l', className: 'progress-stat-label' }, 'Total Pagado'),
            h('div', { key: 'v', className: 'progress-stat-value', style: { color: '#10b981' } }, `$${totalPaid}`)
          ]),
          h('div', { key: 'sb3', className: 'progress-stat-box' }, [
            h('div', { key: 'l', className: 'progress-stat-label' }, 'Pendiente'),
            h('div', { key: 'v', className: 'progress-stat-value', style: { color: '#ef4444' } }, `$${pendingBalance}`)
          ])
        ])
      ]),

      h('div', { key: 'det', style: { background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px' } }, [
        h('h3', { key: 't', style: { fontSize: '1.1rem', marginBottom: '8px' } }, `${currentContract.vehicleName} (${currentContract.vehicleModel})`),
        h('div', { key: 'info', style: { fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' } }, [
          h('div', { key: 'b' }, ['👤 ', h('strong', { key: 's' }, 'Comprador / Deudor: '), `${currentContract.buyerName} (Doc: ${currentContract.buyerDocument})`]),
          h('div', { key: 'v' }, ['🏢 ', h('strong', { key: 's' }, 'Vendedor / Dueño: '), currentContract.sellerName]),
          h('div', { key: 'p' }, ['📅 ', h('strong', { key: 's' }, 'Plazo: '), `${currentContract.totalWeeks} Semanas (~14 meses) | 💰 Abono sugerido: $${currentContract.weeklyRate}/sem`])
        ]),
        h('div', { key: 'acts', className: 'vehicle-action-buttons' }, [
          h('button', { key: 'b1', className: 'btn btn-success', onClick: () => setSelectedWeek(currentWeeks.find(w => w.status === 'PENDIENTE') || currentWeeks[0]) }, '➕ Registrar Abono'),
          h('button', { key: 'b2', className: 'btn btn-primary', onClick: () => setShowPauseModal(true) }, '🔵 Marcar Pausa'),
          h('button', { key: 'b3', className: 'btn btn-warning', onClick: () => handleArchiveContract(currentContract.id) }, '📦 Archivar / Liquidado'),
          h('button', { key: 'b4', className: 'btn btn-danger', onClick: () => setShowDeleteModal(true) }, '🗑️ Borrar')
        ])
      ]),

      h('h3', { key: 'wk-t', style: { marginBottom: '12px' } }, 'Calendario de Semanas por Estado'),
      h('div', { key: 'wk-list', className: 'weeks-cards-mobile' }, 
        currentWeeks.map(w => (
          h('div', {
            key: w.id,
            className: `week-card-item status-${w.status}`,
            onClick: () => setSelectedWeek(w)
          }, [
            h('div', { key: 'l' }, [
              h('strong', { key: 'n' }, `Semana ${w.weekNumber}`),
              h('div', { key: 'r', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, w.rangeText),
              w.status === 'PAUSA' ? h('div', { key: 'pr', style: { fontSize: '0.75rem', color: '#60a5fa', marginTop: '2px' } }, `🛠️ ${w.pauseReason}`) : null
            ]),
            h('div', { key: 'r', style: { textAlign: 'right' } }, [
              h('span', { key: 'badge', className: `status-badge-pill badge-${w.status}` }, 
                w.status === 'PAGADA' ? '🟢 Pagada' : (w.status === 'PENDIENTE' ? '🟡 Pendiente' : (w.status === 'PAUSA' ? '🔵 Pausa / Libre' : '🔴 En Mora'))
              ),
              h('div', { key: 'amt', style: { fontWeight: '700', marginTop: '4px' } }, `$${w.status === 'PAGADA' ? w.paidAmount : (w.status === 'PAUSA' ? 0 : w.agreedAmount)} USD`)
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
      h('h3', { key: 't', style: { marginBottom: '16px' } }, 'Contratos Archivados / Liquidados (100% Pagados)'),
      db.contracts.filter(c => c.status === 'ARCHIVED_PAID').length === 0 
        ? h('p', { key: 'empty', style: { color: 'var(--text-muted)' } }, 'No hay contratos archivados aún.')
        : h('div', { key: 'list', style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, 
            db.contracts.filter(c => c.status === 'ARCHIVED_PAID').map(c => (
              h('div', { key: c.id, style: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' } }, [
                h('div', { key: 'hdr', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
                  h('span', { key: 'p', className: 'plate-pill' }, c.plate),
                  h('span', { key: 's', style: { color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' } }, '100% LIQUIDADO 🟢')
                ]),
                h('h4', { key: 'n', style: { marginTop: '8px' } }, c.vehicleName),
                h('div', { key: 'sub', style: { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' } }, `Comprador: ${c.buyerName} | Costo Total: $${c.totalVehiclePrice} USD`)
              ])
            ))
          )
    ]) : null,

    // PESTAÑA 4: BALANCE CONTABLE
    activeTab === 'balance' ? h(FinancialBalanceDashboard, { key: 'tab4', db: db }) : null,

    // MODALES
    selectedWeek && !showPauseModal ? h(AbonoModal, {
      key: 'mod-abono',
      week: selectedWeek,
      contract: currentContract,
      onClose: () => setSelectedWeek(null),
      onSaveAbono: handleSaveAbono
    }) : null,

    showPauseModal ? h(PauseModal, {
      key: 'mod-pause',
      week: currentWeeks.find(w => w.status === 'PENDIENTE') || currentWeeks[0],
      onClose: () => setShowPauseModal(false),
      onSavePausa: handleSavePausa
    }) : null,

    showReceiptModal && receiptData ? h(ReceiptModal, {
      key: 'mod-receipt',
      receipt: receiptData,
      onClose: () => setShowReceiptModal(false)
    }) : null,

    showDeleteModal ? h('div', { key: 'mod-del', className: 'modal-overlay' }, [
      h('div', { className: 'modal-content', style: { maxWidth: '400px' } }, [
        h('h3', { key: 't' }, 'Confirmar Eliminación'),
        h('p', { key: 'p', style: { marginTop: '10px', color: 'var(--text-muted)' } }, [
          '¿Está seguro de que desea borrar permanentemente el contrato del vehículo ', h('strong', { key: 'pl' }, currentContract ? currentContract.plate : ''), '? Esta acción no se puede deshacer.'
        ]),
        h('div', { key: 'acts', style: { display: 'flex', gap: '10px', marginTop: '20px' } }, [
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

// INICIALIZACIÓN SEGURA Y DEFENSIVA DEL RENDERIZADO
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
