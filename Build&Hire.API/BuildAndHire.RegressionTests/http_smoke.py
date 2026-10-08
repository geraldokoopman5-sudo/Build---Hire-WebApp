"""Run against a locally running HTTPS API; no database records are created."""
import json
import sys
import urllib.error
import urllib.request

base = sys.argv[1] if len(sys.argv) > 1 else 'https://localhost:7172'

def request(path, method='GET', body=None, headers=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(base + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json', **(headers or {})})
    try:
        response = urllib.request.urlopen(req, timeout=10)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()

status, headers, _ = request('/api/Customer', 'OPTIONS', headers={
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,authorization',
})
assert status == 204 and headers.get('Access-Control-Allow-Origin') == 'http://localhost:5173'
print('PASS: HTTPS CORS preflight succeeds without redirect')

_, headers, _ = request('/api/Customer', 'OPTIONS', headers={
    'Origin': 'https://untrusted.example', 'Access-Control-Request-Method': 'POST',
})
assert headers.get('Access-Control-Allow-Origin') is None
print('PASS: Unconfigured origin receives no CORS permission')

for path, expected_field in [('/api/Customer', 'Password'), ('/api/Companies', 'Password')]:
    status, headers, body = request(path, 'POST', {}, {'Origin': 'http://localhost:5173'})
    assert status == 400, (path, status)
    assert expected_field in json.loads(body)['errors'], (path, body)
    assert headers.get('Access-Control-Allow-Origin') == 'http://localhost:5173'
    print(f'PASS: {path} returns validation errors with CORS headers')

status, _, _ = request('/api/Payment/eft', 'POST', {})
assert status == 401
print('PASS: Simulated EFT requests require a valid token')

status, _, _ = request('/api/Jobs')
assert status == 401
print('PASS: Jobs require a valid token')
status, _, body = request('/swagger/v1/swagger.json')
assert status == 200
schemas = json.loads(body)['components']['schemas']
assert 'workerLastName' in schemas['WorkerDto']['properties']
assert 'passwordHash' not in schemas['CustomerDto']['properties']
assert 'quote' in schemas['JobDto']['properties']
print('PASS: OpenAPI exposes corrected names without password hashes')
