const Media = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media'
  },
  admin: { useAsTitle: 'filename' },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true
    }
  ]
};

export default Media;
