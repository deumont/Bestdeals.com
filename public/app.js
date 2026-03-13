const form = document.getElementById('uploadForm');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  resultEl.innerHTML = '';

  const fileInput = document.getElementById('productImage');
  const file = fileInput.files?.[0];

  if (!file) {
    statusEl.textContent = 'Please choose an image first.';
    return;
  }

  const formData = new FormData();
  formData.append('productImage', file);

  const submitButton = form.querySelector('button');
  submitButton.disabled = true;
  statusEl.textContent = 'Analyzing image and estimating prices...';

  try {
    const response = await fetch('/api/price-check', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    const rows = (data.priceComparisons || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.website)}</td>
            <td>${escapeHtml(item.price)} ${escapeHtml(item.currency || '')}</td>
            <td>${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Visit</a>` : '-'}</td>
            <td>${escapeHtml(item.note || '')}</td>
          </tr>
        `
      )
      .join('');

    resultEl.innerHTML = `
      <article class="result-card">
        <h2>${escapeHtml(data.productName || 'Unknown product')}</h2>
        <p><strong>AI Confidence:</strong> ${escapeHtml(data.confidence || 'N/A')}%</p>
        <p>${escapeHtml(data.analysisNotes || '')}</p>
      </article>
      <article class="result-card">
        <h3>Price comparisons</h3>
        <table>
          <thead>
            <tr>
              <th>Website</th>
              <th>Price</th>
              <th>Link</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4">No prices returned.</td></tr>'}
          </tbody>
        </table>
      </article>
    `;

    statusEl.textContent = 'Done! Review the estimated prices below.';
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
});
