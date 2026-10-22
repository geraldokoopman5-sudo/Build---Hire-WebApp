// Runs only against the temporary API owned by the PostgreSQL regression harness.
// All HTTP responses are real. The loopback proxy only forwards HTTPS-proxy headers.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = resolve(project, '../.artifacts/browser-integration');
const api = process.env.BUILDANDHIRE_TEST_API;
const password = process.env.BUILDANDHIRE_TEST_PASSWORD;
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(api ?? '') || !password || process.env.BUILDANDHIRE_ISOLATED_SCHEMA !== 'true') throw new Error('This test requires the isolated PostgreSQL harness.');
const browserPath = process.env.BUILDANDHIRE_TEST_BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
if (!existsSync(browserPath)) throw new Error('Set BUILDANDHIRE_TEST_BROWSER to a Chromium browser executable.');
await mkdir(artifacts, { recursive: true });
const delay = ms => new Promise(r => setTimeout(r, ms));
const reports = [], errors = [], screenshots = [];
let browser, cdp;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const dist = resolve(project, 'dist');
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/')) {
      const buffers = []; for await (const chunk of request) buffers.push(chunk);
      const upstream = await fetch(api + url.pathname + url.search, { method: request.method, headers: { 'Content-Type': request.headers['content-type'] ?? 'application/json', ...(request.headers.authorization ? { Authorization: request.headers.authorization } : {}), 'X-Forwarded-Proto': 'https' }, body: ['GET', 'HEAD'].includes(request.method) ? undefined : Buffer.concat(buffers) });
      response.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') ?? 'text/plain' });
      response.end(Buffer.from(await upstream.arrayBuffer())); return;
    }
    const file = resolve(dist, '.' + decodeURIComponent(url.pathname));
    if (file !== dist && !file.startsWith(dist + sep)) { response.writeHead(403); response.end(); return; }
    const isAsset = url.pathname.startsWith('/assets/');
    const chosen = isAsset ? file : resolve(dist, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[extname(chosen)] ?? 'application/octet-stream' });
    response.end(await readFile(chosen));
  } catch { response.writeHead(500); response.end('Test server unavailable'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

class CDP {
  constructor(socket) { this.socket = socket; this.id = 0; this.pending = new Map(); socket.addEventListener('message', event => {
    const value = JSON.parse(String(event.data));
    if (value.id) { const item = this.pending.get(value.id); if (!item) return; this.pending.delete(value.id); value.error ? item.reject(new Error(value.error.message)) : item.resolve(value.result); }
    if (value.method === 'Page.javascriptDialogOpening') { errors.push('Unexpected browser confirmation'); void this.call('Page.handleJavaScriptDialog', { accept: false }); }
    if (value.method === 'Runtime.exceptionThrown') errors.push(value.params.exceptionDetails.text + ': ' + (value.params.exceptionDetails.exception?.description ?? ''));
  }); }
  call(method, params = {}) { return new Promise((resolve, reject) => { const id = ++this.id; this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  async evaluate(expression) { const result = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value; }
}
async function wait(expression, label, timeout = 12000) { const stop = Date.now() + timeout; while (Date.now() < stop) { if (await cdp.evaluate(expression).catch(() => false)) return; await delay(80); } throw new Error('Timed out: ' + label); }
async function navigate(path) { await cdp.call('Page.navigate', { url: origin + path }); await wait(`document.readyState === 'complete' && !!document.querySelector('#root')`, 'navigation ' + path); await delay(140); }
async function text(value) { await wait(`document.body.textContent.toLowerCase().includes(${JSON.stringify(value.toLowerCase())})`, value); }
async function input(selector, value) { await wait(`!!document.querySelector(${JSON.stringify(selector)})`, selector); await cdp.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const prototype=el.tagName==='SELECT'?HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(el,${JSON.stringify(String(value))});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`); await delay(35); }
async function click(label, scope = 'document') { await wait(`!![...${scope}.querySelectorAll('button,a')].find(el=>el.textContent.trim().includes(${JSON.stringify(label)})&&!el.disabled)`, 'click ' + label); await cdp.evaluate(`[...${scope}.querySelectorAll('button,a')].find(el=>el.textContent.trim().includes(${JSON.stringify(label)})&&!el.disabled).click()`); await delay(80); }
async function acceptConfirmation(label = 'Confirm') {
  await wait(`!!document.querySelector('[data-confirmation-dialog]')?.open`, 'site confirmation opens');
  await click(label, `document.querySelector('[data-confirmation-dialog]')`);
  await wait(`!document.querySelector('[data-confirmation-dialog]')`, 'site confirmation closes');
}
async function confirmAction(label, confirmLabel = 'Confirm') { await click(label); await acceptConfirmation(confirmLabel); }
async function submit() { await cdp.evaluate(`document.querySelector('[role="dialog"] form, form').requestSubmit()`); await delay(100); }
async function check(expression, label) { if (!await cdp.evaluate(expression)) throw new Error('FAILED BROWSER: ' + label); reports.push(label); console.log('PASS BROWSER: ' + label); }
async function snapshot(name, mobile = false) {
  if (mobile) await cdp.call('Emulation.setDeviceMetricsOverride', { width: 375, height: 1100, deviceScaleFactor: 1, mobile: false });
  await delay(80);
  if (name !== 'failure') await check(`(()=>{
    const rgb=s=>s.match(/[\\d.]+/g)?.map(Number);
    const luminance=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
    const headings=[...document.querySelectorAll('h1,h2,h3')].filter(el=>el.getBoundingClientRect().height>0);
    return headings.length>0&&headings.every(el=>{
      const fg=rgb(getComputedStyle(el).color);let ancestor=el,bg;
      while(ancestor){const c=rgb(getComputedStyle(ancestor).backgroundColor);if(c&&(c.length===3||c[3]===1)){bg=c;break}ancestor=ancestor.parentElement}
      if(!fg||!bg)return false;const a=luminance(fg),b=luminance(bg);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5;
    })
  })()`, name + ' has readable heading contrast');
  const result = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(resolve(artifacts, name + '.png'), Buffer.from(result.data, 'base64')); screenshots.push(name);
  if (mobile) { await check('document.documentElement.scrollWidth<=innerWidth', name + ' has no horizontal overflow'); await cdp.call('Emulation.clearDeviceMetricsOverride'); }
}
async function apiRead(path, method = 'GET', body) { return cdp.evaluate(`(async()=>{const r=await fetch(${JSON.stringify('/api' + path)},{method:${JSON.stringify(method)},headers:{Authorization:'Bearer '+localStorage.getItem('buildandhire.accessToken'),'Content-Type':'application/json'},${body === undefined ? '' : 'body:JSON.stringify(' + JSON.stringify(body) + '),'}});return {status:r.status,data:r.headers.get('Content-Type')?.includes('json')?await r.json():null}})()`); }
async function login(email, route) { await cdp.evaluate('localStorage.clear()'); await navigate('/'); await input('input[name="email"]', email); await input('input[name="password"]', password); await submit(); await wait(`location.pathname===${JSON.stringify(route)}`, 'login route ' + route); await wait(`!document.body.textContent.includes('Loading your workspace')`, 'workspace loaded'); }
async function signup(role, name, email) { await cdp.evaluate('localStorage.clear()'); await navigate('/signup'); await text('Create your account'); if (role === 'company') await click('I’m a company'); for (const [key, value] of Object.entries({ name, email, password, confirmPassword: password, ...(role === 'company' ? { registrationNumber: '1234567890', taxNumber: '0987654321' } : {}) })) await input(`[name="${key}"]`, value); await click('Continue'); await text('Your address'); for (const [key, value] of Object.entries({ streetAddress: '20 Browser Road', suburb: 'Gardens', city: 'Cape Town', province: 'Western Cape', postalCode: '8001' })) await input(`[name="${key}"]`, value); await click('Create account'); await text('Your account is registered.'); }
async function createProject(companyId, description) { await navigate('/my-jobs/new?companyId=' + companyId); await text('Your project brief'); await input('[name="jobDescription"]', description); await click('Continue'); await text('Dates & location'); const start = new Date(Date.now() + 86400000).toISOString().slice(0, 10), end = new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10); for (const [key, value] of Object.entries({ startDate: start, endDate: end, streetAddress: '22 Browser Road', suburb: 'Gardens', city: 'Cape Town', province: 'Western Cape', postalCode: '8001' })) await input(`[name="${key}"]`, value); await text('4 calendar days'); await click('Continue'); await text('One last look'); await click('Send project request'); await wait(`location.pathname.startsWith('/my-jobs/')&&!location.pathname.endsWith('/new')`, 'saved project route'); await text(description); return cdp.evaluate('location.pathname.split("/").at(-1)'); }

try {
  const profile = resolve(artifacts, 'profile-' + Date.now());
  browser = spawn(browserPath, ['--headless', '--disable-gpu', '--disable-background-mode', '--no-first-run', '--no-default-browser-check', '--window-size=1440,1400', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'ignore'] });
  let port; for (let i = 0; i < 150; i++) { try { port = (await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await delay(100); } }
  if (!port) throw new Error('Browser debug connection unavailable.');
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const socket = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r, reject) => { socket.addEventListener('open', r, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  cdp = new CDP(socket); await cdp.call('Page.enable'); await cdp.call('Runtime.enable');
  // Redirect configured API URLs to the test proxy; no response mocking or fixture data in the browser.
  await cdp.call('Page.addScriptToEvaluateOnNewDocument', { source: `const originalFetch=window.fetch.bind(window);window.fetch=(input,options)=>{const url=new URL(String(input),location.href);return originalFetch(url.pathname.startsWith('/api/')?url.pathname+url.search:input,options)};` });
  await navigate('/');
  await runWorkflow();
  if (errors.length) throw new Error('Browser runtime errors: ' + errors.join('\n'));
  await writeFile(resolve(artifacts, 'report.json'), JSON.stringify({ checks: reports.length, passed: reports, screenshots, errors, realApi: true, isolatedDatabase: true }, null, 2));
  console.log(`${reports.length} browser integration checks passed against the real isolated API.`);
} catch (error) {
  console.error(error.message);
  if (cdp) { await snapshot('failure').catch(() => {}); const state = await cdp.evaluate('({path:location.pathname,text:document.body.innerText})').catch(() => ({})); await writeFile(resolve(artifacts, 'failure-state.json'), JSON.stringify(state, null, 2)); }
  process.exitCode = 1;
} finally { cdp?.socket.close(); browser?.kill(); server.closeAllConnections(); await new Promise(r => server.close(r)); }

async function runWorkflow() {
  const suffix = Date.now().toString(36);
  const companyName = 'Browser Builders ' + suffix;
  const companyEmail = 'browser-company-' + suffix + '@example.test';
  const customerEmail = 'browser-customer-' + suffix + '@example.test';
  const otherEmail = 'browser-other-' + suffix + '@example.test';
  const assert = async (value, label) => check(JSON.stringify(Boolean(value)), label);
  const ready = () => wait(`!document.body.textContent.includes('Loading your workspace')&&!document.body.textContent.includes('Loading your project')`, 'data loaded');

  await signup('company', companyName, companyEmail);
  await check(`document.body.textContent.includes('awaiting administrator approval')`, 'company signup shows approval pending');
  await signup('customer', 'Browser Customer', customerEmail);
  await check(`document.body.textContent.includes('account is ready')`, 'customer signup creates an active account');
  await login(customerEmail, '/home');
  await snapshot('home');
  await navigate('/marketplace'); await wait(`!!document.querySelector('input.search')`, 'company list loaded');
  await check(`!document.body.textContent.includes(${JSON.stringify(companyName)})`, 'pending companies are absent from the marketplace');

  await login('superadmin@example.test', '/super-admin');
  await snapshot('super-admin-dashboard'); await snapshot('super-admin-dashboard-mobile', true);
  await click('Open admin portal'); await wait(`location.pathname==='/admin'&&!!document.querySelector('tbody')`, 'super admin accesses admin portal');
  await check(`location.pathname==='/admin'`, 'super admin can open normal admin routes');
  await input('input.search', companyName); await text(companyName); await click('Approve');
  await wait(`!!document.querySelector('[data-confirmation-dialog]')?.open`, 'approval confirmation opens');
  await snapshot('confirmation-approval'); await snapshot('confirmation-approval-mobile', true);
  await click('Cancel', `document.querySelector('[data-confirmation-dialog]')`);
  await wait(`!document.querySelector('[data-confirmation-dialog]')`, 'approval cancelled');
  await check(`document.querySelector('tbody tr').textContent.includes('Pending')`, 'cancelling confirmation leaves company pending');
  await confirmAction('Approve');
  await wait(`!!document.querySelector('tbody tr')&&document.querySelector('tbody tr').textContent.includes('Active')`, 'company approval saved');
  const firms = await apiRead('/Companies');
  const companyId = firms.data.find(c => c.companyName === companyName).companyId;
  await assert(firms.data.find(c => c.companyId === companyId).status === 0, 'company approval persists in the real API');
  await snapshot('admin-portal'); await snapshot('admin-portal-mobile', true);

  await login(customerEmail, '/home');
  await navigate('/marketplace'); await wait(`!!document.querySelector('input.search')`, 'marketplace loaded');
  await input('input.search', companyName); await text(companyName); await snapshot('marketplace'); await snapshot('marketplace-mobile', true);
  await click('View company'); await text(companyName); await snapshot('company-profile'); await snapshot('company-profile-mobile', true);
  await click('Request a project'); await text('Your project brief'); await snapshot('create-job'); await snapshot('create-job-mobile', true);
  const jobId = await createProject(companyId, 'Browser kitchen renovation');
  await check(`document.body.textContent.includes('Requested')`, 'new project displays Requested');
  const firstJob = await apiRead('/Jobs/' + jobId);
  await assert(firstJob.data.status === 4 && firstJob.data.quote === 0, 'new project uses the server-owned status and no customer quote');
  await navigate('/my-jobs/' + jobId); await text('Browser kitchen renovation');
  await check(`document.body.textContent.includes('Requested')`, 'requested project persists after reload');
  const secondId = await createProject(companyId, 'Browser patio paving');
  await snapshot('customer-project-details');
  await navigate('/my-jobs'); await text('Browser kitchen renovation'); await snapshot('customer-dashboard');

  await login(companyEmail, '/company/jobs'); await text('Browser kitchen renovation');
  await snapshot('company-jobs'); await snapshot('company-jobs-mobile', true);
  await navigate('/company/workforce'); await ready(); await click('Add worker');
  await input('[name="workerFirstName"]', 'Neo'); await input('[name="workerLastName"]', 'Molefe'); await submit();
  await wait(`!document.querySelector('[role="dialog"]')&&document.body.textContent.includes('Neo Molefe')`, 'worker saved');
  let worker = (await apiRead('/Workers')).data.find(w => w.workerFirstName === 'Neo');
  await assert(worker.jobId === null && worker.companyId === companyId, 'worker can be created without a job and has company ownership');
  await click('Assign'); await check(`document.querySelector('select[name="jobId"]').options.length===1`, 'requested jobs cannot receive worker assignments');
  await click('Cancel', `document.querySelector('[role="dialog"]')`);

  await navigate('/company/applications'); await text('Browser kitchen renovation');
  await snapshot('company-applications'); await snapshot('company-applications-mobile', true);
  await navigate('/company/jobs/' + jobId); await text('Review this request'); await confirmAction('Accept request'); await text('Send a quote');
  await input('[name="quote"]', '24800'); await confirmAction('Send quote'); await text('Await customer acceptance');
  await check(`!document.querySelector('button')||![...document.querySelectorAll('button')].some(b=>b.textContent.includes('Start work'))`, 'work cannot start before customer quote consent');
  await snapshot('company-job-management'); await snapshot('company-job-management-mobile', true);
  await navigate('/company/workforce'); await text('Neo Molefe'); await click('Assign'); await input('[name="jobId"]', jobId); await submit();
  await wait(`!document.querySelector('[role="dialog"]')&&document.body.textContent.includes('Browser kitchen renovation')`, 'assignment saved');
  worker = (await apiRead('/Workers')).data.find(w => w.workerId === worker.workerId);
  await assert(worker.jobId === jobId, 'assignment to an accepted job persists');
  await click('Edit'); await input('[name="workerFirstName"]', 'Neo Edited'); await submit(); await text('Neo Edited Molefe');
  worker = (await apiRead('/Workers')).data.find(w => w.workerId === worker.workerId);
  await assert(worker.workerFirstName === 'Neo Edited' && worker.jobId === jobId, 'worker names can be edited without changing assignment');
  await navigate('/company/jobs/' + secondId); await text('Review this request'); await confirmAction('Accept request'); await text('Send a quote');
  await navigate('/company/workforce'); await text('Neo Edited Molefe'); await click('Change job'); await input('[name="jobId"]', secondId); await submit();
  await wait(`!document.querySelector('[role="dialog"]')&&document.body.textContent.includes('Browser patio paving')`, 'reassignment saved');
  await assert((await apiRead('/Workers')).data.find(w => w.workerId === worker.workerId).jobId === secondId, 'worker can be reassigned to another accepted job');
  await click('Change job'); await input('[name="jobId"]', ''); await submit(); await wait(`!document.querySelector('[role="dialog"]')`, 'unassignment saved');
  await assert((await apiRead('/Workers')).data.find(w => w.workerId === worker.workerId).jobId === null, 'unassignment preserves the worker record');
  await click('Assign'); await input('[name="jobId"]', jobId); await submit(); await wait(`!document.querySelector('[role="dialog"]')`, 'assignment restored');
  await snapshot('company-workforce'); await snapshot('company-workforce-mobile', true);

  await login(customerEmail, '/home'); await navigate('/quotes/' + jobId); await text('Accept quote');
  await check(`document.querySelector('input[type="checkbox"]')&&!document.querySelector('input[type="checkbox"]').checked&&[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Accept quote')).disabled`, 'customer must explicitly agree to the displayed quote');
  await cdp.evaluate(`document.querySelector('input[type="checkbox"]').click()`); await click('Accept quote'); await text('Submit simulated payment');
  await check(`document.body.textContent.includes('No money moves')`, 'payment form explicitly remains a simulation');
  await input('#demo-reference', 'BROWSER-DEMO'); await click('Submit simulated payment'); await text('pending review');
  await check(`![...document.querySelectorAll('button')].some(b=>b.textContent.includes('Submit simulated'))`, 'duplicate simulated payment control disappears after saving');
  await navigate('/quotes/' + jobId); await text('pending review');
  await check(`![...document.querySelectorAll('button')].some(b=>b.textContent.includes('Submit simulated'))`, 'pending simulated payment persists after reload');
  const pendingJob = (await apiRead('/Jobs/' + jobId)).data;
  await assert(pendingJob.paymentStatus === 1 && pendingJob.amountPaid === 0 && pendingJob.quote === 24800 && !!pendingJob.quoteAcceptedAt, 'pending payment uses the accepted quote and does not count as paid');
  await snapshot('quote-review');

  await login(companyEmail, '/company/jobs'); await navigate('/company/jobs/' + jobId); await text('Ready to start work');
  await confirmAction('Start work'); await text('Keep the work moving');
  await assert((await apiRead('/Jobs/' + jobId)).data.status === 6, 'company starts work only after customer agreement');
  await confirmAction('Complete project'); await text('Project closed');
  const completedJob = (await apiRead('/Jobs/' + jobId)).data;
  await assert(completedJob.status === 7 && completedJob.paymentStatus === 1 && completedJob.amountPaid === 0, 'completion does not mark the simulated payment successful');
  await assert((await apiRead('/Workers')).data.find(w => w.workerId === worker.workerId).jobId === null, 'completion releases assigned workers in the database');

  await login('superadmin@example.test', '/super-admin'); await navigate('/admin'); await text('Company account review');
  await click('Simulated payments'); await wait(`document.body.textContent.includes('BROWSER-DEMO')`, 'payment records loaded');
  await input('input.search', 'BROWSER-DEMO'); await click('Review'); await text('Record a demo outcome'); await confirmAction('Mark successful');
  await wait(`!document.querySelector('[role="dialog"]')&&document.body.textContent.includes('Successful')`, 'final simulated outcome saved');
  await check(`![...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Review')`, 'final simulated outcome cannot be reviewed again');
  await assert((await apiRead('/Payment')).data.filter(p => p.jobId === jobId).length === 1, 'only one payment record exists for the job');

  await navigate('/super-admin/admins'); await text('Administrator accounts'); await click('Add administrator');
  const adminEmail = 'browser-admin-' + suffix + '@example.test';
  await input('[name="userName"]', 'Browser Review Admin'); await input('[name="email"]', adminEmail); await input('[name="password"]', password); await submit(); await acceptConfirmation();
  await wait(`!document.querySelector('[role="dialog"]')&&document.body.textContent.includes('Browser Review Admin')`, 'admin created');
  await input('input.search', adminEmail); await click('Edit'); await check(`!document.querySelector('[name="password"]').required`, 'administrator password change is optional on edit');
  await input('[name="userName"]', 'Browser Renamed Admin'); await submit(); await acceptConfirmation(); await text('Browser Renamed Admin');
  await snapshot('admin-management'); await snapshot('admin-management-mobile', true);
  await confirmAction('Deactivate'); await wait(`document.querySelector('tbody tr')?.textContent.includes('Inactive')`, 'admin deactivated');
  await confirmAction('Restore'); await wait(`document.querySelector('tbody tr')?.textContent.includes('Active')`, 'admin restored');
  await assert((await apiRead('/Admin')).data.some(a => a.email === adminEmail && a.userName === 'Browser Renamed Admin' && a.status === 0), 'administrator create/edit/status changes persist');
  await confirmAction('Delete'); await wait(`!document.body.textContent.includes('Browser Renamed Admin')`, 'admin removed');
  await assert(!(await apiRead('/Admin')).data.some(a => a.email === adminEmail), 'administrator deletion persists');

  for (const [email, route, owner] of [[customerEmail, '/home', 'customer'], [companyEmail, '/company/jobs', 'company']]) {
    await login(email, route);
    const saved = (await apiRead('/Jobs/' + jobId)).data;
    await assert(saved.status === 7 && saved.paymentStatus === 2 && saved.amountPaid === 24800 && saved.quote === 24800, owner + ' sees matching completed job, successful simulation and amount');
    await navigate(owner === 'customer' ? '/my-jobs/' + jobId : '/company/jobs/' + jobId);
    await text('Successful'); await check(`document.body.textContent.includes('Completed')`, owner + ' screen displays saved lifecycle and payment outcome');
  }

  await signup('customer', 'Unrelated Browser Customer', otherEmail); await login(otherEmail, '/home');
  await navigate('/my-jobs/' + jobId); await text('Project not found');
  await check(`!document.body.textContent.includes('Browser kitchen renovation')`, 'unrelated customer cannot see project details');
  await navigate('/quotes/' + jobId); await text('Quote not found');
  await check(`!document.querySelector('input[type="checkbox"]')`, 'unrelated customer cannot accept the quote or simulate payment');

  await login(companyEmail, '/company/jobs'); await navigate('/company/jobs/' + secondId); await text('Send a quote'); await input('[name="quote"]', '1000'); await confirmAction('Send quote'); await text('Await customer acceptance');
  await login(customerEmail, '/home'); await navigate('/quotes/' + secondId); await text('Accept quote');
  await navigate('/my-jobs/' + secondId); await text('Cancel project'); await confirmAction('Cancel project', 'Cancel project'); await text('Cancelled');
  await assert((await apiRead('/Jobs/' + secondId)).data.status === 8, 'customer cancellation retains the job with Cancelled status');
  const rejectedId = await createProject(companyId, 'Browser rejected project');
  await login(companyEmail, '/company/jobs'); await navigate('/company/jobs/' + rejectedId); await text('Review this request'); await confirmAction('Reject'); await text('Project closed');
  await assert((await apiRead('/Jobs/' + rejectedId)).data.status === 9, 'company rejection persists separately from cancellation');
  await cdp.evaluate(`localStorage.setItem('buildandhire.accessToken','expired-integration-session')`); await navigate('/company/jobs');
  await wait(`location.pathname==='/'&&localStorage.getItem('buildandhire.accessToken')===null`, 'expired session redirected');
  await check(`location.pathname==='/'`, 'API 401 clears expired session and returns to unchanged login');

  await login(customerEmail, '/home');
  for (const [path, name, expected] of [['/home', 'home-mobile', 'A better space.'], ['/my-jobs', 'customer-dashboard-mobile', 'Browser kitchen renovation'], ['/quotes/' + jobId, 'quote-review-mobile', 'Successful'], ['/my-jobs/' + jobId, 'customer-project-details-mobile', 'Completed'], ['/missing-page', 'not-found', 'This page isn’t on the plan.'], ['/signup', 'signup', 'Create your account']]) {
    await navigate(path); await text(expected); await snapshot(name, name.endsWith('-mobile')); if (!name.endsWith('-mobile')) await snapshot(name + '-mobile', true);
  }
  await assert(screenshots.filter(name => !name.endsWith('-mobile')).length >= 16, 'all sixteen redesigned pages were rendered in the real application');
}
