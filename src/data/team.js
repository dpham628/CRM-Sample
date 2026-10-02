// Mock internal directory: the rep (the app's current user) plus the people
// follow-up tasks can be handed off or escalated to. `aliases` are the
// lowercase phrases extract-tasks.js matches against transcript text.

export const CURRENT_REP_ID = 'rep-you';

export const team = [
  {
    id: CURRENT_REP_ID,
    name: 'You',
    role: 'Account Executive',
    department: 'Sales',
    email: 'you@crm.example.com',
    managerId: 'mgr-sam',
    aliases: [],
  },
  {
    id: 'mgr-sam',
    name: 'Sam Chen',
    role: 'Sales Manager',
    department: 'Sales',
    email: 'sam.chen@crm.example.com',
    managerId: null,
    aliases: ['my manager', 'sales manager', 'manager', 'sam'],
  },
  {
    id: 'legal-priya',
    name: 'Priya Nair',
    role: 'Legal Counsel',
    department: 'Legal',
    email: 'priya.nair@crm.example.com',
    managerId: null,
    aliases: ['legal team', 'legal department', 'legal', 'priya'],
  },
  {
    id: 'billing-maria',
    name: 'Maria Lopez',
    role: 'Billing Manager',
    department: 'Billing',
    email: 'maria.lopez@crm.example.com',
    managerId: null,
    aliases: ['billing manager', 'billing department', 'billing team', 'billing', 'maria'],
  },
  {
    id: 'csm-alex',
    name: 'Alex Rivera',
    role: 'Customer Success Manager',
    department: 'Customer Success',
    email: 'alex.rivera@crm.example.com',
    managerId: 'mgr-sam',
    aliases: ['customer success manager', 'customer success', 'csm', 'alex'],
  },
];

export const findTeamMember = (id) => team.find((member) => member.id === id);

export const currentRep = findTeamMember(CURRENT_REP_ID);

// Escalations with no explicit target default to the rep's manager.
export const repManager = findTeamMember(currentRep.managerId);
