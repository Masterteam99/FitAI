import { prisma } from "./prisma";
import type { AdminActionType, Prisma } from "@/generated/prisma";

export async function logAdminAction(args: {
  actorId: string;
  actorEmail: string;
  action: AdminActionType;
  targetType: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        actorId: args.actorId,
        actorEmail: args.actorEmail,
        action: args.action,
        targetType: args.targetType,
        targetId: args.targetId,
        payload: (args.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[admin-audit] failed to log action", { action: args.action, err });
  }
}
