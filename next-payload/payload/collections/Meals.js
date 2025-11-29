const weightUnits = [
  { label: 'Ounces', value: 'oz' },
  { label: 'Grams', value: 'g' },
  { label: 'Pounds', value: 'lb' },
  { label: 'Kilograms', value: 'kg' },
  { label: 'Serving', value: 'serving' }
];

const Meals = {
  slug: 'meals',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'ingredients', type: 'textarea' },
    { name: 'price', type: 'number', required: true },
    { name: 'totalWeight', type: 'number', defaultValue: 0 },
    { name: 'weightUnit', type: 'select', options: weightUnits, defaultValue: 'oz' },
    { name: 'useAutoCalculation', type: 'checkbox', defaultValue: true },
    { name: 'nutritionalInfo', type: 'textarea' },
    { name: 'calories', type: 'number' },
    { name: 'protein', type: 'number' },
    { name: 'carbs', type: 'number' },
    { name: 'fat', type: 'number' },
    { name: 'fiber', type: 'number' },
    { name: 'sugar', type: 'number' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'meal-categories',
      hasMany: true
    },
    {
      name: 'dietaryTags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
      admin: { description: 'e.g., gluten-free, dairy-free' }
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' }
      ]
    },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'availableFrom', type: 'date' },
    { name: 'availableUntil', type: 'date' },
    { name: 'preparationTime', type: 'number', admin: { description: 'Minutes' } },
    { name: 'servingSize', type: 'text' },
    {
      name: 'relatedMeals',
      type: 'relationship',
      relationTo: 'meals',
      hasMany: true
    }
  ],
  access: { read: () => true }
};

export default Meals;
