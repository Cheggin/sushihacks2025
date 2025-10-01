import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Get user profile by userId
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
    return profile;
  },
});

// Create user profile
export const create = mutation({
  args: {
    userId: v.string(),
    age: v.number(),
    sex: v.number(),
    height: v.number(),
    weight: v.number(),
    bmi: v.number(),
    ctsPainDuration: v.number(),
    hasCompletedOnboarding: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const profileId = await ctx.db.insert('userProfiles', args);
    return profileId;
  },
});

// Update user profile
export const update = mutation({
  args: {
    userId: v.string(),
    age: v.optional(v.number()),
    sex: v.optional(v.number()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    bmi: v.optional(v.number()),
    ctsPainDuration: v.optional(v.number()),
    hasCompletedOnboarding: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(profile._id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});
