/**
 * ActivityType represents the types of activities tracked in the activity log.
 * - `Answer` an answer to a question.
 * - `Question` a question a user asks.
 * - `Vote` an upvote or a downvote on a question or answer.
 */

export type ActivityType = 'answers' | 'questions' | 'votes';