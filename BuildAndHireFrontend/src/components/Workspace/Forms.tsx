import type { ChangeEvent, ReactNode } from 'react';
import { provinces, type AddressFields } from '../../utils/workspaceForms';
export function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) { return <label className={`field ${full ? 'full' : ''}`}><span>{label}</span>{children}</label>; }
export function AddressForm({ values, onChange }: { values: AddressFields; onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }) {
  return <div className="formgrid"><Field label="Street address" full><input name="streetAddress" value={values.streetAddress} onChange={onChange} required autoComplete="street-address" /></Field>
    <Field label="Suburb"><input name="suburb" value={values.suburb} onChange={onChange} required /></Field><Field label="City"><input name="city" value={values.city} onChange={onChange} required autoComplete="address-level2" /></Field>
    <Field label="Province"><select name="province" value={values.province} onChange={onChange} required><option value="">Select a province</option>{provinces.map(p => <option key={p}>{p}</option>)}</select></Field>
    <Field label="Postal code"><input name="postalCode" value={values.postalCode} onChange={onChange} required pattern="[0-9]{4}" maxLength={4} inputMode="numeric" autoComplete="postal-code" /></Field></div>;
}
