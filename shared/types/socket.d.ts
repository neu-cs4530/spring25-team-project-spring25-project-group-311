import { PopulatedDatabaseAnswer } from './answer';
import { PopulatedDatabaseChat } from './chat';
import { DatabaseMessage } from './message';
import { DatabaseForum } from './forum';
import { PopulatedDatabaseQuestion } from './question';
import { SafeDatabaseUser } from './user';
import { BaseMove, GameInstance, GameInstanceID, GameMove, GameState } from './game';
import { DatabaseNotification, PopulatedDatabaseNotification } from './notification';

/**
 * Payload for an answer update event.
 * - `qid`: The unique identifier of the question.
 * - `answer`: The updated answer.
 */
export interface AnswerUpdatePayload {
  qid: ObjectId;
  answer: PopulatedDatabaseAnswer;
}

/**
 * Payload for a game state update event.
 * - `gameInstance`: The updated instance of the game.
 */
export interface GameUpdatePayload {
  gameInstance: GameInstance<GameState>;
}

/**
 * Payload for a game operation error event.
 * - `player`: The player ID who caused the error.
 * - `error`: The error message.
 */
export interface GameErrorPayload {
  player: string;
  error: string;
}

/**
 * Payload for a vote update event.
 * - `qid`: The unique identifier of the question.
 * - `upVotes`: An array of usernames who upvoted the question.
 * - `downVotes`: An array of usernames who downvoted the question.
 */
export interface VoteUpdatePayload {
  qid: string;
  upVotes: string[];
  downVotes: string[];
}

/**
 * Payload for a chat update event.
 * - `chat`: The updated chat object.
 * - `type`: The type of update (`'created'`, `'newMessage'`, or `'newParticipant'`).
 */
export interface ChatUpdatePayload {
  chat: PopulatedDatabaseChat;
  type: 'created' | 'newMessage' | 'newParticipant';
}

/**
 * Payload for a comment update event.
 * - `result`: The updated question or answer.
 * - `type`: The type of the updated item (`'question'` or `'answer'`).
 */
export interface CommentUpdatePayload {
  result: PopulatedDatabaseQuestion | PopulatedDatabaseAnswer;
  type: 'question' | 'answer';
}

/**
 * Payload for a message update event.
 * - `msg`: The updated message.
 */
export interface MessageUpdatePayload {
  msg: DatabaseMessage;
}

/**
 * Payload for a user update event.
 * - `user`: The updated user object.
 * - `type`: The type of modification (`'created'`, `'deleted'`, or `'updated'`).
 */
export interface UserUpdatePayload {
  user: SafeDatabaseUser;
  type: 'created' | 'deleted' | 'updated';
}

/**
 * Payload for a forum update event.
 * - `forum`: The updated forum object.
 * - `type`: The type of modification (`'created'`, `'deleted'`, or `'updated'`).
 */
export interface ForumUpdatePayload {
  forum: DatabaseForum;
  type: 'created' | 'deleted' | 'updated';
}

/**
 * Interface representing the payload for a game move operation, which contains:
 * Payload for a notification update event.
 * - `notification`: The updated notification object.
 * - `type`: The type of modification (`'created'`, `'read'`)
 */
export interface NotificationUpdatePayload {
  notification: PopulatedDatabaseNotification;
  type: 'created' | 'read';
}

/**
 * Interface representing the p ayload for a game move operation, which contains:
 * - `gameID`: The ID of the game being played.
 * - `move`: The move being made in the game, defined by `GameMove`.
 */
export interface GameMovePayload {
  gameID: GameInstanceID;
  move: GameMove<BaseMove>;
}

/**
 * Interface representing the events the client can emit to the server.
 * - `makeMove`: Client can emit a move in the game.
 * - `joinGame`: Client can join a game.
 * - `leaveGame`: Client can leave a game.
 * - `joinChat`: Client can join a chat.
 * - `leaveChat`: Client can leave a chat.
 */
export interface ClientToServerEvents {
  makeMove: (move: GameMovePayload) => void;
  joinGame: (gameID: string) => void;
  leaveGame: (gameID: string) => void;
  joinChat: (chatID: string) => void;
  leaveChat: (chatID: string | undefined) => void;
}

/**
 * Interface representing the events the server can emit to the client.
 * - `questionUpdate`: Server sends updated question.
 * - `answerUpdate`: Server sends updated answer.
 * - `viewsUpdate`: Server sends updated views count for a question.
 * - `voteUpdate`: Server sends updated votes for a question.
 * - `commentUpdate`: Server sends updated comment for a question or answer.
 * - `messageUpdate`: Server sends updated message.
 * - `userUpdate`: Server sends updated user status.
 * - `forumUpdate`: Server sends updated forum status.
 * - `gameUpdate`: Server sends updated game state.
 * - `gameError`: Server sends error message related to game operation.
 * - `chatUpdate`: Server sends updated chat.
 */
export interface ServerToClientEvents {
  questionUpdate: (question: PopulatedDatabaseQuestion) => void;
  answerUpdate: (result: AnswerUpdatePayload) => void;
  viewsUpdate: (question: PopulatedDatabaseQuestion) => void;
  voteUpdate: (vote: VoteUpdatePayload) => void;
  commentUpdate: (comment: CommentUpdatePayload) => void;
  messageUpdate: (message: MessageUpdatePayload) => void;
  userUpdate: (user: UserUpdatePayload) => void;
  gameUpdate: (game: GameUpdatePayload) => void;
  gameError: (error: GameErrorPayload) => void;
  chatUpdate: (chat: ChatUpdatePayload) => void;
  notificationUpdate: (notification: NotificationUpdatePayload) => void;
}
