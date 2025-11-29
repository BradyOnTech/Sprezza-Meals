const Settings = {
  slug: 'site-settings',
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Sprezza' },
        { name: 'subtitle', type: 'textarea' },
        { name: 'ctaText', type: 'text', defaultValue: 'Order Now' },
        { name: 'ctaLink', type: 'text', defaultValue: '/meal-plans' },
        { name: 'image', type: 'upload', relationTo: 'media' }
      ]
    },
    {
      name: 'howItWorks',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'text', admin: { description: 'Icon class/name' } }
      ]
    },
    {
      name: 'faq',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true }
      ]
    }
  ]
};

export default Settings;
