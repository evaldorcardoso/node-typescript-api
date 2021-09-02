import { StormGlass, IForecastPoint } from '@src/clients/stormGlass';

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N',
}

export interface IBeach {
    lat: number;
    lon: number;
    name: string;
    position: BeachPosition;
    user: string;
}

export interface IBeachForecast extends Omit<IBeach, 'user'>, IForecastPoint {}

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) {}

    public async processForecastForBeaches(
        beaches: IBeach[]
    ): Promise<IBeachForecast[]> {
        const pointsWithCorrectSources: IBeachForecast[] = [];
        for (const beach of beaches) {
            const points = await this.stormGlass.fetchPoints(
                beach.lat,
                beach.lon
            );
            const enrichedBeachData = points.map((e) => ({
                ...{
                    lat: beach.lat,
                    lon: beach.lon,
                    name: beach.name,
                    position: beach.position,
                    rating: 1,
                },
                ...e,
            }));
            pointsWithCorrectSources.push(...enrichedBeachData);
        }
        return pointsWithCorrectSources;
    }
}
