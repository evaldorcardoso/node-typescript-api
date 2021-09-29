import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Beach } from '../models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middlewares/auth';
import logger from '../logger';

@Controller('beach')
@ClassMiddleware(authMiddleware)
export class BeachController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, ...{ user: req.decoded?.id } });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: error.message });
      } else {
        logger.error(error as Error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}
