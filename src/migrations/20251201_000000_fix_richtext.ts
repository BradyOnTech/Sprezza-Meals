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
}
