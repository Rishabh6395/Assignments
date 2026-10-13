import { createEmailWorker, createDeadLetterRouter } from './queues/email.worker';

console.log('TaskFlow worker starting...');

const worker = createEmailWorker();
const deadLetterRouter = createDeadLetterRouter();

console.log('Worker is listening for jobs on "email-notifications"');

async function shutdown() {
  console.log('Worker shutting down...');
  await worker.close();
  await deadLetterRouter.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
