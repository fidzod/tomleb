import { users } from './db/schema';

export type Variables = {
    user: typeof users.$inferSelect;
};
