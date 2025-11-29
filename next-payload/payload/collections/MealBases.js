const weightUnits = [
  { label: 'Ounces', value: 'oz' },
  { label: 'Grams', value: 'g' },
  { label: 'Pounds', value: 'lb' },
  { label: 'Kilograms', value: 'kg' },
  { label: 'Serving', value: 'serving' }
];

const MealBases = {
  slug: 'meal-bases',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'basePrice', type: 'number', required: true },
    { name: 'weight', type: 'number', defaultValue: 8 },
    { name: 'weightUnit', type: 'select', options: weightUnits, defaultValue: 'oz' },
    { name: 'foodType', type: 'text' },
    { name: 'useAutoCalculation', type: 'checkbox', defaultValue: true },
    { name: 'calories', type: 'number' },
    { name: 'protein', type: 'number' },
    { name: 'carbs', type: 'number' },
    { name: 'fat', type: 'number' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'isActive', type: 'checkbox', defaultValue: true }
  ],
  access: { read: () => true }
};

export default MealBases;
