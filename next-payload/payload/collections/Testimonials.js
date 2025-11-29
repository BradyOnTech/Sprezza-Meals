const Testimonials = {
  slug: 'testimonials',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' }
  ],
  access: { read: () => true }
};

export default Testimonials;
