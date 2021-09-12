import { Controller, Post } from '@overnightjs/core';
import { Response, Request } from 'express';
import { User } from '../models/user';

@Controller('user')
export class UserController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const user = new User(req.body);
    const newUser = await user.save();
    res.status(201).send(newUser);
  }
}