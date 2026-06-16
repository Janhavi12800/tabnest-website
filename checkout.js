// TabNest landing-page checkout — opens Razorpay, sends success to Apps Script.
//
// OWNER TODO (two values to set):
//   1. RAZORPAY_KEY_ID — from Razorpay Dashboard → Settings → API Keys.
//      Use rzp_test_xxx while testing; switch to rzp_live_xxx for real sales.
//   2. APPS_SCRIPT_URL — the Web App URL from your Apps Script deployment.

const RAZORPAY_KEY_ID = 'rzp_live_T1ALXI1GZ9zE9Y';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz9o5rAEvkx_u3nACk62VUnsi9RDFMVzPQ_nBc86OJZEaCVYl568SMnJEv_lx4j5g10/exec';

const PRICE_RUPEES = 100;

function $(s) { return document.querySelector(s); }

function isConfigured() {
  return !RAZORPAY_KEY_ID.includes('PASTE_YOUR_KEY_ID') &&
         !APPS_SCRIPT_URL.includes('PASTE-DEPLOYMENT-ID');
}

function setStatus(msg, color) {
  const el = $('#status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || 'var(--text-medium)';
}

function validEmail(s) {
  return /\S+@\S+\.\S+/.test(s);
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = $('#buy-btn');
  const emailInput = $('#buyer-email');
  if (!btn) return;

  // Prefill email if the extension sent the user here with ?email=
  try {
    const params = new URLSearchParams(window.location.search);
    const prefillEmail = params.get('email');
    if (prefillEmail && emailInput) {
      emailInput.value = prefillEmail;
    }
    if (params.get('from') === 'extension') {
      setStatus('Welcome back from TabNest. Your subscription will activate instantly in the extension.', 'var(--brown-dark)');
    }
  } catch {}

  btn.addEventListener('click', () => {
    if (!isConfigured()) {
      setStatus('Checkout isn\'t configured yet. Owner: see checkout.js TODOs.', '#C45C5C');
      return;
    }
    const email = (emailInput?.value || '').trim();
    if (!validEmail(email)) {
      setStatus('Please enter a valid email — that\'s where your activation code goes.', '#C45C5C');
      emailInput?.focus();
      return;
    }
    openRazorpay(email);
  });

  emailInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click();
  });
});

function openRazorpay(email) {
  setStatus('Opening secure checkout…');
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: PRICE_RUPEES * 100, // paisa
    currency: 'INR',
    name: 'TabNest Pro',
    description: 'Lifetime Pro license · activation code emailed instantly',
    image: 'assets/icon-large.png',
    prefill: { email },
    notes: { product: 'tabnest-pro', email },
    theme: { color: '#8B6F47' },
    handler: function (response) {
      onPaymentSuccess(response.razorpay_payment_id, email);
    },
    modal: {
      ondismiss: function () {
        setStatus('Payment cancelled.');
      },
      escape: true,
      backdropclose: false
    }
  };
  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      const reason = response?.error?.description || 'payment failed';
      setStatus('Payment failed: ' + reason + '. Try again or use a different method.', '#C45C5C');
    });
    rzp.open();
  } catch (e) {
    setStatus('Could not open checkout: ' + e.message, '#C45C5C');
  }
}

async function onPaymentSuccess(paymentId, email) {
  setStatus('Payment received! Sending your activation code...');
  try {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set('action', 'buy');
    url.searchParams.set('paymentId', paymentId);
    url.searchParams.set('email', email);
    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.ok) {
      const params = new URLSearchParams({ email, pid: paymentId });
      const incoming = new URLSearchParams(window.location.search);
      const from = incoming.get('from');
      if (from) params.set('from', from);
      window.location.href = 'success.html?' + params.toString();
    } else {
      setStatus(
        'Payment verified but server couldn\'t finish: ' + (data.error || 'unknown') +
        '. Email us with payment ID: ' + paymentId,
        '#C45C5C'
      );
    }
  } catch (e) {
    setStatus(
      'Couldn\'t reach our server, but your payment went through. ' +
      'Email us with payment ID: ' + paymentId,
      '#C45C5C'
    );
  }
}
