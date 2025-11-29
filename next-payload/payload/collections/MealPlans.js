const days = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' }
];

const times = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' }
];

const MealPlans = {
  slug: 'meal-plans',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'dayOfWeek', type: 'select', options: days, required: true },
        { name: 'mealTime', type: 'select', options: times, required: true },
        { name: 'meal', type: 'relationship', relationTo: 'meals', required: true },
        { name: 'displayOrder', type: 'number', defaultValue: 0 }
      ]
    }
  ],
  access: { read: () => true }
};

export default MealPlans;
