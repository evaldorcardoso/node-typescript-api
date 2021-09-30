import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Beach } from '../models/beach';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { BaseController } from '.';

@Controller('beach')
@ClassMiddleware(authMiddleware)
export class BeachController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, ...{ user: req.decoded?.id } });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error as Error);
    }
  }
}
