export function slotPeople(slot = {}) {
  if (!slot) return [];
  if (Array.isArray(slot.staff)) return slot.staff;
  return [
    ...(slot.teacher ? [{ name: slot.teacher, role: 'teacher' }] : []),
    ...(slot.ta ? [{ name: slot.ta, role: 'ta' }] : []),
  ];
}

export function staffNames(staff, role) {
  return staff.filter(person => person.role === role).map(person => person.name).join(', ');
}
