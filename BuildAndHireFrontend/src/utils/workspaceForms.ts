export const provinces = ['Western Cape', 'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];
export interface AddressFields { streetAddress: string; suburb: string; city: string; province: string; postalCode: string; }
export const emptyAddress: AddressFields = { streetAddress: '', suburb: '', city: '', province: '', postalCode: '' };
export function addressPayload(values: AddressFields) { return { streetAddress: values.streetAddress.trim(), suburb: values.suburb.trim(), city: values.city.trim(), province: values.province, postalCode: Number(values.postalCode) }; }
