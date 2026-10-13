import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.comment.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const acme = await prisma.organization.create({ data: { name: 'Acme Corp' } });
  const globex = await prisma.organization.create({ data: { name: 'Globex Inc' } });

  const [alice, bob, carol, dave, erin] = await Promise.all([
    prisma.user.create({ data: { email: 'alice@acme.test', name: 'Alice Admin', passwordHash } }),
    prisma.user.create({ data: { email: 'bob@acme.test', name: 'Bob Builder', passwordHash } }),
    prisma.user.create({ data: { email: 'carol@acme.test', name: 'Carol Coder', passwordHash } }),
    prisma.user.create({ data: { email: 'dave@globex.test', name: 'Dave Director', passwordHash } }),
    prisma.user.create({ data: { email: 'erin@globex.test', name: 'Erin Engineer', passwordHash } })
  ]);

  await prisma.orgMember.createMany({
    data: [
      { userId: alice.id, orgId: acme.id, role: 'org_admin' },
      { userId: bob.id, orgId: acme.id, role: 'member' },
      { userId: carol.id, orgId: acme.id, role: 'member' },
      { userId: dave.id, orgId: globex.id, role: 'org_admin' },
      { userId: erin.id, orgId: globex.id, role: 'member' }
    ]
  });

  const website = await prisma.project.create({
    data: { orgId: acme.id, name: 'Website Redesign', description: 'Revamp the marketing site' }
  });
  const mobileApp = await prisma.project.create({
    data: { orgId: acme.id, name: 'Mobile App', description: 'iOS/Android companion app' }
  });
  const infra = await prisma.project.create({
    data: { orgId: globex.id, name: 'Infra Migration', description: 'Move to Kubernetes' }
  });

  const taskDefs = [
    { project: website, title: 'Design homepage hero section', status: 'done', priority: 'high' },
    { project: website, title: 'Implement responsive nav', status: 'in_progress', priority: 'medium' },
    { project: website, title: 'Set up analytics tracking', status: 'todo', priority: 'low' },
    { project: website, title: 'Write copy for pricing page', status: 'review', priority: 'medium' },
    { project: website, title: 'Fix Safari layout bug', status: 'todo', priority: 'urgent' },
    { project: mobileApp, title: 'Scaffold React Native project', status: 'done', priority: 'high' },
    { project: mobileApp, title: 'Build login screen', status: 'in_progress', priority: 'high' },
    { project: mobileApp, title: 'Push notification integration', status: 'todo', priority: 'medium' },
    { project: mobileApp, title: 'App store submission checklist', status: 'todo', priority: 'low' },
    { project: infra, title: 'Provision EKS cluster', status: 'in_progress', priority: 'urgent' },
    { project: infra, title: 'Migrate CI/CD pipelines', status: 'review', priority: 'high' },
    { project: infra, title: 'Write runbook for on-call', status: 'todo', priority: 'medium' }
  ] as const;

  const tasks = [];
  for (const def of taskDefs) {
    const task = await prisma.task.create({
      data: {
        projectId: def.project.id,
        title: def.title,
        description: `Auto-seeded task: ${def.title}`,
        status: def.status,
        priority: def.priority,
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }
    });
    tasks.push(task);
  }

  await prisma.taskAssignment.createMany({
    data: [
      { taskId: tasks[0].id, userId: bob.id },
      { taskId: tasks[1].id, userId: bob.id },
      { taskId: tasks[2].id, userId: carol.id },
      { taskId: tasks[3].id, userId: carol.id },
      { taskId: tasks[5].id, userId: bob.id },
      { taskId: tasks[6].id, userId: carol.id },
      { taskId: tasks[9].id, userId: erin.id },
      { taskId: tasks[10].id, userId: erin.id }
    ]
  });

  await prisma.comment.createMany({
    data: [
      { taskId: tasks[0].id, userId: alice.id, content: 'Looks great, ship it!' },
      { taskId: tasks[1].id, userId: bob.id, content: 'Blocked on design review.' },
      { taskId: tasks[4].id, userId: alice.id, content: 'This is breaking checkout, please prioritize.' },
      { taskId: tasks[9].id, userId: dave.id, content: 'What is the ETA on this?' },
      { taskId: tasks[10].id, userId: erin.id, content: 'Pipelines migrated for staging, prod next.' }
    ]
  });

  console.log('Seed complete:');
  console.log(`  Organizations: Acme Corp (${acme.id}), Globex Inc (${globex.id})`);
  console.log('  All seeded users have password: Password123!');
  console.log(`  Users: ${[alice, bob, carol, dave, erin].map((u) => u.email).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
