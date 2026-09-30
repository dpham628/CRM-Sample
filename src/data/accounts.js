export const accounts = [
  {
    id: '1',
    name: 'Rehema Armorer',
    company: 'Acme Corp',
    email: 'rehema@example.com',
    phoneNumber: '+15551234567',
    description: 'Senior Account Executive',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Jane Doe',
    company: 'Globex',
    email: 'jane.doe@example.com',
    phoneNumber: '+15559876543',
    description: 'Technical Support Manager',
    status: 'Inactive',
  },
  {
    id: '3',
    name: 'John Smith',
    company: 'Initech',
    email: 'john.smith@example.com',
    phoneNumber: '+15551112233',
    description: 'Solutions Architect',
    status: 'Active',
  }
];

export const findAccountById = (id) => accounts.find((account) => account.id === id);

export const findAccountByPhone = (phoneNumber) => {
  if (!phoneNumber) return undefined;
  const digits = String(phoneNumber).replace(/\D/g, '');
  return accounts.find((account) => account.phoneNumber.replace(/\D/g, '').endsWith(digits.slice(-10)));
};
