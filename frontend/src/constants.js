export const PLACEHOLDER_IMAGE = '/pet-placeholder.svg';

export const PET_TYPES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'];
export const PET_GENDERS = ['Male', 'Female', 'Other'];
export const PET_STATUSES = ['available', 'pending', 'adopted'];

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}
