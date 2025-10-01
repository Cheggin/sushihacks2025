import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  // User profiles with baseline CTS information
  userProfiles: defineTable({
    userId: v.string(), // Unique user identifier
    age: v.number(),
    sex: v.number(), // 0 = male, 1 = female
    height: v.number(), // in cm
    weight: v.number(), // in kg
    bmi: v.number(), // calculated from height/weight
    ctsPainDuration: v.number(), // duration in months, 0 if no pain
    hasCompletedOnboarding: v.boolean(),
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  }).index("by_userId", ["userId"]),

  // CTS risk assessments - one per test taken
  ctsAssessments: defineTable({
    userId: v.string(),
    timestamp: v.number(),

    // Patient data
    age: v.number(),
    bmi: v.number(),
    sex: v.number(), // 0 = male, 1 = female
    duration: v.number(), // symptom duration in months
    nrs: v.number(), // pain rating 0-10
    gripStrength: v.number(), // kg
    pinchStrength: v.number(), // kg

    // Prediction results
    predictedClass: v.string(), // "mild", "moderate", "severe"
    predictedClassNumeric: v.number(), // 0, 1, 2
    probabilities: v.object({
      mild: v.number(),
      moderate: v.number(),
      severe: v.number(),
    }),
    confidence: v.number(),

    // Sensor data metadata
    sensorReadingsCount: v.optional(v.number()),
    sensorCollectionDuration: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_userId_and_timestamp", ["userId", "timestamp"]),
});
