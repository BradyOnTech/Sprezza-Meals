const weightUnits = [
  { label: 'Ounces', value: 'oz' },
  { label: 'Grams', value: 'g' },
  { label: 'Pounds', value: 'lb' },
  { label: 'Kilograms', value: 'kg' },
  { label: 'Cups', value: 'cup' },
  { label: 'Tablespoons', value: 'tbsp' },
  { label: 'Teaspoons', value: 'tsp' }
];

const CustomizationOptions = {
  slug: 'customization-options',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'customization-categories',
      required: true
    },
    { name: 'description', type: 'textarea' },
    { name: 'priceAdjustment', type: 'number', required: true, defaultValue: 0 },
    { name: 'weight', type: 'number', defaultValue: 0 },
    { name: 'weightUnit', type: 'select', options: weightUnits, defaultValue: 'oz' },
    {
      name: 'foodType',
      type: 'text',
      admin: { description: 'String for nutrition lookup (e.g., "chicken breast")' }
    },
    { name: 'useAutoCalculation', type: 'checkbox', defaultValue: true },
    { name: 'calories', type: 'number' },
    { name: 'protein', type: 'number' },
    { name: 'carbs', type: 'number' },
    { name: 'fat', type: 'number' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'isDefault', type: 'checkbox', defaultValue: false },
    { name: 'isActive', type: 'checkbox', defaultValue: true }
  ],
  access: { read: () => true }
};

export default CustomizationOptions;
