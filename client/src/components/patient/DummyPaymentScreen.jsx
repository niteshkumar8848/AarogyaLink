import { useEffect, useState } from 'react';

const PAYMENT_METHODS = [
  { value: 'esewa', label: 'eSewa' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'mobile_banking', label: 'Mobile Banking' }
];

const DummyPaymentScreen = ({ open, onClose, onSuccess, doctorName, doctorPhoto, date, timeSlot, amount = 0 }) => {
  const [method, setMethod] = useState('esewa');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setShowSuccess(false);
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const payNow = async () => {
    if (!mobileNumber.trim() || !transactionId.trim()) {
      setError('Enter mobile number and transaction reference to continue.');
      return;
    }
    setError('');
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    onSuccess({
      method,
      transactionId: transactionId.trim(),
      mobileNumber: mobileNumber.trim(),
      success: true
    });
    setProcessing(false);
    setShowSuccess(true);
    setTimeout(() => onClose(), 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-3">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-card">
        {showSuccess ? (
          <div className="py-6 text-center">
            <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
              <span className="absolute h-24 w-24 rounded-full bg-teal-100 animate-ping" />
              <span className="absolute h-20 w-20 rounded-full bg-teal-200/70 animate-pulse" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-3xl font-bold text-white">
                ✓
              </span>
            </div>
            <h3 className="text-xl font-semibold text-ink">Payment Successful</h3>
            <p className="mt-1 text-sm text-teal-700">Your payment is verified. You can now confirm booking.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-ink">Online Payment</h3>
            <p className="mt-1 text-sm text-teal-700">Payment is required before booking confirmation.</p>

            <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3 text-sm">
              <div className="mb-2 flex items-center gap-2">
                {doctorPhoto ? (
                  <img src={doctorPhoto} alt={`Dr. ${doctorName || 'Doctor'}`} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700">
                    {(doctorName || 'D').charAt(0).toUpperCase()}
                  </div>
                )}
                <p><span className="font-medium">Doctor:</span> {doctorName || 'N/A'}</p>
              </div>
              <p><span className="font-medium">Date:</span> {date || 'N/A'}</p>
              <p><span className="font-medium">Time:</span> {timeSlot || 'N/A'}</p>
              <p><span className="font-medium">Amount:</span> NPR {amount}</p>
            </div>

            <label className="mt-3 block text-sm font-medium text-teal-900">Payment Method</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMethod(item.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                    method === item.value ? 'border-primary bg-teal-100 text-teal-900' : 'border-teal-200 text-teal-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              className="mt-3 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
              placeholder="Wallet/Mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
            <input
              className="mt-2 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
              placeholder="Transaction reference"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />

            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={payNow}
                disabled={processing}
                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-70"
              >
                {processing ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DummyPaymentScreen;
