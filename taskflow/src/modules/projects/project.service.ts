import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import { normalizePagination, buildPaginatedResponse, PaginationInput } from '../../utils/pagination';
import { CreateProjectInput, UpdateProjectInput } from './project.schema';

export async function listProjects(orgId: string, pagination: PaginationInput) {
  const { skip, take, page, limit } = normalizePagination(pagination);

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where: { orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.project.count({ where: { orgId, deletedAt: null } })
  ]);

  return buildPaginatedResponse(projects, total, { skip, take, page, limit });
}

export async function getProject(orgId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId, deletedAt: null }
  });
  if (!project) {
    throw new NotFoundError('Project', 'PROJECT_NOT_FOUND');
  }
  return project;
}

export async function createProject(orgId: string, input: CreateProjectInput) {
  return prisma.project.create({
    data: { orgId, name: input.name, description: input.description }
  });
}

export async function updateProject(orgId: string, projectId: string, input: UpdateProjectInput) {
  await getProject(orgId, projectId);
  return prisma.project.update({
    where: { id: projectId },
    data: input
  });
}

export async function deleteProject(orgId: string, projectId: string) {
  await getProject(orgId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
}

export async function getProjectDashboard(orgId: string, projectId: string) {
  await getProject(orgId, projectId);

  const counts = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId, deletedAt: null },
    _count: { _all: true }
  });

  const statusCounts: Record<string, number> = {
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0
  };
  for (const row of counts) {
    statusCounts[row.status] = row._count._all;
  }

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return { projectId, total, byStatus: statusCounts };
}
