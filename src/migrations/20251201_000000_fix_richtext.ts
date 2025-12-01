import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

function convertProseMirrorToLexical(pm: any): any {
  // Simple converter for basic content
  if (pm.type === 'doc' && pm.content) {
    const children = pm.content
      .map((node: any) => {
        if (node.type === 'paragraph') {
          const textChildren = node.content
            ? node.content.map((textNode: any) => ({
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: textNode.text || '',
                type: 'text',
                version: 1,
              }))
            : []
          return {
            children: textChildren,
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          }
        }
        // Add more node types as needed
        return null
      })
      .filter(Boolean)
    return {
      root: {
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }
  return pm // if not ProseMirror, return as is
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Get meals with description
  const { rows: meals } = await db.execute(
    sql`SELECT id, description FROM meals WHERE description IS NOT NULL`,
  )

  for (const meal of meals) {
    if (
      meal.description &&
      typeof meal.description === 'object' &&
      (meal.description as any).type === 'doc'
    ) {
      const newDescription = convertProseMirrorToLexical(meal.description as any)
      await db.execute(
        sql`UPDATE meals SET description = ${JSON.stringify(newDescription)} WHERE id = ${meal.id}`,
      )
    }
  }

  // Drop version tables since versions are disabled
  await db.execute(sql`DROP TABLE IF EXISTS "_meals_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_meals_v_rels"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_meal_categories_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_dietary_tags_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_meal_bases_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_customization_categories_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_customization_options_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_meal_plans_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_meal_plans_v_rels"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_testimonials_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_site_settings_v"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_site_settings_v_version_how_it_works"`)
  await db.execute(sql`DROP TABLE IF EXISTS "_site_settings_v_version_faq"`)
}
