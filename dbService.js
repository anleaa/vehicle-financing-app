/* ==========================================================================
   SERVICIO DE BASE DE DATOS DE FINANCIAMIENTO DE VEHÍCULOS (dbService.js)
   Persistencia LocalStorage con esquema relacional a crédito y semillas.
   ========================================================================== */

const STORAGE_KEY = 'vehicle_financing_credit_db_v1';

// Generador de Semanas de Financiamiento (60 semanas / ~14 meses)
function createCreditWeeks(contractId, totalWeeks = 60, weeklyRate = 200) {
  const weeks = [];
  const startOfYear = new Date(2026, 0, 5); // Primer Lunes Enero 2026

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

    // Semanas de prueba iniciales para el primer contrato
    if (i <= 5) {
      status = 'PAGADA';
      paidAmount = weeklyRate; // $200
    } else if (i === 6) {
      status = 'PAUSA';
      paidAmount = 0;
      pauseReason = 'Congelado por Mantenimiento en Taller (Frenos) - Semana Libre';
    } else if (i === 7) {
      status = 'PAGADA';
      paidAmount = 250; // Abono editable extraordinario de $250
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
      status, // 'PAGADA', 'PENDIENTE', 'PAUSA', 'EN_MORA'
      agreedAmount: weeklyRate,
      paidAmount,
      pauseReason,
      paymentDate: (i <= 5 || i === 7) ? s.toISOString().split('T')[0] : null
    });
  }

  return weeks;
}

// Datos de Demostración Iniciales (Semillas)
const INITIAL_DB = () => {
  const contract1Id = 'CTR-001';
  const contract2Id = 'CTR-002';

  const contracts = [
    {
      id: contract1Id,
      plate: 'ABC-999',
      vehicleModel: 'Toyota Corolla Cross',
      vehicleName: 'Corolla Cross 2022',
      sellerName: 'Lic. Roberto Silva (Vendedor)',
      buyerName: 'Juan Carlos Rodríguez',
      buyerDocument: 'V-19.823.411',
      buyerPhone: '+58 412-888-9900',
      totalVehiclePrice: 12000, // $12,000 USD
      weeklyRate: 200,          // Abono semanal sugerido $200 USD
      totalWeeks: 60,           // 60 semanas (~14 meses)
      startDate: '2026-01-05',
      status: 'ACTIVE'          // 'ACTIVE', 'ARCHIVED_PAID', 'CANCELLED'
    },
    {
      id: contract2Id,
      plate: 'XYZ-111',
      vehicleModel: 'Nissan Sentra Exclusive',
      vehicleName: 'Sentra 2020 (Liquidado)',
      sellerName: 'Lic. Roberto Silva (Vendedor)',
      buyerName: 'Ana María Martínez',
      buyerDocument: 'V-21.094.122',
      buyerPhone: '+58 414-777-1122',
      totalVehiclePrice: 8000,  // $8,000 USD
      weeklyRate: 200,
      totalWeeks: 40,
      startDate: '2025-01-01',
      status: 'ARCHIVED_PAID'   // Crédito 100% Pagado y Archivado
    }
  ];

  let weeklyInstallments = [];
  // Semanas para Contrato 1
  weeklyInstallments = weeklyInstallments.concat(createCreditWeeks(contract1Id, 60, 200));
  
  // Semanas para Contrato 2 (100% Pagado)
  for (let i = 1; i <= 40; i++) {
    weeklyInstallments.push({
      id: `W-${contract2Id}-${i}`,
      contractId: contract2Id,
      weekNumber: i,
      rangeText: `Semana ${i}`,
      status: 'PAGADA',
      agreedAmount: 200,
      paidAmount: 200,
      pauseReason: '',
      paymentDate: '2025-10-15'
    });
  }

  const receipts = [
    {
      id: 'REC-2026-001',
      receiptNumber: '0001',
      contractId: contract1Id,
      plate: 'ABC-999',
      vehicleModel: 'Toyota Corolla Cross',
      sellerName: 'Lic. Roberto Silva (Vendedor)',
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
  ];

  return {
    contracts,
    weeklyInstallments,
    receipts
  };
};

export const dbService = {
  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar base de datos local:", e);
      }
    }
    const initial = INITIAL_DB();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  save(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  },

  // Obtener estadísticas financieras de un contrato (Monto Total, Pagado, Pendiente, %)
  getContractStats(contract, weeklyInstallments) {
    const installments = weeklyInstallments.filter(w => w.contractId === contract.id);
    
    let totalPaid = 0;
    let paidWeeksCount = 0;
    let pendingWeeksCount = 0;
    let pausedWeeksCount = 0;
    let overdueWeeksCount = 0;

    installments.forEach(w => {
      if (w.status === 'PAGADA') {
        totalPaid += Number(w.paidAmount || 0);
        paidWeeksCount++;
      } else if (w.status === 'PENDIENTE') {
        pendingWeeksCount++;
      } else if (w.status === 'PAUSA') {
        pausedWeeksCount++;
      } else if (w.status === 'EN_MORA') {
        overdueWeeksCount++;
      }
    });

    // Si el contrato está en estado ARCHIVED_PAID, el total pagado es el precio completo
    if (contract.status === 'ARCHIVED_PAID') {
      totalPaid = contract.totalVehiclePrice;
    }

    const pendingBalance = Math.max(0, contract.totalVehiclePrice - totalPaid);
    const progressPercent = Math.min(100, Math.round((totalPaid / contract.totalVehiclePrice) * 100));

    return {
      totalVehiclePrice: contract.totalVehiclePrice,
      totalPaid,
      pendingBalance,
      progressPercent,
      paidWeeksCount,
      pendingWeeksCount,
      pausedWeeksCount,
      overdueWeeksCount
    };
  }
};
