const MealCategories = {
  slug: 'meal-categories',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'text', admin: { description: 'Font Awesome class name or similar' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0 }
  ],
  access: { read: () => true }
};

export default MealCategories;
