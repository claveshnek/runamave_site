// Age-verification interstitial for pages that show explicit content (video
// and category pages only — the homepage/blog stay un-gated since they don't
// embed/display explicit material directly). Confirmation is remembered for
// the session (sessionStorage) so it doesn't nag on every page within a visit.
// IMPORTANT: this <script> must be the first thing right after <body> opens,
// not deferred/async, so the overlay paints before any explicit content below it.
(function () {
  try {
    if (sessionStorage.getItem('lm_age_ok') === '1') return;
  } catch (e) { /* storage blocked (private mode etc.) — show the gate anyway */ }

  var overlay = document.createElement('div');
  overlay.id = 'age-gate';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#080704;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;';
  overlay.innerHTML =
    '<div style="max-width:420px;text-align:center;color:#e4d8c0;">' +
    '<div style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#c9a84c;margin-bottom:16px;">Laruna Mave</div>' +
    '<p style="font-size:15px;line-height:1.6;margin-bottom:28px;">This page contains sexually explicit material intended for adults only. You must be 18 years of age or older (or the age of majority in your jurisdiction) to continue.</p>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">' +
    '<button id="age-gate-enter" style="background:#FF9000;color:#0b0b0b;border:none;padding:13px 26px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;border-radius:5px;cursor:pointer;">I am 18 or older — Enter</button>' +
    '<a href="https://www.google.com" style="background:none;color:#a89878;border:1px solid #333;padding:13px 26px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;border-radius:5px;text-decoration:none;">Exit</a>' +
    '</div>' +
    '<p style="font-size:10px;color:#8a8070;margin-top:20px;">18 U.S.C. 2257 — all performers depicted were adults at the time of filming.</p>' +
    '</div>';

  document.documentElement.style.overflow = 'hidden';
  document.body.appendChild(overlay);
  document.getElementById('age-gate-enter').addEventListener('click', function () {
    try { sessionStorage.setItem('lm_age_ok', '1'); } catch (e) {}
    overlay.remove();
    document.documentElement.style.overflow = '';
  });
})();
