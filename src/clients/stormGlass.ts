import { InternalError } from '../util/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '../util/request';
import { AxiosError } from 'axios';

export interface IStormGlassPointSource {
    [key: string]: number;
}

export interface IStormGlassPoint {
    readonly time: string;
    readonly waveHeight: IStormGlassPointSource;
    readonly waveDirection: IStormGlassPointSource;
    readonly swellDirection: IStormGlassPointSource;
    readonly swellHeight: IStormGlassPointSource;
    readonly swellPeriod: IStormGlassPointSource;
    readonly windDirection: IStormGlassPointSource;
    readonly windSpeed: IStormGlassPointSource;
}

export interface IStormGlassForecastResponse {
    hours: IStormGlassPoint[];
}

export interface IForecastPoint {
    time: string;
    waveHeight: number;
    waveDirection: number;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: number;
    windSpeed: number;
}

export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);
    }
}

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);
    }
}

const stormGlassResourceConfig: IConfig = config.get(
    'App.resources.StormGlass'
);

export class StormGlass {
    readonly stormGlassAPIParams =
        'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource = 'noaa';

    constructor(protected request = new HTTPUtil.Request()) {}

    public async fetchPoints(
        lat: number,
        lng: number
    ): Promise<IForecastPoint[]> {
        try {
            const response =
                await this.request.get<IStormGlassForecastResponse>(
                    `${stormGlassResourceConfig.get(
                        'apiUrl'
                    )}/weather/point?lat=${lat}&lng=${lng}&params=${
                        this.stormGlassAPIParams
                    }&source=${this.stormGlassAPISource}`,
                    {
                        headers: {
                            Authorization:
                                stormGlassResourceConfig.get('apiToken'),
                        },
                    }
                );
            return this.normalizeResponse(response.data);
        } catch (err: unknown) {
            if (HTTPUtil.Request.isRequestError(err as AxiosError)) {
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify(
                        (err as AxiosError).response?.data
                    )} Code: ${(err as AxiosError).response?.status}`
                );
            }

            throw new ClientRequestError((err as Error).message);
        }
    }

    private normalizeResponse(
        points: IStormGlassForecastResponse
    ): IForecastPoint[] {
        return points.hours
            .filter(this.isValidPoint.bind(this))
            .map((point) => ({
                swellDirection: point.swellDirection[this.stormGlassAPISource],
                swellHeight: point.swellHeight[this.stormGlassAPISource],
                swellPeriod: point.swellPeriod[this.stormGlassAPISource],
                time: point.time,
                waveDirection: point.waveDirection[this.stormGlassAPISource],
                waveHeight: point.waveHeight[this.stormGlassAPISource],
                windDirection: point.windDirection[this.stormGlassAPISource],
                windSpeed: point.windSpeed[this.stormGlassAPISource],
            }));
    }

    private isValidPoint(point: Partial<IStormGlassPoint>): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        );
    }
}
