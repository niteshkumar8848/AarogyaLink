import { useEffect, useState } from 'react';

const NEPAL_BANKS = [
  'Agricultural Development Bank',
  'Citizens Bank International',
  'Everest Bank',
  'Global IME Bank',
  'Himalayan Bank',
  'Kumari Bank',
  'Laxmi Sunrise Bank',
  'Machhapuchchhre Bank',
  'Nabil Bank',
  'Nepal Bank',
  'Nepal Investment Mega Bank',
  'Nepal SBI Bank',
  'NIC Asia Bank',
  'Prime Commercial Bank',
  'Prabhu Bank',
  'Rastriya Banijya Bank',
  'Sanima Bank',
  'Siddhartha Bank',
  'Standard Chartered Bank Nepal'
];

const PAYMENT_METHODS = [
  {
    value: 'esewa',
    label: 'eSewa',
    logo: '/assets/logos/esewa-icon.png',
    logoWrap: 'bg-emerald-700',
    color: 'bg-emerald-600',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700'
  },
  {
    value: 'khalti',
    label: 'Khalti',
    logo: '/assets/logos/khalti-icon.png',
    logoWrap: 'bg-white',
    color: 'bg-violet-700',
    light: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700'
  },
  {
    value: 'mobile_banking',
    label: 'Mobile Banking',
    logo: '/assets/logos/mobile-banking.png',
    logoWrap: 'bg-white',
    color: 'bg-sky-700',
    light: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700'
  }
];

