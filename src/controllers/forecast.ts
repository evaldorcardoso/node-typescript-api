import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Beach } from '../models/beach';
import { Forecast } from '../services/forecast';
import { Request, Response } from 'express-serve-static-core';
import { authMiddleware } from '../middlewares/auth';
import logger from '../logger';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      logger.error(error as Error);
      res.status(500).send('Something went wrong');
    }
  }
}
