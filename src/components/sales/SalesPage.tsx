import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from '../../store';
import { Sale, PaymentType } from '../../types';
import {
  formatCurrency, formatDate, formatTons, getPaymentBadgeClass,
  getPaymentLabel, generateId, getTodayDate
} from '../../utils';
import Modal from '../ui/Modal';

const PAYMENT_TYPES: PaymentType[] = ['naqd', 'nasiya', 'karta'];

function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  onSelect,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  onSelect?: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase()) && s !== value
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700 text-dark-800 dark:text-dark-100 first:rounded-t-xl last:rounded-b-xl transition-colors"
              onMouseDown={() => {
                onChange(s);
                if (onSelect) onSelect(s);
                setOpen(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SaleForm({ onClose }: { onClose: () => void }) {
  const { clients, drivers, addSale } = useStore();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverCar, setDriverCar] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [tons, setTons] = useState('');
  const [pricePerTon, setPricePerTon] = useState('900000');
  const [paymentType, setPaymentType] = useState<PaymentType>('naqd');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const clientNames = clients.map(c => c.name);
  const driverNames = drivers.map(d => d.name);

  const totalAmount = useMemo(() => {
    const t = parseFloat(tons) || 0;
    const p = parseFloat(pricePerTon) || 0;
    return t * p;
  }, [tons, pricePerTon]);

  const handleClientSelect = (name: string) => {
    const client = clients.find(c => c.name === name);
    if (client) setClientPhone(client.phone);
  };

  const handleDriverSelect = (name: string) => {
    const driver = drivers.find(d => d.name === name);
    if (driver) {
      setDriverCar(driver.carNumber);
      setDriverPhone(driver.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) { setError('Mijoz ismi kiritilmagan'); return; }
    if (!driverName.trim()) { setError('Haydovchi ismi kiritilmagan'); return; }
    if (!tons || parseFloat(tons) <= 0) { setError('Tonna noto\'g\'ri'); return; }
    if (!pricePerTon || parseFloat(pricePerTon) <= 0) { setError('Narx noto\'g\'ri'); return; }

    let clientId = clients.find(c => c.name === clientName)?.id || generateId();

    const sale: Sale = {
      id: generateId(),
      clientId,
      clientName,
      driverId: drivers.find(d => d.name === driverName)?.id || generateId(),
      driverName,
      driverCarNumber: driverCar,
      tons: parseFloat(tons),
      pricePerTon: parseFloat(pricePerTon),
      totalAmount,
      paymentType,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
      date: getTodayDate(),
    };

    addSale(sale);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <AutocompleteInput
            label="Mijoz ismi *"
            value={clientName}
            onChange={setClientName}
            suggestions={clientNames}
            placeholder="Mijoz ismi yoki yangi..."
            onSelect={handleClientSelect}
          />
        </div>

        <div>
          <label className="label">Mijoz telefon</label>
          <input
            type="text"
            value={clientPhone}
            onChange={e => setClientPhone(e.target.value)}
            className="input"
            placeholder="+998 90 123 45 67"
          />
        </div>

        <div className="col-span-2">
          <AutocompleteInput
            label="Haydovchi ismi *"
            value={driverName}
            onChange={setDriverName}
            suggestions={driverNames}
            placeholder="Haydovchi ismi yoki yangi..."
            onSelect={handleDriverSelect}
          />
        </div>

        <div>
          <label className="label">Avto raqam</label>
          <input
            type="text"
            value={driverCar}
            onChange={e => setDriverCar(e.target.value)}
            className="input"
            placeholder="40 A 1234 FA"
          />
        </div>

        <div>
          <label className="label">Haydovchi tel</label>
          <input
            type="text"
            value={driverPhone}
            onChange={e => setDriverPhone(e.target.value)}
            className="input"
            placeholder="+998 90 000 00 00"
          />
        </div>

        <div>
          <label className="label">Tonna *</label>
          <input
            type="number"
            value={tons}
            onChange={e => setTons(e.target.value)}
            className="input"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="label">1 tonna narxi (so'm) *</label>
          <input
            type="number"
            value={pricePerTon}
            onChange={e => setPricePerTon(e.target.value)}
            className="input"
            placeholder="900000"
            step="1000"
          />
        </div>
      </div>

      {/* Total */}
      {totalAmount > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/50 rounded-xl px-4 py-3">
          <p className="text-xs text-primary-600 dark:text-primary-400">Jami summa</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(totalAmount)}</p>
        </div>
      )}

      {/* Payment type */}
      <div>
        <label className="label">To'lov turi *</label>
        <div className="flex gap-2">
          {PAYMENT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setPaymentType(type)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                paymentType === type
                  ? type === 'naqd' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : type === 'nasiya' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-dark-300'
              }`}
            >
              {getPaymentLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Izoh</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="input min-h-[70px] resize-none"
          placeholder="Qo'shimcha ma'lumot..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor qilish</button>
        <button type="submit" className="btn-primary flex-1">Saqlash</button>
      </div>
    </form>
  );
}

export default function SalesPage() {
  const { sales, deleteSale } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<PaymentType | 'all'>('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    return sales.filter(s => {
      const matchSearch = s.clientName.toLowerCase().includes(search.toLowerCase()) ||
        s.driverName.toLowerCase().includes(search.toLowerCase());
      const matchPayment = filterPayment === 'all' || s.paymentType === filterPayment;
      return matchSearch && matchPayment;
    });
  }, [sales, search, filterPayment]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totals = useMemo(() => ({
    total: filtered.reduce((sum, s) => sum + s.totalAmount, 0),
    tons: filtered.reduce((sum, s) => sum + s.tons, 0),
  }), [filtered]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Sotuv</h1>
          <p className="text-sm text-slate-500 dark:text-dark-400">{filtered.length} ta yozuv</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Yangi sotuv
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Mijoz yoki haydovchi qidirish..."
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'naqd', 'nasiya', 'karta'] as const).map(type => (
            <button
              key={type}
              onClick={() => { setFilterPayment(type); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                filterPayment === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-dark-300 hover:bg-slate-200 dark:hover:bg-dark-600'
              }`}
            >
              {type === 'all' ? 'Barchasi' : getPaymentLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Jami summa</p>
            <p className="text-lg font-bold text-dark-900 dark:text-white">{formatCurrency(totals.total)}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Jami tonna</p>
            <p className="text-lg font-bold text-dark-900 dark:text-white">{formatTons(totals.tons)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-700/50 border-b border-slate-200 dark:border-dark-700">
              <tr>
                <th className="table-header">Sana</th>
                <th className="table-header">Mijoz</th>
                <th className="table-header">Haydovchi</th>
                <th className="table-header">Tonna</th>
                <th className="table-header">Narx/t</th>
                <th className="table-header">Jami</th>
                <th className="table-header">To'lov</th>
                <th className="table-header">Izoh</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
              {paginated.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30 transition-colors">
                  <td className="table-cell text-xs text-slate-500">{formatDate(sale.date)}</td>
                  <td className="table-cell font-medium">{sale.clientName}</td>
                  <td className="table-cell">
                    <div>
                      <p className="text-sm font-medium">{sale.driverName}</p>
                      <p className="text-xs text-slate-500">{sale.driverCarNumber}</p>
                    </div>
                  </td>
                  <td className="table-cell font-semibold">{formatTons(sale.tons)}</td>
                  <td className="table-cell text-xs">{formatCurrency(sale.pricePerTon)}</td>
                  <td className="table-cell font-bold text-primary-600 dark:text-primary-400">{formatCurrency(sale.totalAmount)}</td>
                  <td className="table-cell">
                    <span className={getPaymentBadgeClass(sale.paymentType)}>
                      {getPaymentLabel(sale.paymentType)}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-slate-500 max-w-32 truncate">{sale.note || '—'}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => deleteSale(sale.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="table-cell text-center py-12 text-slate-400">Hech qanday sotuv topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-700">
            <p className="text-sm text-slate-500">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} / {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost py-1 px-2 disabled:opacity-40">‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`py-1 px-3 rounded-lg text-sm transition-all ${page === p ? 'bg-primary-500 text-white' : 'btn-ghost'}`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost py-1 px-2 disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yangi sotuv qo'shish" size="lg">
        <SaleForm onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