const DummyPaymentScreen = ({ open, onClose, onSuccess, doctorName, doctorPhoto, date, timeSlot, amount = 0 }) => {
  const [method, setMethod] = useState('esewa');
  const [selectedBank, setSelectedBank] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [authSecret, setAuthSecret] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const selectedMethod = PAYMENT_METHODS.find((item) => item.value === method) || PAYMENT_METHODS[0];
  const baseAmount = Math.max(0, Number(amount) || 0);
  const serviceCharge = method === 'mobile_banking' ? 10 : 0;
  const totalAmount = baseAmount + serviceCharge;
  const contactLabel = method === 'mobile_banking' ? 'Mobile Number' : 'Wallet / Mobile Number';
  const contactPlaceholder = method === 'mobile_banking' ? '98XXXXXXXX' : method === 'khalti' ? '98XXXXXXXX' : '98XXXXXXXX / account number';
  const credentialLabel = method === 'esewa' ? 'Password' : method === 'khalti' ? 'MPIN' : 'Password / MPIN';
  const credentialPlaceholder = method === 'esewa' ? 'Enter eSewa password' : method === 'khalti' ? 'Enter 4-digit MPIN' : 'Enter mobile banking password or MPIN';

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setShowSuccess(false);
      setError('');
      setMethod('esewa');
      setSelectedBank('');
      setMobileNumber('');
      setBankAccountNumber('');
      setAuthSecret('');
      setTransactionId('');
    }
  }, [open]);

  if (!open) return null;

  const payNow = async () => {
    if (method === 'mobile_banking' && !selectedBank) {
      setError('Please select your bank for mobile banking payment.');
      return;
    }
    if (!mobileNumber.trim() || !authSecret.trim()) {
      setError(`Enter mobile number and ${credentialLabel.toLowerCase()} to continue.`);
      return;
    }
    setError('');
    setProcessing(true);
    const generatedTransactionId = `${method.toUpperCase().replace('_', '')}-${Date.now().toString().slice(-8)}`;
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setTransactionId(generatedTransactionId);
    onSuccess({
      method,
      bankName: selectedBank,
      transactionId: generatedTransactionId,
      mobileNumber: mobileNumber.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      success: true
    });
    setProcessing(false);
    setShowSuccess(true);
    setTimeout(() => onClose(), 1450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {showSuccess ? (
          <div className="px-6 py-8 text-center">
            <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
              <span className="absolute h-24 w-24 animate-ping rounded-full bg-emerald-100" />
              <span className="absolute h-20 w-20 animate-pulse rounded-full bg-emerald-200/70" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white">
                ✓
              </span>
            </div>
            <h3 className="text-xl font-semibold text-ink">Payment Successful</h3>
            <p className="mt-1 text-sm text-slate-600">Your payment has been verified. You can now confirm your appointment.</p>
            <div className="mx-auto mt-4 max-w-xs rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
              <p className="font-medium">Transaction: {transactionId}</p>
              <p>Total Paid: NPR {totalAmount.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`flex items-center justify-between px-5 py-4 ${selectedMethod.color}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg px-3 py-2 ${selectedMethod.logoWrap}`}>
                  {selectedMethod.logo ? (
                    <img src={selectedMethod.logo} alt={selectedMethod.label} className="h-6 w-auto object-contain" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">Mobile Banking</p>
                  )}
                </div>
                <div className="text-white">
                  <p className="text-sm opacity-90">Secure Online Payment</p>
                  <h3 className="text-lg font-semibold">Pay with {selectedMethod.label}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/95 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-5">
              <div className="border-r border-slate-200 p-5 md:col-span-3">
                <p className="text-sm font-semibold text-slate-900">Choose Payment Method</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setMethod(item.value)}
                      className={`rounded-xl border p-3 text-left transition ${
                        method === item.value ? `${item.border} ${item.light} ring-1 ring-inset ${item.border}` : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mb-2 h-6">
                        {item.logo ? (
                          <div className={`inline-flex rounded-md px-2 py-1 ${item.logoWrap}`}>
                            <img src={item.logo} alt={item.label} className="h-5 w-auto object-contain" />
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-slate-700">MB</p>
                        )}
                      </div>
                      <p className={`text-xs font-medium ${method === item.value ? item.text : 'text-slate-700'}`}>{item.label}</p>
                    </button>
                  ))}
                </div>

                <div className={`mt-4 rounded-xl border p-3 ${selectedMethod.border} ${selectedMethod.light}`}>
                  <p className={`text-sm font-semibold ${selectedMethod.text}`}>Payment Details</p>
                  {method === 'mobile_banking' ? (
                    <>
                      <label className="mt-2 block text-xs font-medium text-slate-700">Bank Name</label>
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        <option value="">Select a Nepal bank</option>
                        {NEPAL_BANKS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}
                  <label className="mt-2 block text-xs font-medium text-slate-700">{contactLabel}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder={contactPlaceholder}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  {method === 'mobile_banking' ? (
                    <>
                      <label className="mt-2 block text-xs font-medium text-slate-700">Bank Account Number</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                        placeholder="Enter bank account number"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                      />
                    </>
                  ) : null}
                  <label className="mt-2 block text-xs font-medium text-slate-700">{credentialLabel}</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder={credentialPlaceholder}
                    value={authSecret}
                    onChange={(e) => setAuthSecret(e.target.value)}
                  />
                  <label className="mt-2 block text-xs font-medium text-slate-700">Payable Amount</label>
                  <input
                    readOnly
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                    value={`NPR ${totalAmount.toLocaleString()}`}
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    Enter your {selectedMethod.label} login credential to complete secure payment.
                  </p>
                </div>
                {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
              </div>

              <div className="bg-slate-50 p-5 md:col-span-2">
                <p className="text-sm font-semibold text-slate-900">Appointment Summary</p>
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <div className="mb-2 flex items-center gap-2">
                    {doctorPhoto ? (
                      <img src={doctorPhoto} alt={`Dr. ${doctorName || 'Doctor'}`} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700">
                        {(doctorName || 'D').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">Dr. {doctorName || 'N/A'}</p>
                      <p className="text-xs text-slate-500">Consultation Booking</p>
                    </div>
                  </div>
                  <p className="mt-1 text-slate-700"><span className="font-medium">Date:</span> {date || 'N/A'}</p>
                  <p className="text-slate-700"><span className="font-medium">Time:</span> {timeSlot || 'N/A'}</p>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600">Consultation Fee</p>
                    <p className="font-medium text-slate-900">NPR {baseAmount.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-slate-600">Service Charge</p>
                    <p className="font-medium text-slate-900">NPR {serviceCharge.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">Total</p>
                      <p className="text-lg font-bold text-slate-900">NPR {totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={payNow}
                  disabled={processing}
                  className={`mt-4 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-70 ${selectedMethod.color}`}
                >
                  {processing ? 'Verifying Payment...' : `Pay NPR ${totalAmount.toLocaleString()}`}
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  By proceeding, you confirm this is an online prepaid booking.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DummyPaymentScreen;
