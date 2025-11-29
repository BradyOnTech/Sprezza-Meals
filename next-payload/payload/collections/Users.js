const Users = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
        { label: 'Ops', value: 'ops' }
      ],
      defaultValue: 'editor',
      required: true
    }
  ]
};

export default Users;
