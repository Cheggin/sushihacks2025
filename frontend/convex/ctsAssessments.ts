import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Get all assessments for a user
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const assessments = await ctx.db
      .query('ctsAssessments')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
    return assessments;
  },
});

// Get assessments within a time range
export const getByUserIdAndTimeRange = query({
  args: {
    userId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const assessments = await ctx.db
      .query('ctsAssessments')
      .withIndex('by_userId_and_timestamp', (q) =>
        q.eq('userId', args.userId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .order('desc')
      .collect();
    return assessments;
  },
});

// Get most recent assessment
export const getMostRecent = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const assessment = await ctx.db
      .query('ctsAssessments')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .first();
    return assessment;
  },
});

// Create new assessment
export const create = mutation({
  args: {
    userId: v.string(),
    timestamp: v.number(),
    age: v.number(),
    bmi: v.number(),
    sex: v.number(),
    duration: v.number(),
    nrs: v.number(),
    gripStrength: v.number(),
    pinchStrength: v.number(),
    predictedClass: v.string(),
    predictedClassNumeric: v.number(),
    probabilities: v.object({
      mild: v.number(),
      moderate: v.number(),
      severe: v.number(),
    }),
    confidence: v.number(),
    sensorReadingsCount: v.optional(v.number()),
    sensorCollectionDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const assessmentId = await ctx.db.insert('ctsAssessments', args);
    return assessmentId;
  },
});

// Delete assessment
export const deleteAssessment = mutation({
  args: { assessmentId: v.id('ctsAssessments') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.assessmentId);
  },
});
