import { faker } from '@faker-js/faker';

const CATEGORIES = ['Web Development', 'Mobile App', 'E-commerce', 'SaaS', 'API', 'Cloud', 'AI/ML', 'Design'];
const SERVICES = [
    'Frontend Development',
    'Backend Development',
    'Full-Stack Development',
    'UI/UX Design',
    'API Development',
    'Cloud Architecture',
    'Database Design',
    'DevOps',
    'Security Audit',
    'Performance Optimization',
];
const COLORS = ['blue', 'purple', 'emerald', 'amber', 'rose', 'cyan'];

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function createProject(overrides = {}) {
    const title = faker.helpers.arrayElement([
        'Enterprise Dashboard',
        'E-commerce Platform',
        'Mobile Banking App',
        'Healthcare Portal',
        'Real Estate Platform',
        'Social Media App',
        'SaaS Analytics',
        'Booking System',
        'Inventory Management',
        'Learning Platform',
    ]);
    const client = faker.company.name();
    
    return {
        id: faker.string.uuid(),
        slug: generateSlug(`${title}-${client}`),
        client,
        title,
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement(CATEGORIES),
        image: faker.image.url({ width: 800, height: 600 }),
        services: faker.helpers.arrayElements(SERVICES, { min: 2, max: 4 }),
        stats: {
            users: faker.number.int({ min: 100, max: 100000 }),
            uptime: faker.number.float({ min: 99.5, max: 99.99, fractionDigits: 2 }),
            performance: faker.number.int({ min: 85, max: 100 }),
        },
        color: faker.helpers.arrayElement(COLORS),
        year: faker.date.past({ years: 2 }).getFullYear().toString(),
        featured: faker.datatype.boolean({ probability: 0.2 }),
        created_at: faker.date.past({ years: 1 }).toISOString(),
        ...overrides,
    };
}

export function createFeaturedProject(overrides = {}) {
    return createProject({ featured: true, ...overrides });
}

export function createProjectBatch(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => createProject(overrides));
}
