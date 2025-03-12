import mongoose from 'mongoose';
import ForumModel from '../../models/forum.model';
import { saveForum, getForumByName } from '../../services/forum.service';
import { DatabaseForum, Forum } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Forum model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveForum', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });
  });
});
