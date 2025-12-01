import type { CollectionSlug, File, GlobalSlug, Payload, PayloadRequest } from 'payload'

type CreatedDoc<T> = T & { id: number | string }

const placeholderPNGBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const collectionsToClear: CollectionSlug[] = [
  'meal-categories',
  'dietary-tags',
  'meal-bases',
  'customization-categories',
  'customization-options',
  'meals',
  'meal-plans',
  'testimonials',
  'media',
  'pages',
]

const globalsToClear: GlobalSlug[] = ['header', 'footer']

const makeFile = (name: string): File => {
  const data = Buffer.from(placeholderPNGBase64, 'base64')
  return {
    name,
    data,
    mimetype: 'image/png',
    size: data.byteLength,
  }
}

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding Sprezza sample data...')

  // Clear selected globals (site-settings is handled with final data below to satisfy required fields)
  await Promise.all(
    globalsToClear.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {},
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  // Clear selected collections (and versions if enabled)
  for (const collection of collectionsToClear) {
    if (payload.collections[collection]) {
      await payload.db.deleteMany({ collection, req, where: {} })
      if (payload.collections[collection].config.versions) {
        await payload.db.deleteVersions({ collection, req, where: {} })
      }
    }
  }

  payload.logger.info('— Creating media')
  const [heroImage, mealImage, testimonialPhoto] = await Promise.all([
    payload.create({
      collection: 'media',
      data: { alt: 'Hero placeholder' },
      file: makeFile('hero.png'),
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Meal placeholder' },
      file: makeFile('meal.png'),
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Customer portrait placeholder' },
      file: makeFile('testimonial.png'),
    }),
  ])

  payload.logger.info('— Creating meal categories')
  const [bowlsCategory, tacosCategory] = await Promise.all([
    payload.create({
      collection: 'meal-categories',
      data: {
        title: 'Bowls',
        description: 'Hearty bowls built for protein-first eaters.',
        slug: 'bowls',
        isFeatured: true,
        displayOrder: 1,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'meal-categories',
      data: {
        title: 'Tacos',
        description: 'Street-style tacos with Scottsdale flair.',
        slug: 'tacos',
        isFeatured: true,
        displayOrder: 2,
      },
    }) as Promise<CreatedDoc<any>>,
  ])

  payload.logger.info('— Creating dietary tags')
  const [highProteinTag, glutenFreeTag] = await Promise.all([
    payload.create({
      collection: 'dietary-tags',
      data: {
        name: 'High Protein',
        description: 'High in protein content',
        slug: 'high-protein',
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'dietary-tags',
      data: {
        name: 'Gluten Free',
        description: 'No gluten-containing ingredients',
        slug: 'gluten-free',
      },
    }) as Promise<CreatedDoc<any>>,
  ])

  payload.logger.info('— Creating meal bases')
  const [cilantroRiceBase] = await Promise.all([
    payload.create({
      collection: 'meal-bases',
      data: {
        name: 'Cilantro Lime Rice',
        slug: 'cilantro-lime-rice',
        description: 'Jasmine rice with citrus and herbs.',
        basePrice: 0,
        weight: 200,
        weightUnit: 'g',
        foodType: 'jasmine rice',
        nutrition: { calories: 260, carbs: 55, protein: 5, fat: 2 },
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'meal-bases',
      data: {
        name: 'Cauliflower Rice',
        slug: 'cauliflower-rice',
        description: 'Low-carb cauliflower rice sautéed with garlic.',
        basePrice: 1.5,
        weight: 200,
        weightUnit: 'g',
        foodType: 'cauliflower rice',
        nutrition: { calories: 80, carbs: 12, protein: 5, fat: 3 },
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
  ])

  payload.logger.info('— Creating customization categories')
  const [proteinCategory, toppingsCategory, sauceCategory] = await Promise.all([
    payload.create({
      collection: 'customization-categories',
      data: {
        name: 'Protein',
        slug: 'protein',
        displayOrder: 1,
        minSelections: 1,
        maxSelections: 1,
        isRequired: true,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'customization-categories',
      data: {
        name: 'Toppings',
        slug: 'toppings',
        displayOrder: 2,
        minSelections: 0,
        maxSelections: 3,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'customization-categories',
      data: {
        name: 'Sauce',
        slug: 'sauce',
        displayOrder: 3,
        minSelections: 0,
        maxSelections: 2,
      },
    }) as Promise<CreatedDoc<any>>,
  ])

  payload.logger.info('— Creating customization options')
  const [] = await Promise.all([
    payload.create({
      collection: 'customization-options',
      data: {
        name: 'Smoky Chicken',
        slug: 'smoky-chicken',
        category: proteinCategory.id,
        priceAdjustment: 0,
        weight: 140,
        weightUnit: 'g',
        nutrition: { calories: 220, protein: 40, fat: 6, carbs: 0 },
        isDefault: true,
        isActive: true,
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'customization-options',
      data: {
        name: 'Carne Asada',
        slug: 'carne-asada',
        category: proteinCategory.id,
        priceAdjustment: 2,
        weight: 140,
        weightUnit: 'g',
        nutrition: { calories: 250, protein: 36, fat: 10, carbs: 0 },
        isActive: true,
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'customization-options',
      data: {
        name: 'Pico de Gallo',
        slug: 'pico',
        category: toppingsCategory.id,
        priceAdjustment: 0,
        weight: 40,
        weightUnit: 'g',
        nutrition: { calories: 10, carbs: 2 },
        isDefault: true,
        isActive: true,
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'customization-options',
      data: {
        name: 'Charred Corn',
        slug: 'charred-corn',
        category: toppingsCategory.id,
        priceAdjustment: 0.5,
        weight: 40,
        weightUnit: 'g',
        nutrition: { calories: 30, carbs: 7, protein: 1 },
        isActive: true,
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'customization-options',
      data: {
        name: 'Chipotle Crema',
        slug: 'chipotle-crema',
        category: sauceCategory.id,
        priceAdjustment: 0.5,
        weight: 30,
        weightUnit: 'g',
        nutrition: { calories: 45, fat: 4, carbs: 2 },
        isActive: true,
        image: mealImage.id,
      },
    }) as Promise<CreatedDoc<any>>,
  ])

  payload.logger.info('— Creating meals')
  const [smokyChickenBowl, carneAsadaTacos] = await Promise.all([
    payload.create({
      collection: 'meals',
      data: {
        title: 'Smoky Chicken Bowl',
        slug: 'smoky-chicken-bowl',
        summary: 'High-protein bowl with cilantro lime rice and bright toppings.',
        categories: [bowlsCategory.id],
        dietaryTags: [highProteinTag.id],
        mealBase: cilantroRiceBase.id,
        customizationCategories: [proteinCategory.id, toppingsCategory.id, sauceCategory.id],
        price: 12.99,
        prepTimeMinutes: 12,
        servings: 1,
        flags: { isFeatured: true, isActive: true },
        nutrition: { calories: 520, protein: 44, carbs: 50, fat: 16 },
        media: { image: mealImage.id },
      },
    }) as Promise<CreatedDoc<any>>,
    payload.create({
      collection: 'meals',
      data: {
        title: 'Carne Asada Tacos',
        slug: 'carne-asada-tacos',
        summary: 'Three street tacos with citrus-marinated steak.',
        categories: [tacosCategory.id],
        dietaryTags: [glutenFreeTag.id],
        price: 14.5,
        prepTimeMinutes: 10,
        servings: 1,
        flags: { isFeatured: true, isActive: true },
        nutrition: { calories: 600, protein: 38, carbs: 48, fat: 24 },
        media: { image: mealImage.id },
      },
    }) as Promise<CreatedDoc<any>>,
  ])

  payload.logger.info('— Creating meal plans')
  await payload.create({
    collection: 'meal-plans',
    data: {
      title: 'Weekly Fuel Plan',
      slug: 'weekly-fuel-plan',
      tagline: 'Five meals for busy Scottsdale weeks.',
      schedule: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      isFeatured: true,
      isActive: true,
      items: [
        {
          dayOfWeek: 'monday',
          mealTime: 'lunch',
          meal: smokyChickenBowl.id,
          displayOrder: 1,
        },
        {
          dayOfWeek: 'wednesday',
          mealTime: 'dinner',
          meal: carneAsadaTacos.id,
          displayOrder: 2,
        },
      ],
      image: mealImage.id,
    },
  })

  payload.logger.info('— Creating testimonials')
  await payload.create({
    collection: 'testimonials',
    data: {
      name: 'Taylor R.',
      role: 'Arcadia',
      quote: 'Sprezza keeps my macros on point and tastes like a night out.',
      displayOrder: 1,
      photo: testimonialPhoto.id,
    },
  })

  payload.logger.info('— Updating globals')
  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Home', url: '/' } },
          { link: { type: 'custom', label: 'Meals', url: '/shop' } },
          { link: { type: 'custom', label: 'Plans', url: '/shop?category=plans' } },
        ],
      },
      depth: 0,
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Admin', url: '/admin' } },
          { link: { type: 'custom', label: 'Find Order', url: '/find-order' } },
        ],
      },
      depth: 0,
    }),
    payload.updateGlobal({
      slug: 'site-settings',
      data: {
        heroTitle: 'Chef-prepped meals, Scottsdale fresh.',
        heroSubtitle: 'Rotating weekly menus, custom bowls, and doorstep delivery.',
        heroCtaLabel: 'Browse meals',
        heroCtaHref: '/shop',
        heroImage: heroImage.id,
        howItWorks: [
          { title: 'Pick your lineup', description: 'Meals and plans drop weekly.' },
          { title: 'Customize', description: 'Protein-first builds with sauces and sides.' },
          { title: 'We deliver', description: 'Scottsdale-only delivery windows.' },
        ],
        faq: [
          {
            question: 'Do you deliver outside Scottsdale?',
            answer: 'We currently deliver within Scottsdale city limits.',
          },
          {
            question: 'Are meals gluten free?',
            answer: 'We mark GF options and avoid cross-contamination where possible.',
          },
        ],
        contactEmail: 'hello@sprezza.com',
        contactPhone: '480-555-1234',
      },
      depth: 0,
    }),
  ])

  payload.logger.info('Seeded Sprezza sample data successfully.')
}
