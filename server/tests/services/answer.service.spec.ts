import mongoose from 'mongoose';
import AnswerModel from '../../models/answers.model';
import QuestionModel from '../../models/questions.model';
import {
  saveAnswer,
  addAnswerToQuestion,
  getAllAnswers,
  getAnswerById,
} from '../../services/answer.service';
import { DatabaseAnswer, DatabaseQuestion, PopulatedDatabaseAnswer } from '../../types/types';
import { QUESTIONS, ans1, ans4, unpopAns1, unpopAns2 } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Answer model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveAnswer', () => {
    test('saveAnswer should return the saved answer', async () => {
      const mockAnswer = {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-06'),
        comments: [],
      };
      const mockDBAnswer = {
        ...mockAnswer,
        _id: new mongoose.Types.ObjectId(),
      };

      mockingoose(AnswerModel, 'create').toReturn(mockDBAnswer);

      const result = (await saveAnswer(mockAnswer)) as DatabaseAnswer;

      expect(result._id).toBeDefined();
      expect(result.text).toEqual(mockAnswer.text);
      expect(result.ansBy).toEqual(mockAnswer.ansBy);
      expect(result.ansDateTime).toEqual(mockAnswer.ansDateTime);
    });
  });

  describe('addAnswerToQuestion', () => {
    test('addAnswerToQuestion should return the updated question', async () => {
      const question: DatabaseQuestion = QUESTIONS.filter(
        q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
      )[0];

      jest
        .spyOn(QuestionModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...question, answers: [...question.answers, ans4._id] });

      const result = (await addAnswerToQuestion(
        '65e9b5a995b6c7045a30d823',
        ans4,
      )) as DatabaseQuestion;

      expect(result.answers.length).toEqual(4);
      expect(result.answers).toContain(ans4._id);
    });

    test('addAnswerToQuestion should return an object with error if findOneAndUpdate throws an error', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'findOneAndUpdate');

      const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

      expect(result).toHaveProperty('error');
    });

    test('addAnswerToQuestion should return an object with error if findOneAndUpdate returns null', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

      const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

      expect(result).toHaveProperty('error');
    });

    test('addAnswerToQuestion should throw an error if a required field is missing in the answer', async () => {
      const invalidAnswer: Partial<DatabaseAnswer> = {
        text: 'This is an answer text',
        ansBy: 'user123', // Missing ansDateTime
      };

      const qid = 'validQuestionId';

      expect(addAnswerToQuestion(qid, invalidAnswer as DatabaseAnswer)).resolves.toEqual({
        error: 'Error when adding answer to question',
      });
    });
  });

  describe('getAllAnswers', () => {
    test('The database has answers so we should get all the answers in the dataset', async () => {
      mockingoose(AnswerModel).toReturn([unpopAns1, unpopAns2], 'find');
      QuestionModel.schema.path('comments', Object);

      const allAns = await getAllAnswers();
      expect(allAns).toBeDefined();
      expect(allAns.length).toEqual(2);
      expect(allAns[0]._id.toString()).toEqual(unpopAns1._id.toString());
      expect(allAns[1]._id.toString()).toEqual(unpopAns2._id.toString());
    });

    test('The database has no answers so we should get an empty array', async () => {
      mockingoose(AnswerModel).toReturn([], 'find');

      const allAns = await getAllAnswers();
      expect(allAns).toBeDefined();
      expect(allAns.length).toEqual(0);
    });

    test('The database returns null so we should get an empty array', async () => {
      mockingoose(AnswerModel).toReturn(null, 'find');

      const allAns = await getAllAnswers();
      expect(allAns).toBeDefined();
      expect(allAns.length).toEqual(0);
    });

    test('The database has an error so we should get an empty array', async () => {
      mockingoose(AnswerModel).toReturn(Error('Error in Database'), 'find');

      const allAns = await getAllAnswers();
      expect(allAns).toBeDefined();
      expect(allAns.length).toEqual(0);
    });
  });

  describe('getAnswerById', () => {
    test('Gets the answer given the id', async () => {
      mockingoose(AnswerModel).toReturn(unpopAns1, 'findOne');

      const allAns = await getAnswerById(unpopAns1._id.toString());
      expect(allAns).toBeDefined();
    });

    test('The database returns null so we should get an empty array', async () => {
      mockingoose(AnswerModel).toReturn(null, 'findOne');

      const allAns = await getAnswerById(unpopAns1._id.toString());
      expect(allAns).toHaveProperty('error');
    });

    test('The database has an error so we should get an empty array', async () => {
      mockingoose(AnswerModel).toReturn(Error('Error in Database'), 'findOne');

      const allAns = await getAnswerById(unpopAns1._id.toString());
      expect(allAns).toHaveProperty('error');
    });
  });
});
